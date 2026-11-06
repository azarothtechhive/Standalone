// src/styles/adminTheme.ts
// Central Light Theme & 4-Brand-Color Design Tokens for Azaroth CMS Console

export const adminColors = {
  // 1. Obsidian Primary Brand (Navigation, Action, Catalog, Tech - Zero Blue Dominance)
  indigo: {
    base: '#18181B',
    hover: '#27272A',
    light: '#F4F4F5',
    lighter: '#FAFAFA',
    border: '#E4E4E7',
    text: '#18181B',
    glow: 'rgba(24, 24, 27, 0.2)',
  },
  // 2. Emerald (Live DB Status, Published State, SLAs & Services, Inquiries, Success)
  emerald: {
    base: '#047857',
    hover: '#065F46',
    light: '#ECFDF5',
    lighter: '#F0FDF4',
    border: '#A7F3D0',
    text: '#047857',
    glow: 'rgba(4, 120, 87, 0.2)',
  },
  // 3. Amber Gold (Azaroth Gold, RFQs, Pending / Draft, Featured Highlights, Warnings)
  amber: {
    base: '#D97706',
    hover: '#B45309',
    light: '#FEF3C7',
    lighter: '#FFFBEB',
    border: '#FDE68A',
    text: '#B45309',
    glow: 'rgba(217, 119, 6, 0.2)',
  },
  // 4. Rose / Coral Magenta (Danger, Audit Trail Deletes, Inactive, Alerts, Signout)
  rose: {
    base: '#E11D48',
    hover: '#BE123C',
    light: '#FFE4E6',
    lighter: '#FFF1F2',
    border: '#FECDD3',
    text: '#BE123C',
    glow: 'rgba(225, 29, 72, 0.2)',
  },
  // Slate Neutral Canvas Palette (Executive Light Theme)
  slate: {
    pageBg: '#F8FAFC',
    card: '#FFFFFF',
    cardMuted: '#F1F5F9',
    cardSubtle: '#F8FAFC',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderStrong: '#CBD5E1',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    textLight: '#94A3B8',
  },
};

export const adminStyles = {
  // Page container
  pageContainer: {
    backgroundColor: adminColors.slate.pageBg,
    color: adminColors.slate.textPrimary,
    minHeight: '100%',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  // Card
  card: {
    backgroundColor: adminColors.slate.card,
    border: `1px solid ${adminColors.slate.border}`,
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
  },
  cardHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: `1px solid ${adminColors.slate.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBody: {
    padding: '1.5rem',
  },
  // Inputs
  label: {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: adminColors.slate.textSecondary,
    marginBottom: '0.375rem',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    border: `1px solid ${adminColors.slate.borderStrong}`,
    borderRadius: '8px',
    padding: '0.625rem 0.875rem',
    color: adminColors.slate.textPrimary,
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  textarea: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    border: `1px solid ${adminColors.slate.borderStrong}`,
    borderRadius: '8px',
    padding: '0.625rem 0.875rem',
    color: adminColors.slate.textPrimary,
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  select: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    border: `1px solid ${adminColors.slate.borderStrong}`,
    borderRadius: '8px',
    padding: '0.625rem 0.875rem',
    color: adminColors.slate.textPrimary,
    fontSize: '0.875rem',
    outline: 'none',
  },
  // Buttons with the 4 color tokens
  primaryButton: {
    backgroundColor: adminColors.indigo.base,
    color: '#FFFFFF',
    border: `1px solid ${adminColors.indigo.hover}`,
    borderRadius: '8px',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 6px rgba(24, 24, 27, 0.25)',
    transition: 'all 0.15s ease',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    color: adminColors.slate.textSecondary,
    border: `1px solid ${adminColors.slate.borderStrong}`,
    borderRadius: '8px',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.15s ease',
  },
  successButton: {
    backgroundColor: adminColors.emerald.base,
    color: '#FFFFFF',
    border: `1px solid ${adminColors.emerald.hover}`,
    borderRadius: '8px',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)',
    transition: 'all 0.15s ease',
  },
  warningButton: {
    backgroundColor: adminColors.amber.base,
    color: '#FFFFFF',
    border: `1px solid ${adminColors.amber.hover}`,
    borderRadius: '8px',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
    transition: 'all 0.15s ease',
  },
  dangerButton: {
    backgroundColor: adminColors.rose.light,
    color: adminColors.rose.text,
    border: `1px solid ${adminColors.rose.border}`,
    borderRadius: '8px',
    padding: '0.5rem 0.875rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: 'all 0.15s ease',
  },
  // Table styles
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.875rem',
    color: adminColors.slate.textPrimary,
  },
  th: {
    backgroundColor: adminColors.slate.cardMuted,
    color: adminColors.slate.textSecondary,
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: '0.875rem 1.25rem',
    textAlign: 'left' as const,
    borderBottom: `1px solid ${adminColors.slate.border}`,
  },
  td: {
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${adminColors.slate.borderLight}`,
    color: adminColors.slate.textPrimary,
  },
  // Badges helper
  badge: (colorType: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate') => {
    switch (colorType) {
      case 'indigo':
        return {
          backgroundColor: adminColors.indigo.light,
          color: adminColors.indigo.text,
          border: `1px solid ${adminColors.indigo.border}`,
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
        };
      case 'emerald':
        return {
          backgroundColor: adminColors.emerald.light,
          color: adminColors.emerald.text,
          border: `1px solid ${adminColors.emerald.border}`,
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
        };
      case 'amber':
        return {
          backgroundColor: adminColors.amber.light,
          color: adminColors.amber.text,
          border: `1px solid ${adminColors.amber.border}`,
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
        };
      case 'rose':
        return {
          backgroundColor: adminColors.rose.light,
          color: adminColors.rose.text,
          border: `1px solid ${adminColors.rose.border}`,
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
        };
      default:
        return {
          backgroundColor: adminColors.slate.cardMuted,
          color: adminColors.slate.textSecondary,
          border: `1px solid ${adminColors.slate.border}`,
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
        };
    }
  },
};
