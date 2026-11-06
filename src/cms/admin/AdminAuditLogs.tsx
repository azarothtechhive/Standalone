// src/pages/admin/AdminAuditLogs.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  History,
  Search,
  RefreshCw,
  ShieldCheck,
  PencilLine,
  Trash2,
  LogIn,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock3,
  Download,
} from "lucide-react";
import { cmsService, CmsAuditLog } from "../cmsService";

type ActionFilter = "ALL" | "LOGIN" | "CREATE" | "UPDATE" | "DELETE";

function actionKind(action: string): Exclude<ActionFilter, "ALL"> {
  const value = (action || "").toUpperCase();
  if (value.includes("LOGIN") || value.includes("AUTH")) return "LOGIN";
  if (value.includes("DELETE") || value.includes("REMOVED")) return "DELETE";
  if (
    value.includes("CREATE") ||
    value.includes("UPLOAD") ||
    value.includes("PUBLISH")
  )
    return "CREATE";
  return "UPDATE";
}

const KIND_STYLE: Record<
  Exclude<ActionFilter, "ALL">,
  { bg: string; color: string; border: string }
> = {
  LOGIN: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  CREATE: { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" },
  UPDATE: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  DELETE: { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3" },
};

const KIND_ICON: Record<Exclude<ActionFilter, "ALL">, React.ReactNode> = {
  LOGIN: <LogIn size={13} />,
  CREATE: <ShieldCheck size={13} />,
  UPDATE: <PencilLine size={13} />,
  DELETE: <Trash2 size={13} />,
};

function formatRelative(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<CmsAuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const exportAuditLog = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `azaroth-audit-trail-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const loadLogs = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await cmsService.fetchAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load the audit trail.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const stats = useMemo(() => {
    const counts = { LOGIN: 0, CREATE: 0, UPDATE: 0, DELETE: 0 };
    for (const log of logs) {
      counts[actionKind(log.action)] += 1;
    }
    return { total: logs.length, ...counts };
  }, [logs]);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return logs.filter((log) => {
      const kind = actionKind(log.action);
      if (actionFilter !== "ALL" && kind !== actionFilter) return false;
      if (!query) return true;
      const details = JSON.stringify(log.details || {});
      return [
        log.userName,
        log.userId,
        log.action,
        log.module,
        log.entityType,
        log.entityId,
        log.ipAddress,
        details,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [logs, searchTerm, actionFilter]);

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#0F172A",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  backgroundColor: "#FFF1F2",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <History size={22} color="#BE123C" />
              </span>
              Security &amp; Audit Trail
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#64748B",
                marginTop: "0.4rem",
              }}
            >
              Immutable log of administrative actions, logins, content
              revisions, and system changes.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={exportAuditLog}
              disabled={logs.length === 0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.55rem 0.95rem",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#334155",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: logs.length === 0 ? "not-allowed" : "pointer",
                opacity: logs.length === 0 ? 0.6 : 1,
              }}
              title="Download audit trail as JSON"
            >
              <Download size={14} />
              Export
            </button>

            <button
              type="button"
              onClick={() => loadLogs(true)}
              disabled={refreshing}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.55rem 0.95rem",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#334155",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: refreshing ? "wait" : "pointer",
                opacity: refreshing ? 0.7 : 1,
              }}
            >
              <RefreshCw
                size={14}
                style={{
                  animation: refreshing ? "spin 1s linear infinite" : undefined,
                }}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "0.75rem",
            marginTop: "1.25rem",
          }}
        >
          {[
            {
              key: "ALL",
              label: "Total events",
              value: stats.total,
              icon: <History size={17} />,
              color: "#475569",
              bg: "#F1F5F9",
              border: "#E2E8F0",
            },
            {
              key: "UPDATE",
              label: "Edits & Updates",
              value: stats.UPDATE,
              icon: <PencilLine size={17} />,
              color: "#B45309",
              bg: "#FFFBEB",
              border: "#FDE68A",
            },
            {
              key: "LOGIN",
              label: "Logins",
              value: stats.LOGIN,
              icon: <LogIn size={17} />,
              color: "#1D4ED8",
              bg: "#EFF6FF",
              border: "#DBEAFE",
            },
            {
              key: "CREATE",
              label: "Created",
              value: stats.CREATE,
              icon: <ShieldCheck size={17} />,
              color: "#047857",
              bg: "#ECFDF5",
              border: "#D1FAE5",
            },
            {
              key: "DELETE",
              label: "Deleted",
              value: stats.DELETE,
              icon: <Trash2 size={17} />,
              color: "#BE123C",
              bg: "#FFF1F2",
              border: "#FFE4E6",
            },
          ].map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => setActionFilter(card.key as ActionFilter)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                padding: "0.95rem 1.1rem",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                border: `1px solid ${actionFilter === card.key ? card.color : card.border}`,
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  backgroundColor: card.bg,
                  color: card.color,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </span>
              <span>
                <span
                  style={{
                    display: "block",
                    fontSize: "1.375rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    lineHeight: 1.1,
                  }}
                >
                  {card.value}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "#64748B",
                    fontWeight: 600,
                  }}
                >
                  {card.label}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.8rem 1.1rem",
            backgroundColor: "#FFF1F2",
            border: "1px solid #FECDD3",
            borderRadius: "10px",
            color: "#BE123C",
            marginBottom: "1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
          backgroundColor: "#FFFFFF",
          padding: "0.85rem 1rem",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
          marginBottom: "1rem",
        }}
      >
        <Search size={17} color="#64748B" />
        <input
          type="text"
          placeholder="Filter by user, email, action, module, entity, IP, or details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            backgroundColor: "transparent",
            border: "none",
            color: "#0F172A",
            fontSize: "0.875rem",
            outline: "none",
          }}
        />
        <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
          {filtered.length} of {logs.length}
        </span>
      </div>

      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "12px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.8375rem",
            minWidth: 820,
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                color: "#475569",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <th style={{ width: 36, padding: "0.9rem 0.5rem 0.9rem 1rem" }} />
              <th style={{ padding: "0.9rem 0.75rem", fontWeight: 700 }}>
                Timestamp
              </th>
              <th style={{ padding: "0.9rem 0.75rem", fontWeight: 700 }}>
                User
              </th>
              <th style={{ padding: "0.9rem 0.75rem", fontWeight: 700 }}>
                Action
              </th>
              <th style={{ padding: "0.9rem 0.75rem", fontWeight: 700 }}>
                Module
              </th>
              <th style={{ padding: "0.9rem 0.75rem", fontWeight: 700 }}>
                Entity
              </th>
              <th
                style={{
                  padding: "0.9rem 1rem 0.9rem 0.75rem",
                  fontWeight: 700,
                }}
              >
                IP address
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "#64748B",
                  }}
                >
                  Loading audit trail...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "#64748B",
                  }}
                >
                  {logs.length === 0
                    ? "No audit entries yet."
                    : "No audit entries match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((log) => {
                const kind = actionKind(log.action);
                const style = KIND_STYLE[kind];
                const isExpanded = expandedId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        cursor: "pointer",
                        backgroundColor: isExpanded ? "#F8FAFC" : "transparent",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.85rem 0.5rem 0.85rem 1rem",
                          color: "#94A3B8",
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown size={15} />
                        ) : (
                          <ChevronRight size={15} />
                        )}
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 0.75rem",
                          color: "#475569",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          title={new Date(log.createdAt).toLocaleString()}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <Clock3 size={12} color="#94A3B8" />{" "}
                          {formatRelative(log.createdAt)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 0.75rem",
                          fontWeight: 700,
                          color: "#0F172A",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.userName || "System"}
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "6px",
                            fontSize: "0.67rem",
                            fontWeight: 700,
                            backgroundColor: style.bg,
                            color: style.color,
                            border: `1px solid ${style.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {KIND_ICON[kind]} {log.action || "UNKNOWN"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 0.75rem",
                          color: "#334155",
                          fontWeight: 600,
                        }}
                      >
                        {log.module || "system"}
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 0.75rem",
                          color: "#64748B",
                          fontFamily: "monospace",
                          fontSize: "0.72rem",
                          maxWidth: 210,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.entityType || log.module || "system"} (
                        {log.entityId || "none"})
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 1rem 0.85rem 0.75rem",
                          color: "#94A3B8",
                          fontSize: "0.72rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.ipAddress || ""}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderBottom: "1px solid #E2E8F0",
                        }}
                      >
                        <td />
                        <td
                          colSpan={6}
                          style={{ padding: "0 1rem 1rem 0.75rem" }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: "0.75rem",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: "0.66rem",
                                  fontWeight: 700,
                                  color: "#64748B",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                Event details
                              </div>
                              <pre
                                style={{
                                  margin: 0,
                                  padding: "0.7rem",
                                  borderRadius: "8px",
                                  backgroundColor: "#0F172A",
                                  color: "#E2E8F0",
                                  fontSize: "0.7rem",
                                  lineHeight: 1.55,
                                  overflowX: "auto",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {JSON.stringify(log.details || {}, null, 2)}
                              </pre>
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#475569",
                                lineHeight: 1.8,
                              }}
                            >
                              <div>
                                <strong style={{ color: "#334155" }}>
                                  Event ID:
                                </strong>{" "}
                                {log.id}
                              </div>
                              <div>
                                <strong style={{ color: "#334155" }}>
                                  User ID:
                                </strong>{" "}
                                {log.userId || ""}
                              </div>
                              <div>
                                <strong style={{ color: "#334155" }}>
                                  Exact time:
                                </strong>{" "}
                                {new Date(log.createdAt).toLocaleString()}
                              </div>
                              <div>
                                <strong style={{ color: "#334155" }}>
                                  IP address:
                                </strong>{" "}
                                {log.ipAddress || ""}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
