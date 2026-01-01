import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Labour } from '../models/Labour';
import { Rating } from '../models/Rating';

// Get labour profiles for client browsing
export const getLabourProfiles = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { category, city, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const filter: any = { isApproved: true };
    if (category) filter.categories = category;
    if (city) filter.city = city;

    const labours = await Labour.find(filter)
      .populate('categories', 'name')
      .populate('user', 'phone')
      .sort({ averageRating: -1 }) // Best rated first
      .skip(skip)
      .limit(Number(limit)) as any;

    // Get top 3 recent comments for each labour
    const labourWithComments = await Promise.all(
      labours.map(async (labour: any) => {
        const recentComments = await Rating.find({ 
          labour: labour._id,
          comment: { $exists: true, $ne: '' }
        })
        .populate('client', 'name')
        .sort({ createdAt: -1 })
        .limit(3)
        .select('rating comment createdAt client') as any;

        return {
          id: labour._id,
          name: labour.name,
          categories: labour.categories,
          hourlyRate: labour.hourlyRate,
          city: labour.city,
          averageRating: labour.averageRating,
          ratingCount: labour.ratingCount,
          phone: labour.user.phone,
          recentComments: recentComments.map((comment: any) => ({
            rating: comment.rating,
            comment: comment.comment,
            createdAt: comment.createdAt,
            clientName: comment.client.name,
          }))
        };
      })
    );

    const total = await Labour.countDocuments(filter);

    res.json({
      labours: labourWithComments,
      pagination: {
        current: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get labour profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get labour profile by ID
export const getLabourProfile = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params;

    const labour = await Labour.findById(id)
      .populate('categories', 'name')
      .populate('user', 'phone') as any;

    if (!labour) {
      return res.status(404).json({ error: 'Labour not found' });
    }

    // Get recent ratings with comments
    const ratings = await Rating.find({ labour: labour._id })
      .populate('client', 'name')
      .sort({ createdAt: -1 })
      .limit(10) as any;

    res.json({
      id: labour._id,
      name: labour.name,
      categories: labour.categories,
      hourlyRate: labour.hourlyRate,
      city: labour.city,
      averageRating: labour.averageRating,
      ratingCount: labour.ratingCount,
      isApproved: labour.isApproved,
      phone: labour.user.phone,
      ratings: ratings.map((rating: any) => ({
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.createdAt,
        clientName: rating.client.name,
      }))
    });
  } catch (error) {
    console.error('Get labour profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Get unapproved labours
export const getUnapprovedLabours = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const labours = await Labour.find({ approvalStatus: 'pending' })
      .populate('categories', 'name')
      .populate('user', 'phone')
      .sort({ createdAt: -1 }) as any;

    res.json({
      labours: labours.map((labour: any) => ({
        id: labour._id,
        name: labour.name,
        categories: labour.categories,
        hourlyRate: labour.hourlyRate,
        city: labour.city,
        phone: labour.user.phone,
        createdAt: labour.createdAt,
      }))
    });
  } catch (error) {
    console.error('Get unapproved labours error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Approve/reject labour
export const updateLabourApproval = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const labour = await Labour.findById(id);
    if (!labour) {
      return res.status(404).json({ error: 'Labour not found' });
    }

    // Only allow changes from pending status
    if (labour.approvalStatus !== 'pending') {
      return res.status(400).json({ error: 'Labour has already been processed' });
    }

    labour.isApproved = isApproved;
    labour.approvalStatus = isApproved ? 'approved' : 'rejected';
    await labour.save();

    res.json({
      message: `Labour ${isApproved ? 'approved' : 'rejected'} successfully`,
      labour: {
        id: labour._id,
        name: labour.name,
        isApproved: labour.isApproved,
        approvalStatus: labour.approvalStatus,
      }
    });
  } catch (error) {
    console.error('Update labour approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};