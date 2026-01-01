import mongoose from 'mongoose';
import { Labour } from '../models/Labour';
import { connectDatabase } from '../config/database';

const migrateApprovalStatus = async () => {
  try {
    await connectDatabase();
    console.log('Connected to database');

    // Update all existing labour records
    const result = await Labour.updateMany(
      { approvalStatus: { $exists: false } },
      [
        {
          $set: {
            approvalStatus: {
              $cond: {
                if: { $eq: ['$isApproved', true] },
                then: 'approved',
                else: 'pending'
              }
            }
          }
        }
      ]
    );

    console.log(`Updated ${result.modifiedCount} labour records with approval status`);
    
    // Show current status distribution
    const statusCounts = await Labour.aggregate([
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Current approval status distribution:');
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateApprovalStatus();