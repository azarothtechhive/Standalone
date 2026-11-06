import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND,
  generateReferenceId,
  validateEmail,
  renderEmailTemplate,
  FormSubmissionRecord,
} from '../src/server/services/emailService';

describe('End-to-End Email Workflow Test Suite', () => {
  it('should verify official luxury brand palette constants (zero navy/blue tokens)', () => {
    assert.equal(BRAND.plum, '#49243F', 'BRAND.plum must be #49243F');
    assert.equal(BRAND.deepPlum, '#8A315D', 'BRAND.deepPlum must be #8A315D');
    assert.equal(BRAND.cream, '#FAF8F4', 'BRAND.cream must be #FAF8F4');
    assert.equal(BRAND.softCream, '#F1EBE3', 'BRAND.softCream must be #F1EBE3');
    assert.equal(BRAND.antiqueGold, '#C99B52', 'BRAND.antiqueGold must be #C99B52');

    // Ensure no navy / blue values
    const allBrandValues = Object.values(BRAND).map((v) => v.toLowerCase());
    const forbiddenBlues = ['#0f172a', '#1e293b', '#1e3a8a', '#2563eb', '#3b82f6', '#0284c7'];
    for (const blue of forbiddenBlues) {
      assert.ok(
        !allBrandValues.includes(blue),
        `Brand palette should not contain forbidden blue token: ${blue}`
      );
    }
  });

  it('should generate valid standardized reference IDs for INQ and RFQ', () => {
    const mockUuid = 'c8b417e2-89b2-4d57-9d7a-d02f5e714151';

    const inqRef = generateReferenceId('INQ', mockUuid);
    assert.match(inqRef, /^AZR-INQ-[A-Z0-9]{8}$/);
    assert.equal(inqRef, 'AZR-INQ-C8B417E2');

    const rfqRef = generateReferenceId('RFQ', mockUuid);
    assert.match(rfqRef, /^AZR-RFQ-[A-Z0-9]{8}$/);
    assert.equal(rfqRef, 'AZR-RFQ-C8B417E2');
  });

  it('should correctly validate email addresses', () => {
    assert.equal(validateEmail('client@enterprise.com'), true);
    assert.equal(validateEmail('first.last@fintech-group.co.uk'), true);
    assert.equal(validateEmail('invalid-email'), false);
    assert.equal(validateEmail('client@'), false);
    assert.equal(validateEmail('@domain.com'), false);
    assert.equal(validateEmail('   '), false);
  });

  it('should render email templates with correct brand colors and never render undefined logoUrl', () => {
    // 1. Render without logoUrl (should use fallback, never render undefined)
    const htmlNoLogo = renderEmailTemplate({
      title: 'Enquiry Received',
      preheader: 'We have received your enquiry',
      headerText: 'Enquiry Received',
      bodyHtml: '<p>Thank you for reaching out to Azaroth Tech-Hive. Reference ID: AZR-INQ-12345678</p>',
      footerNote: 'Azaroth Engineering Support',
    });

    assert.ok(htmlNoLogo.includes('#49243F'), 'Should include primary plum color');
    assert.ok(htmlNoLogo.includes('#C99B52'), 'Should include antique gold color');
    assert.ok(!htmlNoLogo.includes('src="undefined"'), 'Should never contain src="undefined"');
    assert.ok(htmlNoLogo.includes('AZR-INQ-12345678'), 'Should include reference ID in template');

    // 2. Render with explicit custom logoUrl
    const customLogoUrl = 'https://assets.azaroth-techhive.com/custom-logo.png';
    const htmlWithLogo = renderEmailTemplate({
      title: 'Quote Confirmation',
      preheader: 'Your quote request has been logged',
      headerText: 'Quote Confirmation',
      bodyHtml: '<p>Our engineering leads are reviewing your architecture requirements. Reference ID: AZR-RFQ-98765432</p>',
      footerNote: 'Azaroth Architecture Desk',
      logoUrl: customLogoUrl,
    });

    assert.ok(htmlWithLogo.includes(customLogoUrl), 'Should include explicit custom logoUrl');
    assert.ok(!htmlWithLogo.includes('src="undefined"'));
    assert.ok(htmlWithLogo.includes('AZR-RFQ-98765432'));
  });

  it('should verify rendered emails contain zero forbidden legacy navy or blue tokens', () => {
    const rendered = renderEmailTemplate({
      title: 'Test Notification',
      preheader: 'Test Preheader',
      headerText: 'Test Notification',
      bodyHtml: '<p>Enquiry body test. Reference ID: AZR-INQ-TEST0001</p>',
      footerNote: 'Azaroth Engineering Support',
    });

    const forbiddenTokens = ['#0F172A', '#1E293B', '#1E3A8A', '#2563EB', '#3B82F6'];
    for (const token of forbiddenTokens) {
      assert.ok(
        !rendered.includes(token),
        `Rendered template should not contain forbidden token: ${token}`
      );
    }
  });

  it('should verify complete FormSubmissionRecord structure for both Contact and RFQ submissions', () => {
    const contactRecord: FormSubmissionRecord = {
      id: 'contact-test-001',
      full_name: 'Alexander Wright',
      work_email: 'a.wright@globalliquidity.com',
      phone: '+91 6379480931',
      company_name: 'Global Liquidity Corp',
      subject_or_product: 'Core Banking Ledger Engineering',
      message: 'Need high-throughput distributed ledger deployment.',
      inquiry_type: 'general',
      created_at: new Date().toISOString(),
    };

    const rfqRecord: FormSubmissionRecord = {
      id: 'rfq-test-002',
      full_name: 'Elena Rostova',
      work_email: 'elena@apexcapital.sg',
      phone: '+65 6789 0123',
      company_name: 'Apex Capital Partners',
      subject_or_product: 'White-Label Crypto Exchange',
      deployment_or_size: 'Q2 2027 / Full Enterprise Deployment',
      message: 'Looking for multi-jurisdictional compliance and HSM custody.',
      inquiry_type: 'product',
      created_at: new Date().toISOString(),
    };

    const contactRef = generateReferenceId('INQ', contactRecord.id);
    const rfqRef = generateReferenceId('RFQ', rfqRecord.id);

    assert.equal(contactRef, 'AZR-INQ-CONTACTT');
    assert.equal(rfqRef, 'AZR-RFQ-RFQTEST0');
  });
});
