import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';
import { Labour } from '../models/Labour';
import { Client } from '../models/Client';
import { Category } from '../models/Category';
import { Job } from '../models/Job';
import { Rating } from '../models/Rating';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Labour.deleteMany({}),
      Client.deleteMany({}),
      Category.deleteMany({}),
      Job.deleteMany({}),
      Rating.deleteMany({}),
    ]);

    console.log('🗑️  Cleared existing data');

    // Create categories
    const categories = await Category.create([
      { name: 'Plumbing', description: 'Water pipes, drainage, and fixtures' },
      { name: 'Electrical', description: 'Wiring, installations, and repairs' },
      { name: 'Carpentry', description: 'Wood work, furniture, and repairs' },
      { name: 'Painting', description: 'Interior and exterior painting' },
      { name: 'Cleaning', description: 'House and office cleaning services' },
      { name: 'Gardening', description: 'Garden maintenance and landscaping' },
      { name: 'Construction', description: 'Building and renovation work' },
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@portal.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    });

    console.log('✅ Created admin user');

    // Create client users
    const clientUsers = await User.create([
      {
        email: 'client@example.com',
        phone: '+919876543210',
        password: 'client123',
        role: 'client',
        isVerified: true,
      },
      {
        email: 'john@company.com',
        phone: '+919876543211',
        password: 'john123',
        role: 'client',
        isVerified: true,
      },
    ]);

    // Create client profiles
    const clients = await Client.create([
      {
        user: clientUsers[0]._id,
        name: 'Test Client',
        company: 'Test Company',
      },
      {
        user: clientUsers[1]._id,
        name: 'John Doe',
        company: 'Tech Solutions',
      },
    ]);

    console.log(`✅ Created ${clients.length} clients`);

    // Create labour users
    const labourUsers = await User.create([
      {
        phone: '+919876543220',
        password: 'labour123',
        role: 'labour',
        isVerified: true,
      },
      {
        phone: '+919876543221',
        password: 'labour123',
        role: 'labour',
        isVerified: true,
      },
      {
        phone: '+919876543222',
        password: 'labour123',
        role: 'labour',
        isVerified: true,
      },
      {
        phone: '+919876543223',
        password: 'labour123',
        role: 'labour',
        isVerified: true,
      },
    ]);

    // Create labour profiles
    const labours = await Labour.create([
      {
        user: labourUsers[0]._id,
        name: 'Ravi Kumar',
        categories: [categories[0]._id, categories[1]._id], // Plumbing, Electrical
        hourlyRate: 150,
        city: 'Hubli',
        isApproved: true,
        totalRating: 20,
        ratingCount: 5,
        averageRating: 4.0,
      },
      {
        user: labourUsers[1]._id,
        name: 'Suresh Patel',
        categories: [categories[2]._id], // Carpentry
        hourlyRate: 200,
        city: 'Dharwad',
        isApproved: true,
        totalRating: 22,
        ratingCount: 5,
        averageRating: 4.4,
      },
      {
        user: labourUsers[2]._id,
        name: 'Amit Singh',
        categories: [categories[3]._id, categories[4]._id], // Painting, Cleaning
        hourlyRate: 120,
        city: 'Hubli',
        isApproved: false, // Unapproved for testing
        totalRating: 0,
        ratingCount: 0,
        averageRating: 0,
      },
      {
        user: labourUsers[3]._id,
        name: 'Prakash Joshi',
        categories: [categories[5]._id, categories[6]._id], // Gardening, Construction
        hourlyRate: 180,
        city: 'Dharwad',
        isApproved: true,
        totalRating: 18,
        ratingCount: 4,
        averageRating: 4.5,
      },
    ]);

    console.log(`✅ Created ${labours.length} labours (${labours.filter(l => l.isApproved).length} approved)`);

    // Create sample jobs
    const jobs = await Job.create([
      {
        client: clients[0]._id,
        labour: labours[0]._id,
        category: categories[0]._id,
        title: 'Fix kitchen sink leak',
        description: 'Kitchen sink is leaking from the faucet. Need urgent repair.',
        city: 'Hubli',
        hourlyRate: 150,
        estimatedHours: 2,
        status: 'completed',
        acceptedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        workCompletedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        paymentReceivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        client: clients[1]._id,
        labour: labours[1]._id,
        category: categories[2]._id,
        title: 'Build custom bookshelf',
        description: 'Need a custom wooden bookshelf for the office.',
        city: 'Dharwad',
        hourlyRate: 200,
        estimatedHours: 8,
        status: 'awaiting_completion',
        acceptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        workCompletedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        client: clients[0]._id,
        category: categories[3]._id,
        title: 'Paint living room walls',
        description: 'Paint the living room walls with premium paint.',
        city: 'Hubli',
        hourlyRate: 120,
        estimatedHours: 6,
        status: 'open',
      },
    ]);

    console.log(`✅ Created ${jobs.length} sample jobs`);

    // Create sample ratings for completed jobs
    await Rating.create([
      {
        job: jobs[0]._id,
        client: clients[0]._id,
        labour: labours[0]._id,
        rating: 4,
        comment: 'Good work, fixed the leak quickly.',
      },
    ]);

    console.log('✅ Created sample ratings');

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Default users:');
    console.log('Admin: admin@portal.com / admin123');
    console.log('Client: client@example.com / client123');
    console.log('Labour: +919876543220 / labour123 (OTP: 1234)');
    console.log('\n🏷️  Categories:', categories.map(c => c.name).join(', '));

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeding
const runSeed = async () => {
  try {
    await connectDatabase();
    await seedData();
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Seed script failed:', error);
    process.exit(1);
  }
};

// Only run if called directly
if (require.main === module) {
  runSeed();
}

export { seedData };