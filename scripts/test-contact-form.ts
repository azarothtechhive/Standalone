import { config } from 'dotenv';
config();
import { handleContactRequest } from '../api/contact.ts';

async function main() {
  const testEmail = 'test@example.com';
  const testBody = {
    fullName: 'Test User',
    workEmail: testEmail,
    companyName: 'Test Company',
    enquiryAbout: 'Test Enquiry',
    message: 'This is a test message from the contact form.',
    consent: true,
  };

  const request = new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(testBody),
  });

  try {
    const response = await handleContactRequest(request);
    const result = await response.json();
    console.log('RESPONSE_STATUS:', response.status);
    console.log('RESPONSE_BODY:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('ERROR:', (error instanceof Error ? error.message : String(error)));
  }
}

void main();