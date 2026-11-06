import React from 'react';
import { ArrowRight, Check, Compass, Layers, Users } from 'lucide-react';
import { engagementModels } from '../../data/servicesData';
import { Button } from '../common/Button';

const modelIcon = (id: string) => {
  switch (id) {
    case 'dedicated-engineering-pod':
      return <Users size={20} />;
    case 'advisory-architecture-retainer':
      return <Compass size={20} />;
    default:
      return <Layers size={20} />;
  }
};

export const SlaMatrix: React.FC = () => {
  return (
    <section
      id="engagement-models"
      className="section engagement-section"
      style={{ scrollMarginTop: '6rem' }}
    >
      <div className="container">
        <div className="engagement-head">
          <div className="engagement-kicker">
            <Layers size={16} />
            <span>Engagement Models</span>
          </div>
          <h2 className="engagement-title">Transparent engagement models</h2>
          <p className="engagement-copy">
            The commercial shape of an engagement should be as clear as the
            technical one. These are the three models we work within. The final
            scope, team, and terms are defined in a written agreement before
            work begins.
          </p>
        </div>

        <div className="engagement-grid">
          {engagementModels.map((model, index) => (
            <div
              key={model.id}
              className={`engagement-card${model.highlight ? ' engagement-card--highlight' : ''}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {model.highlight && (
                <div className="engagement-badge">Common starting point</div>
              )}

              <div className="engagement-card-top">
                <span className="engagement-icon">{modelIcon(model.id)}</span>
                <span className="engagement-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3>{model.name}</h3>
              <p className="engagement-summary">{model.summary}</p>

              <div className="engagement-best">
                <span>Best for</span>
                <p>{model.bestFor}</p>
              </div>

              <div className="engagement-rows">
                {[
                  { label: 'Structure', value: model.structure },
                  { label: 'Team', value: model.team },
                  { label: 'Governance', value: model.governance },
                  { label: 'Support', value: model.support },
                ].map((row) => (
                  <div key={row.label} className="engagement-row">
                    <span className="engagement-row-check">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <div>
                      <span className="engagement-row-label">{row.label}</span>
                      <p>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                to="/connect-with-us"
                variant="primary"
                size="md"
                className="engagement-button"
                icon={<ArrowRight size={16} />}
              >
                Discuss This Model
              </Button>
            </div>
          ))}
        </div>

        <p className="engagement-note">
          Not sure which model fits? Tell us the outcome you need and we will
          recommend the simplest structure that supports it.
        </p>
      </div>

      <style>{`
        .engagement-section {
          background-color: #F8FAFC;
          padding: clamp(3rem, 7vw, 5rem) 0;
        }

        .engagement-head {
          text-align: left;
          max-width: none;
          margin: 0 0 2.75rem;
        }

        .engagement-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #49243F;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 0.9rem;
        }

        .engagement-title {
          font-size: clamp(1.65rem, 2.8vw, 2.15rem);
          font-weight: 600;
          color: #1E293B;
          background-image: var(--gradient-heading);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.25;
          letter-spacing: -0.02em;
          margin-bottom: 0.85rem;
        }

        .engagement-copy {
          font-size: 0.95rem;
          color: #64748B;
          line-height: 1.65;
        }

        .engagement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
          gap: 1.5rem;
          align-items: stretch;
          max-width: 1160px;
          margin: 0 auto;
        }

        .engagement-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background-color: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 1.35rem;
          padding: 1.75rem 1.6rem;
          box-shadow: 0 6px 22px -12px rgba(15, 23, 42, 0.1);
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }

        .engagement-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -18px rgba(73, 36, 63, 0.22);
          border-color: rgba(73, 36, 63, 0.24);
        }

        .engagement-card--highlight {
          border: 2px solid #49243F;
          box-shadow: 0 20px 45px -18px rgba(73, 36, 63, 0.3);
        }

        .engagement-badge {
          position: absolute;
          top: -13px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          background-color: #49243F;
          color: #FFFFFF;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.35rem 0.8rem;
          border-radius: 9999px;
          box-shadow: 0 4px 14px rgba(73, 36, 63, 0.3);
        }

        .engagement-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .engagement-icon {
          width: 2.7rem;
          height: 2.7rem;
          border-radius: 0.75rem;
          background: rgba(73, 36, 63, 0.08);
          color: #49243F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .engagement-index {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #94A3B8;
        }

        .engagement-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1E293B;
          line-height: 1.3;
          margin-bottom: 0.5rem;
        }

        .engagement-summary {
          font-size: 0.875rem;
          color: #64748B;
          line-height: 1.62;
          margin-bottom: 1.1rem;
        }

        .engagement-best {
          background: rgba(201, 155, 82, 0.1);
          border: 1px solid rgba(201, 155, 82, 0.26);
          border-radius: 0.75rem;
          padding: 0.75rem 0.85rem;
          margin-bottom: 1.2rem;
        }

        .engagement-best > span {
          display: block;
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #7A5422;
          margin-bottom: 0.2rem;
        }

        .engagement-best p {
          font-size: 0.8125rem;
          color: #334155;
          line-height: 1.5;
        }

        .engagement-rows {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding-top: 1.1rem;
          border-top: 1px solid #F1F5F9;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .engagement-row {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
        }

        .engagement-row-check {
          width: 1.35rem;
          height: 1.35rem;
          border-radius: 50%;
          background-color: #ECFDF5;
          color: #059669;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .engagement-row-label {
          display: block;
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748B;
          margin-bottom: 0.1rem;
        }

        .engagement-row p {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #0F172A;
          line-height: 1.5;
        }

        .engagement-button {
          width: 100%;
          justify-content: center;
        }

        .engagement-note {
          text-align: center;
          font-size: 0.84375rem;
          color: #64748B;
          line-height: 1.6;
          max-width: 640px;
          margin: 1.75rem auto 0;
        }

        @media (max-width: 560px) {
          .engagement-badge {
            white-space: normal;
            max-width: 90%;
            text-align: center;
            line-height: 1.3;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .engagement-card {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};
