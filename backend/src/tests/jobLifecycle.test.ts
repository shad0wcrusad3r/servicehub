import request from 'supertest';
import express from 'express';
import { User } from '../models/User';
import { Client } from '../models/Client';
import { Labour } from '../models/Labour';
import { Category } from '../models/Category';
import { Job } from '../models/Job';
import { JobApplication } from '../models/JobApplication';
import { Rating } from '../models/Rating';
import { generateToken } from '../utils/jwt';
import jobRoutes from '../routes/jobs';
import jobApplicationRoutes from '../routes/jobApplications';

const app = express();
app.use(express.json());
app.use('/api/jobs', jobRoutes);
app.use('/api/jobs', jobApplicationRoutes);

describe('Job Lifecycle', () => {
  let clientUser: any;
  let labourUser: any;
  let client: any;
  let labour: any;
  let category: any;
  let clientToken: string;
  let labourToken: string;

  beforeEach(async () => {
    // Create test data
    clientUser = await User.create({
      email: 'client@test.com',
      password: 'password123',
      role: 'client',
      isVerified: true,
    });

    labourUser = await User.create({
      phone: '+919876543210',
      password: 'password123',
      role: 'labour',
      isVerified: true,
    });

    category = await Category.create({
      name: 'Plumbing',
      isActive: true,
    });

    client = await Client.create({
      user: clientUser._id,
      name: 'Test Client',
    });

    labour = await Labour.create({
      user: labourUser._id,
      name: 'Test Labour',
      categories: [category._id],
      hourlyRate: 150,
      city: 'Hubli',
      isApproved: true,
    });

    clientToken = generateToken({ id: clientUser._id.toString(), role: 'client' });
    labourToken = generateToken({ id: labourUser._id.toString(), role: 'labour' });
  });

  it('should complete full job lifecycle', async () => {
    // 1. Client creates job
    const createJobResponse = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Fix bathroom sink',
        description: 'Sink is clogged and needs fixing',
        category: category._id,
        city: 'Hubli',
        estimatedHours: 2,
      });

    expect(createJobResponse.status).toBe(201);
    expect(createJobResponse.body.job.status).toBe('open');

    const jobId = createJobResponse.body.job._id;

    // 2. Labour submits application for job
    const applyResponse = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Authorization', `Bearer ${labourToken}`)
      .send({
        message: 'I am experienced in plumbing work.'
      });

    expect(applyResponse.status).toBe(201);
    const applicationId = applyResponse.body.application._id;

    // 3. Client accepts the application
    const acceptApplicationResponse = await request(app)
      .patch(`/api/jobs/applications/${applicationId}/accept`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(acceptApplicationResponse.status).toBe(200);
    expect(acceptApplicationResponse.body.job.status).toBe('in_progress');

    // 4. Client marks work done
    const markDoneResponse = await request(app)
      .patch(`/api/jobs/${jobId}/work-done`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(markDoneResponse.status).toBe(200);
    expect(markDoneResponse.body.job.status).toBe('awaiting_completion');

    // 5. Labour marks payment received
    const paymentResponse = await request(app)
      .patch(`/api/jobs/${jobId}/payment-received`)
      .set('Authorization', `Bearer ${labourToken}`);

    expect(paymentResponse.status).toBe(200);
    expect(paymentResponse.body.job.status).toBe('completed');

    // 6. Client rates the completed job
    const rateJobResponse = await request(app)
      .post(`/api/jobs/${jobId}/rate`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        rating: 5,
        comment: 'Excellent work!',
      });

    expect(rateJobResponse.status).toBe(200);
    expect(rateJobResponse.body.job.status).toBe('completed');

    // Verify rating was created
    const rating = await Rating.findOne({ job: jobId });
    expect(rating).toBeTruthy();
    expect(rating?.rating).toBe(5);
    expect(rating?.comment).toBe('Excellent work!');

    // Verify labour rating was updated
    const updatedLabour = await Labour.findById(labour._id);
    expect(updatedLabour?.ratingCount).toBe(1);
    expect(updatedLabour?.averageRating).toBe(5);
  });

  it('should validate status transitions', async () => {
    // Create a job
    const job = await Job.create({
      client: client._id,
      category: category._id,
      title: 'Test job',
      description: 'Test description',
      city: 'Hubli',
      hourlyRate: 150,
      estimatedHours: 2,
      status: 'open',
    });

    // Try to mark work done without accepting first (should fail)
    const invalidTransition = await request(app)
      .patch(`/api/jobs/${job._id}/work-done`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(invalidTransition.status).toBe(400);
  });
});