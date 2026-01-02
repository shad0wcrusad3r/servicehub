import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Rating } from '../models/Rating';
import { Labour } from '../models/Labour';
import { Job } from '../models/Job';

// Get ratings for a specific labour
export const getLabourRatings = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { labourId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Verify labour exists
    const labour = await Labour.findById(labourId);
    if (!labour) {
      return res.status(404).json({ error: 'Labour not found' });
    }

    const ratings = await Rating.find({ labour: labourId })
      .populate('client', 'name')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Rating.countDocuments({ labour: labourId });

    res.json({
      ratings,
      labour: {
        averageRating: labour.averageRating,
        ratingCount: labour.ratingCount,
      },
      pagination: {
        current: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get labour ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get rating for a specific job
export const getJobRating = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { jobId } = req.params;

    const rating = await Rating.findOne({ job: jobId })
      .populate('client', 'name')
      .populate('labour', 'name');

    if (!rating) {
      return res.status(404).json({ error: 'Rating not found for this job' });
    }

    res.json({ rating });
  } catch (error) {
    console.error('Get job rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all ratings by a specific client
export const getClientRatings = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // This endpoint should be accessible by the client themselves
    // We'll get the client from the authenticated user
    const ratings = await Rating.find({ client: req.params.clientId })
      .populate('labour', 'name')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Rating.countDocuments({ client: req.params.clientId });

    res.json({
      ratings,
      pagination: {
        current: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get client ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get rating statistics for a labour
export const getLabourRatingStats = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { labourId } = req.params;

    const labour = await Labour.findById(labourId);
    if (!labour) {
      return res.status(404).json({ error: 'Labour not found' });
    }

    // Get rating distribution
    const ratings = await Rating.find({ labour: labourId });
    
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratings.forEach(rating => {
      distribution[rating.rating as keyof typeof distribution]++;
    });

    res.json({
      averageRating: labour.averageRating,
      totalRatings: labour.ratingCount,
      distribution,
    });
  } catch (error) {
    console.error('Get labour rating stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
