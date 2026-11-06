// src/pages/admin/AdminCRMInquiries.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Mail,
  Search,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Globe,
  Phone,
  Building,
  User,
  Calendar,
  Paperclip,
  FileText,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Inbox,
  Clock3,
  TrendingUp,
  Save,
  AlertCircle,
} from 'lucide-react';
import { cmsService, CmsEnquiry } from '../cmsService';

const ENQUIRY_STATUSES = [
  'NEW',
  'OPEN',
  'CONTACTED',
  'IN_PROGRESS',
  'QUALIFIED',
  'PROPOSAL',
  'CLOSED',
] as const;

type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

const STATUS_META: Record<EnquiryStatus, { label: string; color: string; bg: string; border: string }> = {
  NEW: { label: 'New', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
  OPEN: { label: 'Open', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  CONTACTED: { label: 'Contacted', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  IN_PROGRESS: { label: 'In progress', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  QUALIFIED: { label: 'Qualified', color: '#0E7490', bg: '#ECFEFF', border: '#A5F3FC' },
  PROPOSAL: { label: 'Proposal sent', color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
  CLOSED: { label: 'Closed', color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' },
};

function normalizeStatus(status?: string): EnquiryStatus {
  const value = (status || 'NEW').toUpperCase();
  return (ENQUIRY_STATUSES as readonly string[]).includes(value) ? (value as EnquiryStatus) : 'NEW';
}

function parseEnquiryDetails(enquiry: CmsEnquiry) {
  let country = enquiry.country?.trim() || '';
  let focus = enquiry.enquiryAbout?.trim() || '';
  let attachments: string[] = Array.isArray(enquiry.attachments)
    ? enquiry.attachments
        .map((item: unknown) =>
          typeof item === 'string'
            ? item
            : item && typeof item === 'object' && 'name' in item
              ? String((item as { name: unknown }).name)
              : ''
        )
        .filter(Boolean)
    : [];
  let scope = enquiry.message || '';

  if (enquiry.message) {
    if (!country) {
      const countryMatch = enquiry.message.match(/Country:\s*([^\n]+)/i);
      if (countryMatch) country = countryMatch[1].trim();
    }
    if (!focus) {
      const focusMatch = enquiry.message.match(/Focus:\s*([^\n]+)/i);
      if (focusMatch) focus = focusMatch[1].trim();
    }
    if (attachments.length === 0) {
      const filesMatch = enquiry.message.match(/Attached files:\s*([^\n]+)/i);
      if (filesMatch && filesMatch[1].trim() && !filesMatch[1].toLowerCase().includes('none')) {
        attachments = filesMatch[1].split(',').map((f) => f.trim()).filter(Boolean);
      }
    }
    const scopeMatch = enquiry.message.match(
      /Project Scope & Requirements:\s*\n+([\s\S]*?)(?:\n\nAttached files:|\n\nAttachments:|$)/i
    );
    if (scopeMatch && scopeMatch[1].trim()) {
      scope = scopeMatch[1].trim();
    }
  }

  return { country, focus, attachments, scope };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const meta = STATUS_META[normalizeStatus(status)];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        backgroundColor: meta.bg,
        border: `1px solid ${meta.border}`,
        color: meta.color,
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}> = ({ label, value, icon, color, bg, border }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
      padding: '0.95rem 1.1rem',
      borderRadius: '12px',
      backgroundColor: '#FFFFFF',
      border: `1px solid ${border}`,
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: '10px',
        backgroundColor: bg,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{label}</div>
    </div>
  </div>
);

const DetailField: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({
  icon,
  label,
  children,
}) => (
  <div>
    <div
      style={{
        fontSize: '0.6875rem',
        color: '#64748B',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '4px',
      }}
    >
      {icon} {label}
    </div>
    <div style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 600, wordBreak: 'break-word' }}>
      {children}
    </div>
  </div>
);

export const AdminCRMInquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<CmsEnquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EnquiryStatus>('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<CmsEnquiry | null>(null);
  const [followUpNote, setFollowUpNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const selectedIdRef = useRef<string | null>(null);

  selectedIdRef.current = selectedEnquiry?.id ?? null;

  const loadData = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError(null);

    try {
      const data = await cmsService.fetchEnquiries();
      const list = Array.isArray(data) ? data : [];
      setEnquiries(list);

      const currentId = selectedIdRef.current;
      if (list.length === 0) {
        setSelectedEnquiry(null);
        setFollowUpNote('');
        setSavedNote('');
      } else {
        const fresh = (currentId && list.find((item) => item.id === currentId)) || list[0];
        const selectionChanged = !currentId || currentId !== fresh.id;
        setSelectedEnquiry(fresh);
        if (selectionChanged) {
          setFollowUpNote(fresh.followUpNote || '');
          setSavedNote(fresh.followUpNote || '');
        }
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load inquiries.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    }, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 3500);
  };

  const stats = useMemo(() => {
    const counts: Record<EnquiryStatus, number> = {
      NEW: 0,
      OPEN: 0,
      CONTACTED: 0,
      IN_PROGRESS: 0,
      QUALIFIED: 0,
      PROPOSAL: 0,
      CLOSED: 0,
    };
    for (const enquiry of enquiries) {
      counts[normalizeStatus(enquiry.status)] += 1;
    }
    return {
      total: enquiries.length,
      fresh: counts.NEW,
      active: counts.OPEN + counts.CONTACTED + counts.IN_PROGRESS + counts.QUALIFIED + counts.PROPOSAL,
      closed: counts.CLOSED,
      counts,
    };
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return enquiries.filter((enquiry) => {
      const details = parseEnquiryDetails(enquiry);
      const matchesSearch =
        !query ||
        enquiry.name.toLowerCase().includes(query) ||
        enquiry.email.toLowerCase().includes(query) ||
        (enquiry.companyName && enquiry.companyName.toLowerCase().includes(query)) ||
        (details.country && details.country.toLowerCase().includes(query)) ||
        (enquiry.phone && enquiry.phone.toLowerCase().includes(query)) ||
        (enquiry.message && enquiry.message.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === 'ALL' || normalizeStatus(enquiry.status) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enquiries, searchTerm, statusFilter]);

  const selectedDetails = selectedEnquiry ? parseEnquiryDetails(selectedEnquiry) : null;
  const whatsappUrl = selectedEnquiry?.phone
    ? `https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}`
    : null;

  const selectEnquiry = (enquiry: CmsEnquiry) => {
    setSelectedEnquiry(enquiry);
    setFollowUpNote(enquiry.followUpNote || '');
    setSavedNote(enquiry.followUpNote || '');
    setActionError(null);
  };

  const handleStatusChange = async (id: string, nextStatus: EnquiryStatus) => {
    const previous = enquiries;
    setUpdatingStatus(true);
    setActionError(null);

    setEnquiries((current) =>
      current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
    setSelectedEnquiry((current) => (current && current.id === id ? { ...current, status: nextStatus } : current));

    try {
      await cmsService.updateEnquiryStatus(id, nextStatus, followUpNote);
      showNotification(`Status updated to ${STATUS_META[nextStatus].label}.`);
    } catch (err) {
      setEnquiries(previous);
      setSelectedEnquiry((current) => {
        if (!current || current.id !== id) return current;
        const original = previous.find((item) => item.id === id);
        return original ? { ...current, status: original.status } : current;
      });
      setActionError(err instanceof Error ? err.message : 'Could not update the enquiry status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveEnquiryNote = async () => {
    if (!selectedEnquiry || savingNote) return;
    setSavingNote(true);
    setActionError(null);
    try {
      await cmsService.updateEnquiryStatus(selectedEnquiry.id, normalizeStatus(selectedEnquiry.status), followUpNote);
      setSavedNote(followUpNote);
      setEnquiries((current) =>
        current.map((item) =>
          item.id === selectedEnquiry.id ? { ...item, followUpNote } : item
        )
      );
      setSelectedEnquiry((current) => (current ? { ...current, followUpNote } : current));
      showNotification('Follow-up notes saved.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save follow-up notes.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (!window.confirm('Delete this enquiry? This permanently removes the lead and cannot be undone.')) {
      return;
    }
    try {
      await cmsService.deleteEnquiry(id);
      showNotification('Enquiry deleted.');
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null);
      }
      await loadData(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete the enquiry.');
    }
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      setActionError('Could not copy the email. Check browser clipboard permissions.');
    }
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .inquiry-grid {
          display: grid;
          grid-template-columns: minmax(min(100%, 340px), 380px) minmax(0, 1fr);
          gap: 1.25rem;
          align-items: start;
        }
        .inquiry-list-scroll {
          max-height: calc(100vh - 330px);
          min-height: 360px;
          overflow-y: auto;
          padding: 0.45rem;
        }
        @media (max-width: 900px) {
          .inquiry-grid { grid-template-columns: 1fr; }
          .inquiry-list-scroll { max-height: 420px; min-height: 260px; }
        }
      `}</style>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: 42, height: 42, borderRadius: '12px', backgroundColor: '#ECFDF5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Inbox size={22} color="#047857" />
              </span>
              Inquiries Inbox
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.4rem' }}>
              Review contact form submissions, qualify leads, and keep follow-up notes in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: refreshing ? 'wait' : 'pointer',
              opacity: refreshing ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : undefined }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginTop: '1.25rem' }}>
          <StatCard label="Total inquiries" value={stats.total} icon={<Mail size={18} />} color="#047857" bg="#ECFDF5" border="#D1FAE5" />
          <StatCard label="New / unread" value={stats.fresh} icon={<Clock3 size={18} />} color="#2563EB" bg="#EFF6FF" border="#DBEAFE" />
          <StatCard label="Active pipeline" value={stats.active} icon={<TrendingUp size={18} />} color="#B45309" bg="#FFFBEB" border="#FEF3C7" />
          <StatCard label="Closed" value={stats.closed} icon={<CheckCircle2 size={18} />} color="#475569" bg="#F1F5F9" border="#E2E8F0" />
        </div>
      </div>

      {notification && (
        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.1rem', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', color: '#047857', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <CheckCircle2 size={16} /> {notification}
        </div>
      )}

      {(loadError || actionError) && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.1rem', backgroundColor: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', color: '#BE123C', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <AlertCircle size={16} /> {loadError || actionError}
        </div>
      )}

      <div className="inquiry-grid">
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '0.9rem', borderBottom: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <Search size={15} color="#64748B" />
              <input
                type="text"
                placeholder="Search name, email, company, country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#0F172A', fontSize: '0.8125rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '0.15rem' }}>
              {(['ALL', ...ENQUIRY_STATUSES] as const).map((status) => {
                const count = status === 'ALL' ? stats.total : stats.counts[status];
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    style={{
                      padding: '0.28rem 0.55rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? '#047857' : '#F1F5F9',
                      color: isActive ? '#FFFFFF' : '#475569',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {status === 'ALL' ? 'All' : STATUS_META[status].label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="inquiry-list-scroll">
            {loading ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                Loading inquiries...
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                {enquiries.length === 0 ? 'No inquiries yet. New contact form submissions will appear here.' : 'No inquiries match your filters.'}
              </div>
            ) : (
              filteredEnquiries.map((enquiry) => {
                const isSelected = selectedEnquiry?.id === enquiry.id;
                const details = parseEnquiryDetails(enquiry);
                const status = normalizeStatus(enquiry.status);
                return (
                  <button
                    key={enquiry.id}
                    type="button"
                    onClick={() => selectEnquiry(enquiry)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'block',
                      padding: '0.8rem',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? '#F0FDF4' : 'transparent',
                      border: isSelected ? '1px solid #A7F3D0' : '1px solid transparent',
                      marginBottom: '0.25rem',
                      cursor: 'pointer',
                      font: 'inherit',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <span style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: isSelected ? '#D1FAE5' : '#F1F5F9', color: isSelected ? '#047857' : '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                        {initials(enquiry.name) || <User size={14} />}
                      </span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8375rem', color: isSelected ? '#065F46' : '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {enquiry.name}
                          </span>
                          <StatusBadge status={status} />
                        </span>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#047857', fontWeight: 600, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {enquiry.companyName || enquiry.email}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {details.scope || enquiry.message}
                        </span>
                        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem', color: '#94A3B8', marginTop: '5px' }}>
                          <span>{details.country || details.focus || 'General inquiry'}</span>
                          <span title={new Date(enquiry.createdAt).toLocaleString()}>{formatRelativeDate(enquiry.createdAt)}</span>
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {selectedEnquiry && selectedDetails ? (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={19} color="#047857" /> {selectedEnquiry.name}
                </h2>
                <div style={{ fontSize: '0.8375rem', color: '#047857', fontWeight: 600 }}>
                  {selectedEnquiry.companyName || 'Individual / Private client'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <StatusBadge status={selectedEnquiry.status} />
                  {selectedDetails.focus && (
                    <span style={{ fontSize: '0.72rem', color: '#475569', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '9999px', padding: '0.2rem 0.55rem' }}>
                      {selectedDetails.focus}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  value={normalizeStatus(selectedEnquiry.status)}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value as EnquiryStatus)}
                  disabled={updatingStatus}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #047857',
                    color: '#065F46',
                    fontWeight: 700,
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8125rem',
                    outline: 'none',
                    cursor: updatingStatus ? 'wait' : 'pointer',
                    opacity: updatingStatus ? 0.65 : 1,
                  }}
                >
                  {ENQUIRY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_META[status].label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                  style={{ background: '#FFE4E6', border: '1px solid #FECDD3', color: '#BE123C', borderRadius: '8px', cursor: 'pointer', padding: '0.45rem', display: 'flex', alignItems: 'center' }}
                  title="Delete lead"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem', backgroundColor: '#F8FAFC', padding: '1.15rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <DetailField icon={<User size={12} />} label="Full name">{selectedEnquiry.name}</DetailField>
                <DetailField icon={<Mail size={12} />} label="Email">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <a href={`mailto:${selectedEnquiry.email}`} style={{ color: '#047857', textDecoration: 'none', wordBreak: 'break-all' }}>
                      {selectedEnquiry.email}
                    </a>
                    <button type="button" onClick={() => handleCopyEmail(selectedEnquiry.email)} style={{ border: 'none', background: 'transparent', color: copiedEmail ? '#059669' : '#94A3B8', cursor: 'pointer', padding: 0, display: 'inline-flex' }} title="Copy email">
                      {copiedEmail ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </span>
                </DetailField>
                <DetailField icon={<Building size={12} />} label="Company / Organization">{selectedEnquiry.companyName || 'Not specified'}</DetailField>
                <DetailField icon={<Phone size={12} />} label="Contact number">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedEnquiry.phone || 'Not provided'}
                    {selectedEnquiry.phone && (
                      <a href={`tel:${selectedEnquiry.phone}`} style={{ color: '#047857', fontSize: '0.75rem', textDecoration: 'underline' }}>Call</a>
                    )}
                  </span>
                </DetailField>
                <DetailField icon={<Globe size={12} />} label="Country / Region">{selectedDetails.country || 'Not specified'}</DetailField>
                <DetailField icon={<Calendar size={12} />} label="Received at">
                  <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{new Date(selectedEnquiry.createdAt).toLocaleString()}</span>
                </DetailField>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={14} color="#49243F" /> Project scope & requirements
                </h4>
                <div style={{ padding: '1.1rem', backgroundColor: '#FAFAFA', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#1E293B', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                  {selectedDetails.scope || 'No message provided.'}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Paperclip size={14} color="#C99B52" /> Attachments ({selectedDetails.attachments.length})
                </h4>
                <div style={{ padding: '0.8rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  {selectedDetails.attachments.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedDetails.attachments.map((file, index) => (
                        <span key={`${file}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.6rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.75rem', color: '#1E293B', fontWeight: 500 }}>
                          <FileText size={13} color="#047857" /> {file}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>No attachments submitted with this enquiry.</span>
                  )}
                </div>
              </div>

              {selectedEnquiry.consentAccepted !== false && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.8rem', borderRadius: '9999px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '0.75rem', fontWeight: 600 }}>
                    <ShieldCheck size={14} /> Client agreed to the Privacy Policy and authorized contact.
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MessageSquare size={14} color="#B45309" /> Team follow-up notes
                </h4>
                <textarea
                  rows={4}
                  placeholder="Record call logs, meeting dates, proposal status, or the next follow-up action..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.75rem', color: '#0F172A', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleSaveEnquiryNote}
                    disabled={savingNote || followUpNote === savedNote}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1.1rem',
                      backgroundColor: followUpNote === savedNote ? '#E2E8F0' : '#49243F',
                      border: `1px solid ${followUpNote === savedNote ? '#CBD5E1' : '#35182E'}`,
                      borderRadius: '8px',
                      color: followUpNote === savedNote ? '#64748B' : '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      cursor: savingNote || followUpNote === savedNote ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Save size={14} /> {savingNote ? 'Saving...' : followUpNote === savedNote ? 'Notes saved' : 'Save notes'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid #F1F5F9', backgroundColor: '#FCFCFD' }}>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <a href={`mailto:${selectedEnquiry.email}?subject=Regarding your inquiry with Azaroth Tech-Hive`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.05rem', backgroundColor: '#047857', color: '#FFFFFF', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, boxShadow: '0 2px 6px rgba(4, 120, 87, 0.22)' }}>
                  <Mail size={14} /> Reply via email
                </a>
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.05rem', backgroundColor: '#25D366', color: '#FFFFFF', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}>
                    <ExternalLink size={14} /> WhatsApp
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleStatusChange(selectedEnquiry.id, 'CONTACTED')}
                disabled={updatingStatus || normalizeStatus(selectedEnquiry.status) === 'CONTACTED'}
                style={{ padding: '0.55rem 1.1rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#334155', fontWeight: 600, fontSize: '0.8125rem', cursor: updatingStatus || normalizeStatus(selectedEnquiry.status) === 'CONTACTED' ? 'not-allowed' : 'pointer', opacity: normalizeStatus(selectedEnquiry.status) === 'CONTACTED' ? 0.6 : 1 }}
              >
                Mark as contacted
              </button>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px dashed #CBD5E1', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', minHeight: 420, padding: '2rem', textAlign: 'center' }}>
            <Inbox size={36} color="#94A3B8" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Select an inquiry</div>
            <div style={{ fontSize: '0.85rem' }}>Pick a lead from the inbox to view the full brief, contact details, and notes.</div>
          </div>
        )}
      </div>
    </div>
  );
};

