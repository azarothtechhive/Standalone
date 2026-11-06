// src/pages/admin/AdminMediaManager.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Upload,
  Trash2,
  Copy,
  CheckCircle2,
  FileText,
  RefreshCw,
  AlertCircle,
  Search,
  Film,
  HardDrive,
  Images,
} from "lucide-react";
import { cmsService, CmsMedia } from "../cmsService";
import { adminColors, adminStyles } from "../../styles/adminTheme";

const ACCEPTED_FILES =
  ".jpg,.jpeg,.png,.webp,.svg,.gif,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,image/svg+xml,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / Math.pow(1024, exponent)).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function isImage(media: CmsMedia): boolean {
  return Boolean(media.mimeType?.startsWith("image/"));
}

function mediaName(media: CmsMedia): string {
  return (
    media.displayName ||
    media.originalName ||
    media.filename ||
    "Untitled asset"
  );
}

function getMediaUrl(media: CmsMedia): string {
  if (!media.url) return "";
  const url = media.url.trim();
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
}

export const AdminMediaManager: React.FC = () => {
  const [mediaList, setMediaList] = useState<CmsMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [failedPreviews, setFailedPreviews] = useState<Record<string, boolean>>(
    {},
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError(null);
    try {
      const data = await cmsService.fetchMedia();
      setMediaList(data || []);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load media assets.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 3500);
  };

  const filteredMedia = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return mediaList;
    return mediaList.filter((media) =>
      [mediaName(media), media.mimeType, media.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [mediaList, searchTerm]);

  const stats = useMemo(() => {
    const images = mediaList.filter(isImage);
    const documents = mediaList.filter(
      (media) => !isImage(media) && !media.mimeType?.startsWith("video/"),
    );
    const videos = mediaList.filter((media) =>
      media.mimeType?.startsWith("video/"),
    );
    const totalBytes = mediaList.reduce(
      (sum, media) => sum + (media.sizeBytes || 0),
      0,
    );
    return {
      images: images.length,
      documents: documents.length,
      videos: videos.length,
      totalBytes,
    };
  }, [mediaList]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setActionError(null);
    let uploaded = 0;
    const failed: string[] = [];

    for (const file of files) {
      try {
        await cmsService.uploadMedia(file, "general", file.name);
        uploaded += 1;
      } catch (err) {
        failed.push(
          `${file.name}: ${err instanceof Error ? err.message : "upload failed"}`,
        );
      }
    }

    setIsUploading(false);
    event.target.value = "";

    if (uploaded > 0) {
      notify(
        `${uploaded} file${uploaded === 1 ? "" : "s"} uploaded successfully.`,
      );
      await loadMedia(true);
    }
    if (failed.length > 0) {
      setActionError(failed.join("  "));
    }
  };

  const handleCopyUrl = async (media: CmsMedia) => {
    const url = media.url.startsWith("http")
      ? media.url
      : `${window.location.origin}${media.url.startsWith("/") ? "" : "/"}${media.url}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(media.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setActionError(
        "Could not copy the URL. Check browser clipboard permissions.",
      );
    }
  };

  const handleDelete = async (media: CmsMedia) => {
    if (!window.confirm(`Delete "${mediaName(media)}"? This cannot be undone.`))
      return;
    setActionError(null);
    try {
      await cmsService.deleteMedia(media.id);
      notify(`Deleted "${mediaName(media)}".`);
      await loadMedia(true);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not delete this asset.",
      );
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", overflowX: "hidden" }}>
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
                color: adminColors.slate.textPrimary,
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
                  backgroundColor: adminColors.indigo.light,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image size={22} color={adminColors.indigo.text} />
              </span>
              Media Library &amp; Assets
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: adminColors.slate.textMuted,
                marginTop: "0.4rem",
              }}
            >
              Upload product screenshots, team avatars, architecture diagrams,
              and PDF whitepapers.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => loadMedia(true)}
              disabled={refreshing}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.55rem 0.95rem",
                borderRadius: "8px",
                border: `1px solid ${adminColors.slate.borderStrong}`,
                backgroundColor: "#FFFFFF",
                color: adminColors.slate.textSecondary,
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
            <label
              style={{
                ...adminStyles.successButton,
                cursor: isUploading ? "not-allowed" : "pointer",
                opacity: isUploading ? 0.7 : 1,
              }}
            >
              <Upload size={18} />
              <span>{isUploading ? "Uploading..." : "Upload Files"}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILES}
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "0.75rem",
            marginTop: "1.25rem",
          }}
        >
          {[
            {
              label: "Total assets",
              value: String(mediaList.length),
              icon: <Images size={17} />,
              color: "#4F46E5",
              bg: "#EEF2FF",
              border: "#E0E7FF",
            },
            {
              label: "Images",
              value: String(stats.images),
              icon: <Image size={17} />,
              color: "#047857",
              bg: "#ECFDF5",
              border: "#D1FAE5",
            },
            {
              label: "Documents",
              value: String(stats.documents),
              icon: <FileText size={17} />,
              color: "#B45309",
              bg: "#FFFBEB",
              border: "#FEF3C7",
            },
            {
              label: "Storage used",
              value: formatSize(stats.totalBytes),
              icon: <HardDrive size={17} />,
              color: "#475569",
              bg: "#F1F5F9",
              border: "#E2E8F0",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                padding: "0.95rem 1.1rem",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                border: `1px solid ${card.border}`,
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
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
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    lineHeight: 1.15,
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
            </div>
          ))}
        </div>
      </div>

      {notification && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.8rem 1.1rem",
            backgroundColor: adminColors.emerald.light,
            border: `1px solid ${adminColors.emerald.border}`,
            borderRadius: "10px",
            color: adminColors.emerald.text,
            marginBottom: "1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} /> {notification}
        </div>
      )}
      {(loadError || actionError) && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.8rem 1.1rem",
            backgroundColor: adminColors.rose.light,
            border: `1px solid ${adminColors.rose.border}`,
            borderRadius: "10px",
            color: adminColors.rose.text,
            marginBottom: "1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <AlertCircle size={16} /> {loadError || actionError}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          backgroundColor: "#FFFFFF",
          padding: "0.85rem 1rem",
          borderRadius: "12px",
          border: `1px solid ${adminColors.slate.border}`,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
          marginBottom: "1.25rem",
        }}
      >
        <Search size={17} color="#64748B" />
        <input
          type="text"
          placeholder="Search assets by name or file type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            backgroundColor: "transparent",
            border: "none",
            color: "#0F172A",
            fontSize: "0.875rem",
            outline: "none",
          }}
        />
        <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
          {filteredMedia.length} of {mediaList.length}
        </span>
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              style={{
                height: 250,
                borderRadius: "12px",
                backgroundColor: "#F1F5F9",
                border: `1px solid ${adminColors.slate.border}`,
              }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {filteredMedia.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "3.5rem 1.5rem",
                textAlign: "center",
                backgroundColor: adminColors.slate.card,
                borderRadius: "14px",
                border: `1px dashed ${adminColors.slate.borderStrong}`,
                color: adminColors.slate.textMuted,
              }}
            >
              <Upload
                size={36}
                color={adminColors.indigo.base}
                style={{ margin: "0 auto 0.75rem", opacity: 0.6 }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: adminColors.slate.textSecondary,
                }}
              >
                {mediaList.length === 0
                  ? "No files uploaded yet."
                  : "No assets match your search."}
              </p>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem" }}>
                {mediaList.length === 0
                  ? "UseœUpload Files to add images or document assets."
                  : "Try a different keyword or clear the search."}
              </p>
            </div>
          ) : (
            filteredMedia.map((media) => {
              const imageAsset = isImage(media);
              const copied = copiedId === media.id;
              const previewFailed = failedPreviews[media.id];
              return (
                <div
                  key={media.id}
                  style={{
                    backgroundColor: adminColors.slate.card,
                    border: `1px solid ${adminColors.slate.border}`,
                    borderRadius: "12px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: 160,
                      backgroundColor: adminColors.slate.cardMuted,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      borderBottom: `1px solid ${adminColors.slate.borderLight}`,
                    }}
                  >
                    {imageAsset && !previewFailed ? (
                      <img
                        src={getMediaUrl(media)}
                        alt={media.altText || mediaName(media)}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = "true";
                            const name = mediaName(media).toLowerCase();
                            if (name.includes("logo")) {
                              target.src = "/Logo.png";
                              return;
                            }
                            if (name.includes("favicon")) {
                              target.src = "/Favicon.png";
                              return;
                            }
                            if (
                              name.includes("portfolio") ||
                              name.includes("case")
                            ) {
                              target.src =
                                "/images/creative_portfolio_1791822919288.jpg";
                              return;
                            }
                            if (
                              name.includes("product") ||
                              name.includes("platform")
                            ) {
                              target.src = "/images/products/fms-cover.jpg";
                              return;
                            }
                            if (
                              name.includes("service") ||
                              name.includes("engineer")
                            ) {
                              target.src = "/images/services-engineering.jpg";
                              return;
                            }
                            if (
                              name.includes("insight") ||
                              name.includes("research")
                            ) {
                              target.src = "/images/insights-cover.jpg";
                              return;
                            }
                            target.src = "/images/hero-workspace.jpg";
                            return;
                          }
                          setFailedPreviews((current) => ({
                            ...current,
                            [media.id]: true,
                          }));
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        {media.mimeType?.startsWith("video/") ? (
                          <Film size={44} color={adminColors.slate.textLight} />
                        ) : media.mimeType === "application/pdf" ? (
                          <FileText size={44} color="#BE123C" />
                        ) : (
                          <FileText
                            size={44}
                            color={adminColors.slate.textLight}
                          />
                        )}
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            color: adminColors.slate.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {previewFailed
                            ? "Preview unavailable"
                            : media.mimeType?.split("/")[1] || "File"}
                        </span>
                      </div>
                    )}
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        padding: "0.2rem 0.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(15, 23, 42, 0.72)",
                        color: "#FFFFFF",
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      {media.isLocal
                        ? "Local only"
                        : imageAsset
                          ? "Image"
                          : media.mimeType === "application/pdf"
                            ? "PDF"
                            : "File"}
                    </span>
                  </div>

                  <div style={{ padding: "0.9rem" }}>
                    <div
                      title={mediaName(media)}
                      style={{
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        color: adminColors.slate.textPrimary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {mediaName(media)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: adminColors.slate.textMuted,
                      }}
                    >
                      {formatSize(media.sizeBytes)}{" "}
                      {media.mimeType || "unknown"}
                    </div>
                    {media.isLocal && (
                      <div
                        style={{
                          marginTop: "0.35rem",
                          fontSize: "0.6875rem",
                          color: adminColors.amber.text,
                          fontWeight: 600,
                        }}
                      >
                        Stored in this browser only
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "0.7rem",
                        borderTop: `1px solid ${adminColors.slate.borderLight}`,
                        paddingTop: "0.7rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(media)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          padding: "0.35rem 0.65rem",
                          borderRadius: "6px",
                          backgroundColor: copied
                            ? adminColors.emerald.light
                            : adminColors.indigo.light,
                          border: `1px solid ${copied ? adminColors.emerald.border : adminColors.indigo.border}`,
                          color: copied
                            ? adminColors.emerald.text
                            : adminColors.indigo.text,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Copy size={13} /> {copied ? "Copied" : "Copy URL"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(media)}
                        style={{
                          ...adminStyles.dangerButton,
                          padding: "0.35rem 0.5rem",
                        }}
                        title="Delete file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
