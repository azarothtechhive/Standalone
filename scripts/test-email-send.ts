import { config } from 'dotenv';
config();
import { sendTransactionalEmailWithRetry } from '../src/server/services/emailService';

async function main() {
  try {
    const result = await sendTransactionalEmailWithRetry({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email</p>',
      text: 'This is a test email'
    });
    console.log('SEND_RESULT:', JSON.stringify(result));
  } catch (error) {
    console.error('SEND_ERROR:', (error instanceof Error ? error.message : String(error)));
  }
}

void main();