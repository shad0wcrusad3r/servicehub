import { Request, Response } from 'express';
import { Job } from '../models/Job';

// Mock payment endpoint
export const mockPayment = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { jobId, amount, paymentMethod = 'mock' } = req.body;

    // Validate job exists and is in work_done status
    const job = await Job.findById(jobId)
      .populate('client', 'name')
      .populate('labour', 'name') as any;

    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }

    if (job.status !== 'work_done') {
      return res.status(400).json({ 
        success: false,
        error: 'Job is not ready for payment' 
      });
    }

    const expectedAmount = job.hourlyRate * job.estimatedHours;
    
    if (amount !== expectedAmount) {
      return res.status(400).json({ 
        success: false,
        error: `Amount mismatch. Expected: ₹${expectedAmount}, Received: ₹${amount}` 
      });
    }

    // Mock payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate payment success (95% success rate)
    const isSuccess = Math.random() > 0.05;

    if (!isSuccess) {
      return res.status(400).json({
        success: false,
        error: 'Payment failed. Please try again.',
        transactionId: null,
      });
    }

    // Generate mock transaction ID
    const transactionId = `MOCK_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`💰 [MOCK PAYMENT] Success!`);
    console.log(`   Job: ${job.title}`);
    console.log(`   From: ${job.client.name}`);
    console.log(`   To: ${job.labour.name}`);
    console.log(`   Amount: ₹${amount}`);
    console.log(`   Transaction ID: ${transactionId}`);
    console.log(`   Method: ${paymentMethod}`);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      transactionId,
      amount,
      job: {
        id: job._id,
        title: job.title,
        client: job.client.name,
        labour: job.labour.name,
      },
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Mock payment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment processing failed' 
    });
  }
};