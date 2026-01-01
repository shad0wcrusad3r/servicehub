import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { JobApplication } from '../models/JobApplication';
import { Job } from '../models/Job';
import { Labour } from '../models/Labour';
import { Client } from '../models/Client';
import { User } from '../models/User';
import { emailService } from '../services/mockServices';

// Labour: Submit job application/proposal
export const submitJobApplication = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id: jobId } = req.params;
    const { message } = req.body;

    // Get labour profile
    const labour = await Labour.findOne({ user: req.user!.id }).populate('user', 'phone');
    if (!labour) {
      return res.status(404).json({ error: 'Labour profile not found' });
    }

    if (!labour.isApproved) {
      return res.status(403).json({ error: 'Your profile must be approved to apply for jobs' });
    }

    // Get job
    const job = await Job.findById(jobId).populate('client');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ error: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({ job: jobId, labour: labour._id });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Create application
    const application = new JobApplication({
      job: jobId,
      labour: labour._id,
      message,
      status: 'pending',
    });

    await application.save();

    // Notify client
    const client = await Client.findById(job.client).populate('user', 'email');
    if (client) {
      const clientUser = client.user as any;
      await emailService.sendNotification(
        clientUser.email,
        'New Job Application',
        `${labour.name} has applied for your job "${job.title}". Phone: ${(labour.user as any).phone}`
      );
    }

    const populatedApplication = await JobApplication.findById(application._id)
      .populate('labour', 'name hourlyRate city')
      .populate({
        path: 'labour',
        populate: {
          path: 'user',
          select: 'phone'
        }
      });

    res.status(201).json({
      message: 'Application submitted successfully',
      application: populatedApplication,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }
    console.error('Submit job application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Client: Get applications for a job
export const getJobApplications = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id: jobId } = req.params;

    // Verify client owns the job
    const client = await Client.findOne({ user: req.user!.id });
    if (!client) {
      return res.status(404).json({ error: 'Client profile not found' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!job.client.equals(client._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const applications = await JobApplication.find({ job: jobId })
      .populate({
        path: 'labour',
        select: 'name hourlyRate city averageRating ratingCount categories',
        populate: [
          {
            path: 'user',
            select: 'phone'
          },
          {
            path: 'categories',
            select: 'name'
          }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({
      applications,
      total: applications.length,
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Client: Accept job application
export const acceptJobApplication = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id: applicationId } = req.params;

    const application = await JobApplication.findById(applicationId)
      .populate('job')
      .populate('labour', 'name');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const job = application.job as any;

    // Verify client owns the job
    const client = await Client.findOne({ user: req.user!.id });
    if (!client || !job.client.equals(client._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application has already been processed' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ error: 'Job is no longer open' });
    }

    // Accept application
    application.status = 'accepted';
    application.respondedAt = new Date();
    await application.save();

    // Update job
    job.labour = application.labour;
    job.status = 'in_progress';
    job.acceptedAt = new Date();
    await job.save();

    // Reject all other pending applications for this job
    await JobApplication.updateMany(
      { job: job._id, _id: { $ne: applicationId }, status: 'pending' },
      { status: 'rejected', respondedAt: new Date() }
    );

    // Notify labour
    const labour = await Labour.findById(application.labour).populate('user', 'phone email');
    if (labour) {
      const labourUser = labour.user as any;
      if (labourUser.email) {
        await emailService.sendNotification(
          labourUser.email,
          'Application Accepted',
          `Congratulations! Your application for "${job.title}" has been accepted. Please contact the client to begin work.`
        );
      }
    }

    res.json({
      message: 'Application accepted successfully',
      application,
      job,
    });
  } catch (error) {
    console.error('Accept job application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Client: Reject job application
export const rejectJobApplication = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id: applicationId } = req.params;

    const application = await JobApplication.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const job = application.job as any;

    // Verify client owns the job
    const client = await Client.findOne({ user: req.user!.id });
    if (!client || !job.client.equals(client._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application has already been processed' });
    }

    // Reject application
    application.status = 'rejected';
    application.respondedAt = new Date();
    await application.save();

    res.json({
      message: 'Application rejected',
      application,
    });
  } catch (error) {
    console.error('Reject job application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Labour: Get my applications
export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const labour = await Labour.findOne({ user: req.user!.id });
    if (!labour) {
      return res.status(404).json({ error: 'Labour profile not found' });
    }

    const filter: any = { labour: labour._id };
    if (status) {
      filter.status = status;
    }

    const applications = await JobApplication.find(filter)
      .populate({
        path: 'job',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'client', select: 'name company' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await JobApplication.countDocuments(filter);

    res.json({
      applications,
      pagination: {
        current: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
