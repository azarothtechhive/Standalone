// src/pages/admin/AdminFooterManager.tsx
// Dedicated Admin Management Module for Public Site Footer Architecture

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCMS } from '../CMSContext';
import { adminColors, adminStyles } from '../../styles/adminTheme';
import {
  PanelBottom,
  Save,
  CheckCircle2,
  AlertCircle,
  AlignLeft,
  AlignRight,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  Cookie,
  Shield,
  ExternalLink,
  Eye,
  RefreshCw,
  Building,
  Navigation as NavIcon,
  Plus,
  Trash2
} from 'lucide-react';
import logoImg from '../../assets/logo-footer-transparent.png';
import { getPublicFooterLinks } from '../../utils/publicNavigation';
import { companyInfo } from '../../data/companyData';

export const AdminFooterManager: React.FC = () => {
  const { settings, updateSettings, navigation } = useCMS();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Form state
  const [formData, setFormData] = useState({
    footerLayout: (settings?.footerLayout || 'standard') as 'standard' | 'reversed',
    copyright_text: settings?.copyright_text || `All rights reserved Â© 2026 ${settings?.companyName || companyInfo.name} `,
    phone: settings?.phone || settings?.primary_phone || companyInfo.headquarters.phone,
    email: settings?.supportEmail || settings?.primary_email || companyInfo.headquarters.email,
    headquarters: settings?.headquarters || settings?.headquarters_address || companyInfo.headquarters.address,
    linkedinUrl: settings?.linkedinUrl || settings?.linkedin_url || 'https://linkedin.com/company/azaroth-tech-hive',
    twitterUrl: settings?.twitterUrl || 'https://x.com/azarothtech',
    githubUrl: settings?.githubUrl || 'https://github.com/azaroth-tech',
    logoUrl: settings?.logoUrl || '',
    brandPrimary: settings?.footerConfig?.brandPrimary || 'AZAROTH',
    brandSecondary: settings?.footerConfig?.brandSecondary || 'TECH-HIVE',
    followUsTitle: settings?.footerConfig?.followUsTitle || 'Follow Us On:',
    quickLinksTitle: settings?.footerConfig?.quickLinksTitle || 'Quick Links',
    contactTitle: settings?.footerConfig?.contactTitle || 'Contact Us',
    showTwitter: settings?.footerConfig?.showTwitter ?? false,
    showGithub: settings?.footerConfig?.showGithub ?? false,
    legalLinks: settings?.footerConfig?.legalLinks || [
      { label: 'Privacy Policy', path: '/privacy-policy' },
      { label: 'Cookies', path: '/privacy-policy#cookies', icon: 'Cookie' },
    ],
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        footerLayout: (settings.footerLayout || 'standard') as 'standard' | 'reversed',
        copyright_text: settings.copyright_text || `All rights reserved Â© 2026 ${settings.companyName || companyInfo.name} `,
        phone: settings.phone || settings.primary_phone || companyInfo.headquarters.phone,
        email: settings.supportEmail || settings.primary_email || companyInfo.headquarters.email,
        headquarters: settings.headquarters || settings.headquarters_address || companyInfo.headquarters.address,
        linkedinUrl: settings.linkedinUrl || settings.linkedin_url || 'https://linkedin.com/company/azaroth-tech-hive',
        twitterUrl: settings.twitterUrl || 'https://x.com/azarothtech',
        githubUrl: settings.githubUrl || 'https://github.com/azaroth-tech',
        logoUrl: settings.logoUrl || '',
        brandPrimary: settings.footerConfig?.brandPrimary || 'AZAROTH',
        brandSecondary: settings.footerConfig?.brandSecondary || 'TECH-HIVE',
        followUsTitle: settings.footerConfig?.followUsTitle || 'Follow Us On:',
        quickLinksTitle: settings.footerConfig?.quickLinksTitle || 'Quick Links',
        contactTitle: settings.footerConfig?.contactTitle || 'Contact Us',
        showTwitter: settings.footerConfig?.showTwitter ?? false,
        showGithub: settings.footerConfig?.showGithub ?? false,
        legalLinks: settings.footerConfig?.legalLinks || [
          { label: 'Privacy Policy', path: '/privacy-policy' },
          { label: 'Cookies', path: '/privacy-policy#cookies', icon: 'Cookie' },
        ],
      });
      setIsDirty(false);
    }
  }, [settings]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        footerLayout: formData.footerLayout,
        copyright_text: formData.copyright_text,
        phone: formData.phone,
        primary_phone: formData.phone,
        supportEmail: formData.email,
        primary_email: formData.email,
        headquarters: formData.headquarters,
        headquarters_address: formData.headquarters,
        linkedinUrl: formData.linkedinUrl,
        linkedin_url: formData.linkedinUrl,
        twitterUrl: formData.twitterUrl,
        githubUrl: formData.githubUrl,
        logoUrl: formData.logoUrl,
        footerConfig: {
          ...(settings?.footerConfig || {}),
          layout: formData.footerLayout,
          brandPrimary: formData.brandPrimary,
          brandSecondary: formData.brandSecondary,
          followUsTitle: formData.followUsTitle,
          quickLinksTitle: formData.quickLinksTitle,
          contactTitle: formData.contactTitle,
          showTwitter: formData.showTwitter,
          showGithub: formData.showGithub,
          legalLinks: formData.legalLinks,
        },
      });
      setIsDirty(false);
      setNotification({ type: 'success', message: 'Footer architecture & settings published successfully!' });
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save footer settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset footer settings to canonical system defaults?')) {
      setFormData({
        footerLayout: 'standard',
        copyright_text: 'All rights reserved Â© 2026 Azaroth Tech-Hive ',
        phone: companyInfo.headquarters.phone,
        email: companyInfo.headquarters.email,
        headquarters: companyInfo.headquarters.address,
        linkedinUrl: 'https://linkedin.com/company/azaroth-tech-hive',
        twitterUrl: 'https://x.com/azarothtech',
        githubUrl: 'https://github.com/azaroth-tech',
        logoUrl: '',
        brandPrimary: 'AZAROTH',
        brandSecondary: 'TECH-HIVE',
        followUsTitle: 'Follow Us On:',
        quickLinksTitle: 'Quick Links',
        contactTitle: 'Contact Us',
        showTwitter: false,
        showGithub: false,
        legalLinks: [
          { label: 'Privacy Policy', path: '/privacy-policy' },
          { label: 'Cookies', path: '/privacy-policy#cookies', icon: 'Cookie' },
        ],
      });
      setIsDirty(true);
    }
  };

  const activeQuickLinks = getPublicFooterLinks(navigation);
  const brandIcon = formData.logoUrl && formData.logoUrl !== '/logo-footer.png' && formData.logoUrl !== '/Logo.png'
    ? formData.logoUrl
    : logoImg;

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', padding: '0', overflowX: 'hidden' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: adminColors.slate.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PanelBottom size={22} color="#49243F" />
            </div>
            Footer Architecture &amp; Column Manager
          </h1>
          <p style={{ fontSize: '0.875rem', color: adminColors.slate.textMuted, marginTop: '0.375rem', marginLeft: '3.25rem' }}>
            Configure column flow (Standard vs. Reversed), brand icons, quick links, contact channels, and legal copyright notices.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isDirty && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: adminColors.amber.text, backgroundColor: adminColors.amber.light, padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
              Unsaved Changes
            </span>
          )}

          <button
            onClick={handleResetToDefaults}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.625rem 1rem',
              backgroundColor: '#FFFFFF',
              border: `1px solid ${adminColors.slate.borderStrong}`,
              borderRadius: '8px',
              color: adminColors.slate.textSecondary,
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            Reset Defaults
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#49243F',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(73, 36, 63, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Save size={18} />
            {isSaving ? 'Publishing...' : 'Save Footer Configuration'}
          </button>
        </div>
      </div>

      {notification && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          backgroundColor: notification.type === 'success' ? adminColors.emerald.light : adminColors.rose.light,
          border: `1px solid ${notification.type === 'success' ? adminColors.emerald.border : adminColors.rose.border}`,
          borderRadius: '8px',
          color: notification.type === 'success' ? adminColors.emerald.text : adminColors.rose.text,
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Main Grid Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* 1. Layout & Architecture Card */}
        <div style={adminStyles.card}>
          <div style={adminStyles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.amber.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlignLeft size={20} color={adminColors.amber.text} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                  1. Footer Column Alignment &amp; Flow
                </h2>
                <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                  Choose how the 3 columns (Brand &amp; Social, Quick Links, and Contact Details) flow across public pages
                </span>
              </div>
            </div>
          </div>

          <div style={adminStyles.cardBody}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {/* Option A: Standard Layout */}
              <div
                onClick={() => handleChange('footerLayout', 'standard')}
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: formData.footerLayout === 'standard' ? '2px solid #49243F' : `1px solid ${adminColors.slate.border}`,
                  backgroundColor: formData.footerLayout === 'standard' ? adminColors.slate.cardSubtle : '#FFFFFF',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlignLeft size={18} color="#49243F" />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: adminColors.slate.textPrimary }}>
                      Standard Alignment (Left âž” Right)
                    </span>
                  </div>
                  {formData.footerLayout === 'standard' && (
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 700, backgroundColor: '#49243F', color: '#FFFFFF' }}>
                      Active
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted, margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                  <strong>Brand Logo &amp; Follow Us on Left</strong>, Quick Links in the center, and <strong>Contact Us on Right</strong>.
                </p>
                <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.6875rem', color: '#94A3B8', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.2rem 0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '4px', fontWeight: 600 }}>
                    [1] Brand &amp; Social
                  </span>
                  <span>&rarr;</span>
                  <span style={{ padding: '0.2rem 0.4rem', backgroundColor: '#F1F5F9', color: '#334155', borderRadius: '4px', fontWeight: 600 }}>
                    [2] Quick Links
                  </span>
                  <span>&rarr;</span>
                  <span style={{ padding: '0.2rem 0.4rem', backgroundColor: '#EDE9FE', color: '#7C3AED', borderRadius: '4px', fontWeight: 600 }}>
                    [3] Contact Us
                  </span>
                </div>
              </div>

              {/* Option B: Reversed Layout */}
              <div
                onClick={() => handleChange('footerLayout', 'reversed')}
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: formData.footerLayout === 'reversed' ? '2px solid #49243F' : `1px solid ${adminColors.slate.border}`,
                  backgroundColor: formData.footerLayout === 'reversed' ? adminColors.slate.cardSubtle : '#FFFFFF',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlignRight size={18} color="#C99B52" />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: adminColors.slate.textPrimary }}>
                      Reversed Alignment (Left â‡„ Right)
                    </span>
                  </div>
                  {formData.footerLayout === 'reversed' && (
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 700, backgroundColor: '#49243F', color: '#FFFFFF' }}>
                      Active
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted, margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                  <strong>Contact Us details on Left</strong>, Quick Links in the center, and <strong>Brand Logo &amp; Follow Us on Right</strong>.
                </p>
                <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.6875rem', color: '#94A3B8', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.2rem 0.4rem', backgroundColor: '#EDE9FE', color: '#7C3AED', borderRadius: '4px', fontWeight: 600 }}>
                    [1] Contact Us
                  </span>
                  <span>&rarr;</span>
                  <span style={{ padding: '0.2rem 0.4rem', backgroundColor: '#F1F5F9', color: '#334155', borderRadius: '4px', fontWeight: 600 }}>
                    [2] Quick Links
                  </span>
                  <span>&rarr;</span>
                  <span style={{ padding: '0.2rem 0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '4px', fontWeight: 600 }}>
                    [3] Brand &amp; Social
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Brand Identity & Social Column */}
        <div style={adminStyles.card}>
          <div style={adminStyles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={20} color={adminColors.indigo.text} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                  2. Brand Identity &amp; Follow Us Channels
                </h2>
                <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                  Company branding, transparent footer badge, and social presence links
                </span>
              </div>
            </div>
          </div>

          <div style={adminStyles.cardBody}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={adminStyles.label}>Brand Primary Word</label>
                <input
                  type="text"
                  value={formData.brandPrimary}
                  onChange={(e) => handleChange('brandPrimary', e.target.value)}
                  placeholder="AZAROTH"
                  style={adminStyles.input}
                />
                <span style={{ fontSize: '0.75rem', color: adminColors.slate.textLight, marginTop: '0.25rem', display: 'block' }}>
                  Main serif headline word (e.g. AZAROTH)
                </span>
              </div>

              <div>
                <label style={adminStyles.label}>Brand Secondary Subtext</label>
                <input
                  type="text"
                  value={formData.brandSecondary}
                  onChange={(e) => handleChange('brandSecondary', e.target.value)}
                  placeholder="TECH-HIVE"
                  style={adminStyles.input}
                />
                <span style={{ fontSize: '0.75rem', color: adminColors.slate.textLight, marginTop: '0.25rem', display: 'block' }}>
                  Gold uppercase subline (e.g. TECH-HIVE)
                </span>
              </div>

              <div>
                <label style={adminStyles.label}>Follow Us Section Title</label>
                <input
                  type="text"
                  value={formData.followUsTitle}
                  onChange={(e) => handleChange('followUsTitle', e.target.value)}
                  placeholder="Follow Us On:"
                  style={adminStyles.input}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ ...adminStyles.label, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Linkedin size={15} color="#0A66C2" /> LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/company/azaroth-tech-hive"
                  style={adminStyles.input}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <label style={{ ...adminStyles.label, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Twitter size={15} color="#1DA1F2" /> Twitter / X Profile URL
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', cursor: 'pointer', color: adminColors.slate.textMuted }}>
                    <input
                      type="checkbox"
                      checked={formData.showTwitter}
                      onChange={(e) => handleChange('showTwitter', e.target.checked)}
                      style={{ accentColor: adminColors.indigo.base }}
                    />
                    Display Icon
                  </label>
                </div>
                <input
                  type="url"
                  value={formData.twitterUrl}
                  onChange={(e) => handleChange('twitterUrl', e.target.value)}
                  placeholder="https://x.com/azarothtech"
                  style={adminStyles.input}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <label style={{ ...adminStyles.label, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Github size={15} color="#18181B" /> GitHub Organization URL
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', cursor: 'pointer', color: adminColors.slate.textMuted }}>
                    <input
                      type="checkbox"
                      checked={formData.showGithub}
                      onChange={(e) => handleChange('showGithub', e.target.checked)}
                      style={{ accentColor: adminColors.indigo.base }}
                    />
                    Display Icon
                  </label>
                </div>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => handleChange('githubUrl', e.target.value)}
                  placeholder="https://github.com/azaroth-tech"
                  style={adminStyles.input}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Quick Links Column */}
        <div style={adminStyles.card}>
          <div style={adminStyles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NavIcon size={20} color={adminColors.indigo.text} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                  3. Quick Links Navigation Column
                </h2>
                <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                  Core public pathways rendered in the middle footer column
                </span>
              </div>
            </div>

            <Link
              to="/admin/navigation"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: adminColors.indigo.text,
                textDecoration: 'none',
              }}
            >
              Open Navigation Manager <ExternalLink size={14} />
            </Link>
          </div>

          <div style={adminStyles.cardBody}>
            <p style={{ fontSize: '0.875rem', color: adminColors.slate.textSecondary, marginTop: 0, marginBottom: '1rem' }}>
              The public site footer automatically surfaces your active primary modules. Currently published quick links:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              {activeQuickLinks.map((link) => (
                <div
                  key={link.id}
                  style={{
                    padding: '0.5rem 0.875rem',
                    backgroundColor: adminColors.slate.cardMuted,
                    borderRadius: '8px',
                    border: `1px solid ${adminColors.slate.border}`,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: adminColors.slate.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#047857' }} />
                  {link.label}
                  <span style={{ fontSize: '0.75rem', color: adminColors.slate.textLight, fontFamily: 'monospace' }}>
                    ({link.path})
                  </span>
                </div>
              ))}
            </div>

            <span style={{ fontSize: '0.75rem', color: adminColors.slate.textMuted }}>
              * To add custom links, change paths, or re-order the navigation items, visit the <strong>Navigation Menu</strong> tab in the sidebar.
            </span>
          </div>
        </div>

        {/* 4. Contact Us Details Column */}
        <div style={adminStyles.card}>
          <div style={adminStyles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} color={adminColors.indigo.text} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                  4. Direct Contact Channels Column
                </h2>
                <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                  Official phone line, direct engineering inbox, and physical headquarters address
                </span>
              </div>
            </div>
          </div>

          <div style={adminStyles.cardBody}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ ...adminStyles.label, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} color="#49243F" /> Official Telephone Hotline
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 80 4123 4567"
                  style={adminStyles.input}
                />
              </div>

              <div>
                <label style={{ ...adminStyles.label, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} color="#49243F" /> Primary Support / Contact Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contact@azaroth.com"
                  style={adminStyles.input}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ ...adminStyles.label, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="#49243F" /> Physical Headquarters Address
                </label>
                <textarea
                  rows={2}
                  value={formData.headquarters}
                  onChange={(e) => handleChange('headquarters', e.target.value)}
                  placeholder="Azaroth Tech-Hive Headquarters, Bangalore, India"
                  style={{ ...adminStyles.input, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Copyright & Legal Disclosures */}
        <div style={adminStyles.card}>
          <div style={adminStyles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} color={adminColors.indigo.text} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                  5. Copyright Notice &amp; Legal Disclosures
                </h2>
                <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                  Bottom legal copyright string and policy routes
                </span>
              </div>
            </div>
          </div>

          <div style={adminStyles.cardBody}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={adminStyles.label}>Copyright Notice Text</label>
              <input
                type="text"
                value={formData.copyright_text}
                onChange={(e) => handleChange('copyright_text', e.target.value)}
                placeholder="All rights reserved Â© 2026 Azaroth Tech-Hive "
                style={adminStyles.input}
              />
            </div>

            <div style={{
              padding: '0.875rem 1rem',
              backgroundColor: adminColors.slate.cardSubtle,
              borderRadius: '8px',
              border: `1px solid ${adminColors.slate.border}`,
              fontSize: '0.8125rem',
              color: adminColors.slate.textSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}>
              <Cookie size={18} color="#C99B52" style={{ flexShrink: 0 }} />
              <div>
                <strong>Built-in Compliance Routes:</strong> The bottom bar automatically includes links to{' '}
                <strong>Privacy Policy</strong> (<code>/privacy-policy</code>) and <strong>Cookie Preferences</strong> (<code>/privacy-policy#cookies</code>).
              </div>
            </div>

            {/* Bottom Bar Legal Links Editor */}
            <div style={{ paddingTop: '1.25rem', borderTop: `1px solid ${adminColors.slate.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ ...adminStyles.label, marginBottom: '0.25rem' }}>Bottom Bar Legal & Compliance Links</label>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: adminColors.slate.textMuted }}>
                    Configure the legal disclaimer, privacy, and compliance links rendered in the public site bottom bar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      legalLinks: [...(prev.legalLinks || []), { label: 'Terms of Service', path: '/privacy-policy#terms' }]
                    }));
                    setIsDirty(true);
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${adminColors.slate.border}`,
                    backgroundColor: '#FFFFFF',
                    color: adminColors.slate.textPrimary,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Plus size={14} /> Add Link
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(formData.legalLinks || []).map((link: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 2fr auto',
                      gap: '0.5rem',
                      alignItems: 'center',
                      backgroundColor: adminColors.slate.cardSubtle,
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${adminColors.slate.border}`,
                    }}
                  >
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...formData.legalLinks];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        setFormData(prev => ({ ...prev, legalLinks: updated }));
                        setIsDirty(true);
                      }}
                      placeholder="Label (e.g. Terms of Service)"
                      style={{ ...adminStyles.input, padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                    />
                    <input
                      type="text"
                      value={link.path}
                      onChange={(e) => {
                        const updated = [...formData.legalLinks];
                        updated[idx] = { ...updated[idx], path: e.target.value };
                        setFormData(prev => ({ ...prev, legalLinks: updated }));
                        setIsDirty(true);
                      }}
                      placeholder="Route path (e.g. /terms or /privacy-policy#terms)"
                      style={{ ...adminStyles.input, padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.legalLinks.filter((_: any, i: number) => i !== idx);
                        setFormData(prev => ({ ...prev, legalLinks: updated }));
                        setIsDirty(true);
                      }}
                      style={{
                        padding: '0.4rem',
                        border: 'none',
                        background: 'transparent',
                        color: adminColors.rose.base,
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                      title="Remove Link"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Live Interactive Footer Preview Sandbox */}
        <div style={adminStyles.card}>
          <div style={adminStyles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={20} color="#49243F" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                  6. Real-Time Public Site Footer Preview
                </h2>
                <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                  Live visual rendering matching the exact dark theme styling of your public website
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: adminColors.slate.cardMuted, padding: '0.2rem', borderRadius: '6px' }}>
              <button
                onClick={() => setPreviewDevice('desktop')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: previewDevice === 'desktop' ? '#FFFFFF' : 'transparent',
                  color: previewDevice === 'desktop' ? adminColors.slate.textPrimary : adminColors.slate.textMuted,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: previewDevice === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Desktop Grid
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: previewDevice === 'mobile' ? '#FFFFFF' : 'transparent',
                  color: previewDevice === 'mobile' ? adminColors.slate.textPrimary : adminColors.slate.textMuted,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: previewDevice === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Mobile Stack
              </button>
            </div>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: '#05090E', overflowX: 'auto' }}>
            <div style={{
              maxWidth: previewDevice === 'mobile' ? '380px' : '100%',
              margin: '0 auto',
              backgroundColor: '#0A1118',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2.5rem 1.75rem 1.5rem',
              color: '#FFFFFF',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}>
              {/* 3 Columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem',
              }}>
                {/* Column Render Ordered by Alignment */}
                {(() => {
                  const brandCol = (
                    <div key="prev-brand">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <img
                          src={brandIcon}
                          alt="Footer Logo"
                          style={{ maxHeight: '2.5rem', maxWidth: '7rem', objectFit: 'contain' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', fontFamily: 'serif', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                            {formData.brandPrimary}
                          </span>
                          {formData.brandSecondary && (
                            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#C99B52', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                              {formData.brandSecondary}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ fontSize: '0.8125rem', color: '#CBD5E1', fontWeight: 600, marginBottom: '0.5rem' }}>
                          {formData.followUsTitle}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
                            <Linkedin size={15} />
                          </span>
                          {formData.showTwitter && (
                            <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
                              <Twitter size={15} />
                            </span>
                          )}
                          {formData.showGithub && (
                            <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
                              <Github size={15} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  const quickLinksCol = (
                    <div key="prev-quick">
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '1rem' }}>
                        {formData.quickLinksTitle}
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {activeQuickLinks.map(link => (
                          <li key={link.id} style={{ fontSize: '0.875rem', color: '#FFFFFF' }}>
                            {link.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );

                  const contactCol = (
                    <div key="prev-contact">
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '1rem' }}>
                        {formData.contactTitle}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF' }}>
                          <Phone size={15} color="#FFFFFF" />
                          <span>{formData.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF' }}>
                          <Mail size={15} color="#FFFFFF" />
                          <span>{formData.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#FFFFFF' }}>
                          <MapPin size={15} color="#FFFFFF" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                          <span style={{ lineHeight: 1.4 }}>{formData.headquarters}</span>
                        </div>
                      </div>
                    </div>
                  );

                  return formData.footerLayout === 'reversed'
                    ? [contactCol, quickLinksCol, brandCol]
                    : [brandCol, quickLinksCol, contactCol];
                })()}
              </div>

              {/* Bottom Bar */}
              <div style={{
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.8125rem',
                color: '#64748B',
              }}>
                <div>{formData.copyright_text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFFFFF' }}>
                  {(formData.legalLinks || []).map((link: any, idx: number) => {
                    const isCookie = link.icon === 'Cookie' || link.label?.toLowerCase().includes('cookie');
                    return (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>&bull;</span>}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {isCookie && <Cookie size={13} style={{ opacity: 0.7 }} />}
                          <span>{link.label}</span>
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFooterManager;


