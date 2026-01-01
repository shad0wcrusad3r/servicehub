// Mock SMS and Email services for development

export interface SMSService {
  sendOTP(phone: string, otp: string): Promise<boolean>;
  sendNotification(phone: string, message: string): Promise<boolean>;
}

export interface EmailService {
  sendWelcome(email: string, name: string): Promise<boolean>;
  sendNotification(email: string, subject: string, message: string): Promise<boolean>;
}

export class MockSMSService implements SMSService {
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    console.log(`📱 [MOCK SMS] Sending OTP to ${phone}: ${otp}`);
    return true;
  }

  async sendNotification(phone: string, message: string): Promise<boolean> {
    console.log(`📱 [MOCK SMS] Notification to ${phone}: ${message}`);
    return true;
  }
}

export class MockEmailService implements EmailService {
  async sendWelcome(email: string, name: string): Promise<boolean> {
    console.log(`📧 [MOCK EMAIL] Welcome email to ${email} for ${name}`);
    return true;
  }

  async sendNotification(email: string, subject: string, message: string): Promise<boolean> {
    console.log(`📧 [MOCK EMAIL] To: ${email}, Subject: ${subject}, Message: ${message}`);
    return true;
  }
}

// Service instances
export const smsService = new MockSMSService();
export const emailService = new MockEmailService();