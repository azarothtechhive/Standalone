import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

interface FaqItem {
  question: string;
  answer: string;
}

const CONTACT_FAQS: FaqItem[] = [
  {
    question: 'How quickly will I hear back?',
    answer:
      'Every enquiry is reviewed by a solution architect, not a sales queue. We reply within one business day with next steps or a short list of clarifying questions.',
  },
  {
    question: 'What happens after I submit the form?',
    answer:
      'We schedule a 30-minute discovery call to understand your goals, systems, and constraints. From there you receive a scoped recommendation with timelines and an indicative budget.',
  },
  {
    question: 'Can we sign an NDA before sharing details?',
    answer:
      'Yes. We can execute a mutual NDA before any technical discovery. Everything shared with us is treated as confidential by default.',
  },
  {
    question: 'Can I attach an RFP or architecture document?',
    answer:
      'Yes. Use the supporting documents field for RFPs, RFQs, architecture diagrams, or specifications. Accepted formats are PDF, DOCX, XLSX, PNG, JPG, and ZIP up to 15 MB per file.',
  },
  {
    question: 'Do you work with clients outside India?',
    answer:
      'Yes. Our delivery hub is in Chennai and we partner with teams worldwide. Discovery, architecture reviews, and sprint ceremonies run remotely across time zones.',
  },
];

export const ContactFaq: React.FC = () => {
  const { pages } = useCMS();
  const connectPage = pages['connect'] || {};
  const faqHeading = connectPage.faqHeading || 'Frequently Asked Questions';
  const activeFaqs: FaqItem[] =
    Array.isArray(connectPage.faqs) && connectPage.faqs.length > 0
      ? connectPage.faqs
      : CONTACT_FAQS;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="contact-faq">
      <h3 className="contact-faq-heading">{faqHeading}</h3>

      <ul className="contact-faq-list">
        {activeFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const answerId = `contact-faq-answer-${index}`;

          return (
            <li key={faq.question || index} className="contact-faq-item">
              <button
                type="button"
                className="contact-faq-question"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggle(index)}
              >
                <span>{faq.question}</span>
                <Plus
                  size={17}
                  aria-hidden="true"
                  className={`contact-faq-icon${isOpen ? ' is-open' : ''}`}
                />
              </button>

              {isOpen && (
                <p id={answerId} className="contact-faq-answer">
                  {faq.answer}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <style>{`
        .contact-faq {
          margin-top: 0.5rem;
        }

        .contact-faq-heading {
          margin: 0 0 0.875rem;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          letter-spacing: -0.01em;
        }

        .contact-faq-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .contact-faq-item {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
        }

        .contact-faq-question {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          width: 100%;
          padding: 0.9rem 1rem;
          border: 0;
          background: transparent;
          color: #1e293b;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }

        .contact-faq-question:hover {
          color: #49243f;
        }

        .contact-faq-icon {
          flex: 0 0 auto;
          color: #49243f;
          transition: transform 180ms ease;
        }

        .contact-faq-icon.is-open {
          transform: rotate(45deg);
        }

        .contact-faq-answer {
          margin: 0;
          padding: 0 1rem 1rem;
          color: #64748b;
          font-family: var(--font-body);
          font-size: 0.84375rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default ContactFaq;
