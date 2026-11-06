import React, { useState } from 'react';
import { Quote, Star } from 'lucide-react';
import { CmsTestimonial } from '../../services/cmsService';

interface TestimonialCardProps {
  testimonial: CmsTestimonial;
  featured?: boolean;
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase() || 'AZ';

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  featured = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const rating = Math.max(0, Math.min(5, Math.round(testimonial.rating || 0)));
  const showInitials = !testimonial.avatarUrl || imageFailed;

  return (
    <article
      className="testimonial-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.75rem',
        borderRadius: '18px',
        border: featured
          ? '1px solid rgba(73, 36, 63, 0.28)'
          : '1px solid rgba(73, 36, 63, 0.12)',
        backgroundColor: featured ? '#FDF9F7' : '#FFFFFF',
        boxShadow: featured
          ? '0 12px 30px rgba(73, 36, 63, 0.1)'
          : '0 4px 20px rgba(0, 0, 0, 0.05)',
        transition: 'all 240ms ease-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(73, 36, 63, 0.08)',
            color: 'var(--color-primary, #49243F)',
          }}
          aria-hidden="true"
        >
          <Quote size={24} />
        </div>

        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}
          role="img"
          aria-label={`${rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={15}
              aria-hidden="true"
              fill={index < rating ? '#C99B52' : 'transparent'}
              color={index < rating ? '#C99B52' : '#CBD5E1'}
            />
          ))}
        </div>
      </div>

      <blockquote
        style={{
          flexGrow: 1,
          margin: 0,
          marginBottom: '1.5rem',
          fontSize: '1rem',
          lineHeight: 1.7,
          color: 'var(--color-text-secondary, #334155)',
          fontStyle: 'italic',
        }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          paddingTop: '1.125rem',
          borderTop: '1px solid rgba(73, 36, 63, 0.1)',
        }}
      >
        {showInitials ? (
          <div
            role="img"
            aria-label={testimonial.clientName}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3rem',
              height: '3rem',
              flexShrink: 0,
              borderRadius: '50%',
              background: 'var(--gradient-button, linear-gradient(135deg, #49243F 0%, #8A315D 100%))',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {getInitials(testimonial.clientName)}
          </div>
        ) : (
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.clientName}
            loading="lazy"
            onError={() => setImageFailed(true)}
            style={{
              width: '3rem',
              height: '3rem',
              flexShrink: 0,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
        )}

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #1E293B)',
            }}
          >
            {testimonial.clientName}
          </div>
          <div
            style={{
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              color: 'var(--color-text-muted, #64748B)',
            }}
          >
            {[testimonial.role, testimonial.organization].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>
    </article>
  );
};

export default TestimonialCard;
