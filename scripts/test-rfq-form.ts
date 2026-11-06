import { config } from 'dotenv';
config();
import { handleRfqRequest } from '../api/rfq.ts';

async function main() {
  const testEmail = 'test@example.com';
  const testBody = {
    solutionCategories: ['web-development'],
    projectScope: 'Test project scope',
    targetTimeline: '3 months',
    budgetRange: '$10k-$50k',
    requirementsDescription: 'This is a test RFQ submission.',
    ndaRequired: false,
    fullName: 'Test User',
    workEmail: testEmail,
    phone: '+1234567890',
    companyName: 'Test Company',
    country: 'US',
  };

  const request = new Request('http://localhost:3000/api/rfq', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(testBody),
  });

  try {
    const response = await handleRfqRequest(request);
    const result = await response.json();
    console.log('RESPONSE_STATUS:', response.status);
    console.log('RESPONSE_BODY:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('ERROR:', (error instanceof Error ? error.message : String(error)));
  }
}

void main();