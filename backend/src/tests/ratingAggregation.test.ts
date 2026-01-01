import { User } from '../models/User';
import { Client } from '../models/Client';
import { Labour } from '../models/Labour';
import { Category } from '../models/Category';
import { Job } from '../models/Job';
import { Rating } from '../models/Rating';

describe('Rating Aggregation', () => {
  let client: any;
  let labour: any;
  let category: any;

  beforeEach(async () => {
    // Create test users
    const clientUser = await User.create({
      email: 'client@test.com',
      password: 'password123',
      role: 'client',
      isVerified: true,
    });

    const labourUser = await User.create({
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
      totalRating: 0,
      ratingCount: 0,
      averageRating: 0,
    });
  });

  it('should correctly aggregate ratings', async () => {
    // Create completed jobs
    const jobs = await Job.create([
      {
        client: client._id,
        labour: labour._id,
        category: category._id,
        title: 'Job 1',
        description: 'Description 1',
        city: 'Hubli',
        hourlyRate: 150,
        estimatedHours: 2,
        status: 'completed',
      },
      {
        client: client._id,
        labour: labour._id,
        category: category._id,
        title: 'Job 2',
        description: 'Description 2',
        city: 'Hubli',
        hourlyRate: 150,
        estimatedHours: 3,
        status: 'completed',
      },
      {
        client: client._id,
        labour: labour._id,
        category: category._id,
        title: 'Job 3',
        description: 'Description 3',
        city: 'Hubli',
        hourlyRate: 150,
        estimatedHours: 1,
        status: 'completed',
      },
    ]);

    // Add ratings
    const ratings = [5, 4, 3];
    
    for (let i = 0; i < jobs.length; i++) {
      await Rating.create({
        job: jobs[i]._id,
        client: client._id,
        labour: labour._id,
        rating: ratings[i],
        comment: `Rating ${ratings[i]}`,
      });

      // Update labour rating manually (simulating the controller logic)
      const updatedLabour = await Labour.findById(labour._id);
      if (updatedLabour) {
        updatedLabour.totalRating += ratings[i];
        updatedLabour.ratingCount += 1;
        updatedLabour.averageRating = updatedLabour.totalRating / updatedLabour.ratingCount;
        await updatedLabour.save();
      }
    }

    // Verify final ratings
    const finalLabour = await Labour.findById(labour._id);
    expect(finalLabour?.totalRating).toBe(12); // 5 + 4 + 3
    expect(finalLabour?.ratingCount).toBe(3);
    expect(finalLabour?.averageRating).toBe(4); // 12 / 3

    // Test getting recent comments
    const recentRatings = await Rating.find({ labour: labour._id })
      .populate('client', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    expect(recentRatings).toHaveLength(3);
    expect(recentRatings[0].rating).toBe(3); // Most recent (last created)
    expect(recentRatings[2].rating).toBe(5); // Oldest (first created)
  });

  it('should handle single rating correctly', async () => {
    const job = await Job.create({
      client: client._id,
      labour: labour._id,
      category: category._id,
      title: 'Single Job',
      description: 'Single Description',
      city: 'Hubli',
      hourlyRate: 150,
      estimatedHours: 2,
      status: 'completed',
    });

    await Rating.create({
      job: job._id,
      client: client._id,
      labour: labour._id,
      rating: 5,
      comment: 'Perfect work!',
    });

    // Update labour rating
    const updatedLabour = await Labour.findById(labour._id);
    if (updatedLabour) {
      updatedLabour.totalRating += 5;
      updatedLabour.ratingCount += 1;
      updatedLabour.averageRating = updatedLabour.totalRating / updatedLabour.ratingCount;
      await updatedLabour.save();
    }

    const finalLabour = await Labour.findById(labour._id);
    expect(finalLabour?.totalRating).toBe(5);
    expect(finalLabour?.ratingCount).toBe(1);
    expect(finalLabour?.averageRating).toBe(5);
  });
});