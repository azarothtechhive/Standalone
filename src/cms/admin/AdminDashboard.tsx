// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Layers,
  BookOpen,
  Mail,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
  Plus,
  RefreshCw,
  ExternalLink,
  Shield,
  FileText
} from 'lucide-react';
import { useCMS } from '../CMSContext';
import { cmsService } from '../cmsService';

export const AdminDashboard: React.FC = () => {
  const { products, services, insights, pages, refreshContent, isLive } = useCMS();
  const [stats, setStats] = useState<any>(null);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      const data = await cmsService.fetchStats();
      if (data && data.stats) {
        setStats(data.stats);
        setRecentAudits(data.recentAudits || []);
        setRecentEnquiries(data.recentEnquiries || []);
      }
    } catch {
      // Fallback stats from context
      setStats({
        products: products.length,
        services: services.length,
        insights: insights.length,
        portfolio: 2,
        enquiries: 0,
        rfqs: 0,
        media: 4,
      });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const statCards = [
    { title: 'Products Catalog', count: stats?.products ?? products.length, icon: ShoppingBag, color: '#18181B', bgLight: '#F4F4F5', border: '#E4E4E7', to: '/admin/products' },
    { title: 'Enterprise Services', count: stats?.services ?? services.length, icon: Layers, color: '#047857', bgLight: '#ECFDF5', border: '#A7F3D0', to: '/admin/services' },
    { title: 'Tech Insights', count: stats?.insights ?? insights.length, icon: BookOpen, color: '#D4AF37', bgLight: '#FEF9C3', border: '#FDE68A', to: '/admin/insights' },
    { title: 'Contact Inquiries', count: stats?.enquiries ?? 0, icon: Mail, color: '#047857', bgLight: '#ECFDF5', border: '#A7F3D0', to: '/admin/inquiries' },
    { title: 'Active Page Modules', count: Object.keys(pages).length, icon: FileText, color: '#D97706', bgLight: '#FEF3C7', border: '#FDE68A', to: '/admin/pages' },
  ];

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', padding: '0', overflowX: 'hidden' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          padding: 'clamp(1rem, 3vw, 2rem)',
          backgroundColor: '#FFFFFF',
          backgroundImage: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 60%, #ECFDF5 100%)',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.02)',
          marginBottom: 'clamp(1rem, 2vw, 2rem)',
          marginLeft: 'clamp(0.5rem, 1vw, 0)',
          marginRight: 'clamp(0.5rem, 1vw, 0)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ECFDF5', padding: '0.25rem 0.75rem', borderRadius: '9999px', marginBottom: '0.75rem', border: '1px solid #A7F3D0' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#047857' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>
              {isLive ? 'Real-Time Neon Database Sync Active' : 'Offline / Standalone Active'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Azaroth Executive CMS Control
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#475569', marginTop: '0.5rem', maxWidth: '650px', lineHeight: 1.5 }}>
            Modify all pages, navigation, service tiers, products, and articles without code deployments. All changes persist instantly to the production database.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              refreshContent();
              loadDashboardData();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'background 0.15s ease',
            }}
          >
            <RefreshCw size={16} color="#18181B" /> Sync Database
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#18181B',
              border: '1px solid #09090B',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0, 108, 53, 0.25)',
              transition: 'background 0.15s ease',
            }}
          >
            <ExternalLink size={16} /> Preview Site
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.to}
              style={{
                textDecoration: 'none',
                backgroundColor: '#FFFFFF',
                border: `1px solid ${card.border}`,
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ padding: '0.625rem', borderRadius: '10px', backgroundColor: card.bgLight, border: `1px solid ${card.border}` }}>
                  <Icon size={22} color={card.color} />
                </div>
                <ArrowUpRight size={18} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {card.count}
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B', marginTop: '0.5rem' }}>
                  {card.title}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
          Instant Content Actions
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Amber Gold */}
          <Link
            to="/admin/pages"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              color: '#B45309',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <FileText size={16} color="#D97706" /> Edit Home & Company Pages
          </Link>

          {/* Indigo */}
          <Link
            to="/admin/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#F4F4F5',
              border: '1px solid #E4E4E7',
              borderRadius: '8px',
              color: '#18181B',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Plus size={16} color="#18181B" /> Add New Software Product
          </Link>

          {/* Emerald */}
          <Link
            to="/admin/services"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '8px',
              color: '#047857',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Plus size={16} color="#047857" /> Configure Service & SLAs
          </Link>

          {/* Gold */}
          <Link
            to="/admin/insights"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#FEF9C3',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              color: '#92400E',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Plus size={16} color="#B89325" /> Publish Tech Insight Article
          </Link>

          {/* Slate */}
          <Link
            to="/admin/settings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Shield size={16} color="#18181B" /> Global Branding & SEO
          </Link>
        </div>
      </div>

      {/* Two Columns: Recent Inquiries & Audit Logs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Inquiries Panel */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} color="#047857" /> Latest Client Inquiries
            </h3>
            <Link to="/admin/inquiries" style={{ fontSize: '0.8125rem', color: '#18181B', textDecoration: 'none', fontWeight: 600 }}>
              View all â†’
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
              No inquiries yet. Submissions from the contact form appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>{enq.name}</span>
                    <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>{new Date(enq.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, marginBottom: '0.375rem' }}>{enq.companyName || enq.email}</div>
                  <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {enq.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log Panel */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#E11D48" /> Audit Trail & System Activity
            </h3>
            <Link to="/admin/audit-logs" style={{ fontSize: '0.8125rem', color: '#18181B', textDecoration: 'none', fontWeight: 600 }}>
              Full logs â†’
            </Link>
          </div>

          {recentAudits.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
              No audit records yet. All CMS modifications are recorded automatically.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentAudits.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.875rem',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: log.action === 'CREATE' ? '#ECFDF5' : log.action === 'DELETE' ? '#FFE4E6' : '#EEF2FF',
                        color: log.action === 'CREATE' ? '#047857' : log.action === 'DELETE' ? '#BE123C' : '#4338CA',
                        border: `1px solid ${log.action === 'CREATE' ? '#A7F3D0' : log.action === 'DELETE' ? '#FECDD3' : '#C7D2FE'}`,
                      }}
                    >
                      {log.action}
                    </span>
                    <div>
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>{log.module}</span>
                      <span style={{ color: '#64748B', marginLeft: '0.5rem' }}>by {log.userName}</span>
                    </div>
                  </div>
                  <span style={{ color: '#64748B', fontSize: '0.6875rem' }}>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

