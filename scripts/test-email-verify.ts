import { config } from 'dotenv';
config();
console.log('BREVO_API_KEY present:', !!process.env.BREVO_API_KEY);
console.log('BREVO_API_KEY prefix:', process.env.BREVO_API_KEY?.slice(0, 20));
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);

const { verifyEmailProvider } = await import('../src/server/services/emailService');

async function main() {
  try {
    const result = await verifyEmailProvider();
    console.log('VERIFICATION_RESULT=' + JSON.stringify(result));
  } catch (error) {
    console.error('VERIFICATION_ERROR=' + (error instanceof Error ? error.message : String(error)));
  }
}

void main();
