// src/components/common/AdminFloatingBadge.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Edit, LayoutDashboard } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminFloatingBadge: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated || location.pathname.startsWith('/admin')) {
    return null;
  }

  // Determine which CMS edit tab or module matches current page
  let editTarget = '/admin/pages';
  if (location.pathname === '/') editTarget = '/admin/pages';
  else if (location.pathname.startsWith('/products')) editTarget = '/admin/products';
  else if (location.pathname.startsWith('/services')) editTarget = '/admin/services';
  else if (location.pathname.startsWith('/portfolio')) editTarget = '/admin/portfolio';
  else if (location.pathname.startsWith('/technology-insights') || location.pathname.startsWith('/resource-hub')) editTarget = '/admin/insights';
  else if (location.pathname.startsWith('/testimonials')) editTarget = '/admin/testimonials';
  else if (location.pathname.startsWith('/connect-with-us')) editTarget = '/admin/inquiries';
  else if (location.pathname.startsWith('/request-for-quote')) editTarget = '/admin/rfqs';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'clamp(10px, 3vw, 24px)',
        left: 'clamp(10px, 3vw, 24px)',
        maxWidth: 'calc(100vw - 20px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#0F172A',
        border: '1px solid #D4AF37',
        borderRadius: '9999px',
        padding: '0.4rem 0.875rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 15px rgba(212, 175, 55, 0.3)',
        color: '#FFFFFF',
        fontSize: '0.8125rem',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <Shield size={14} color="#D4AF37" />
        <span style={{ fontWeight: 600, color: '#D4AF37', fontSize: '0.75rem', textTransform: 'uppercase' }}>
          CMS Active
        </span>
      </div>

      <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

      <Link
        to={editTarget}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#4ADE80',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      >
        <Edit size={12} /> Edit Section
      </Link>

      <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

      <Link
        to="/admin"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#CBD5E1',
          textDecoration: 'none',
          fontSize: '0.75rem',
        }}
      >
        <LayoutDashboard size={12} /> Portal
      </Link>
    </div>
  );
};
