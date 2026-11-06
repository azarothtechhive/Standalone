// src/pages/admin/AdminPagesManager.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  Info,
  Compass,
  Shield,
  FileCheck,
  Briefcase,
  BookOpen,
  MessageSquareQuote,
  PhoneCall,
  HelpCircle,
  ExternalLink,
  Layers,
  Building2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useCMS, defaultPages } from "../CMSContext";
import {
  addPageSection,
  getDefaultPageSections,
  movePageSection,
  normalizePageBuilderDocument,
  type CmsPageSection,
} from "../../utils/pageBuilder";
import { isAllowedCmsHref } from "../../components/common/CmsPageLayout";
import { HeroImageControl } from "../../components/admin/HeroImageControl";
import { ContactFormColumn, DEFAULT_CONTACT_FORM_COLUMNS } from "../../types";

type PageTabKey =
  | "home"
  | "about"
  | "products"
  | "services"
  | "portfolio"
  | "insights"
  | "testimonials"
  | "connect"
  | "privacy-policy"
  | "terms-of-service"
  | "not-found";

export const AdminPagesManager: React.FC = () => {
  const {
    pages,
    updatePage,
    publishPage,
    products,
    services,
    portfolio,
    insights,
    testimonials,
  } = useCMS();
  const [activeTab, setActiveTab] = useState<PageTabKey>("home");
  const [formData, setFormData] = useState<any>({});
  const [aboutAuxData, setAboutAuxData] = useState<{
    values: any;
    deliveryFramework: any;
  }>({
    values: defaultPages.values,
    deliveryFramework: defaultPages["delivery-framework"],
  });
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sectionToRestore, setSectionToRestore] = useState("");

  const pageTabs: {
    key: PageTabKey;
    label: string;
    route: string;
    sectionCount: string;
    icon: React.FC<{ size?: number }>;
  }[] = [
    {
      key: "home",
      label: "1. Home Page",
      route: "/",
      sectionCount: "9 Sections",
      icon: Home,
    },
    {
      key: "about",
      label: "2. Who We Are (About)",
      route: "/about",
      sectionCount: "5 Sections",
      icon: Info,
    },
    {
      key: "products",
      label: "3. Products",
      route: "/products",
      sectionCount: "3 Sections",
      icon: Building2,
    },
    {
      key: "services",
      label: "4. Services",
      route: "/services",
      sectionCount: "5 Sections",
      icon: Layers,
    },
    {
      key: "portfolio",
      label: "5. Our Portfolio",
      route: "/portfolio",
      sectionCount: "5 Sections",
      icon: Briefcase,
    },
    {
      key: "insights",
      label: "6. Resource Hub",
      route: "/resource-hub",
      sectionCount: "4 Sections",
      icon: BookOpen,
    },
    {
      key: "testimonials",
      label: "7. Testimonials",
      route: "/testimonials",
      sectionCount: "3 Sections",
      icon: MessageSquareQuote,
    },
    {
      key: "connect",
      label: "8. Connect With Us",
      route: "/connect-with-us",
      sectionCount: "2 Sections",
      icon: PhoneCall,
    },
    {
      key: "privacy-policy",
      label: "9. Privacy Policy",
      route: "/privacy-policy",
      sectionCount: "3 Sections",
      icon: Shield,
    },
    {
      key: "terms-of-service",
      label: "10. Terms of Service",
      route: "/terms-of-service",
      sectionCount: "3 Sections",
      icon: FileCheck,
    },
    {
      key: "not-found",
      label: "11. 404 Route Not Found",
      route: "/404",
      sectionCount: "1 Section",
      icon: HelpCircle,
    },
  ];

  useEffect(() => {
    const rawPage = pages[activeTab] || defaultPages[activeTab] || {};
    setFormData(
      normalizePageBuilderDocument(
        activeTab,
        JSON.parse(JSON.stringify(rawPage)),
      ),
    );
    if (activeTab === "about") {
      setAboutAuxData({
        values: JSON.parse(
          JSON.stringify(pages.values || defaultPages.values || {}),
        ),
        deliveryFramework: JSON.parse(
          JSON.stringify(
            pages["delivery-framework"] ||
              defaultPages["delivery-framework"] ||
              {},
          ),
        ),
      });
    }
  }, [activeTab, pages]);

  const saveDraft = async () => {
    const currentTabInfo = pageTabs.find((t) => t.key === activeTab);
    await updatePage(activeTab, formData, currentTabInfo?.label || activeTab);
    if (activeTab === "about") {
      await updatePage("values", aboutAuxData.values, "Our Core Values");
      await updatePage(
        "delivery-framework",
        aboutAuxData.deliveryFramework,
        "Delivery Framework",
      );
    }
  };

  const validateBuilderLinks = () => {
    const invalidLink = formData.builder?.sections?.find(
      (section: CmsPageSection) =>
        section.content?.buttonHref &&
        !isAllowedCmsHref(section.content.buttonHref),
    );
    if (!invalidLink) return true;
    setSaveError(
      `The ${invalidLink.label} button URL must be a site path or an HTTP(S) URL.`,
    );
    return false;
  };

  const handleSave = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    setIsSaving(true);
    setSavedNotice(null);
    setSaveError(null);
    if (!validateBuilderLinks()) {
      setIsSaving(false);
      return;
    }
    try {
      await saveDraft();
      setSavedNotice("Draft saved. It is not public until you publish it.");
      setTimeout(() => setSavedNotice(null), 5000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save page draft.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setSavedNotice(null);
    setSaveError(null);
    if (!validateBuilderLinks()) {
      setIsSaving(false);
      return;
    }
    try {
      await saveDraft();
      await publishPage(activeTab);
      if (activeTab === "about") {
        await publishPage("values");
        await publishPage("delivery-framework");
      }
      setSavedNotice("Page changes are published to the live website.");
      setTimeout(() => setSavedNotice(null), 5000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not publish page changes.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const builderSections: CmsPageSection[] =
    formData.builder?.sections || getDefaultPageSections(activeTab);
  const setBuilderSections = (sections: CmsPageSection[]) => {
    setFormData((previous: any) => ({
      ...previous,
      builder: {
        version: 1,
        sections: sections.map((section, index) => ({
          ...section,
          order: index + 1,
        })),
      },
    }));
  };
  const restoreableSections = getDefaultPageSections(activeTab).filter(
    (section) => !builderSections.some((current) => current.id === section.id),
  );
  const updateBuilderSection = (
    sectionId: string,
    patch: Partial<CmsPageSection>,
  ) => {
    setBuilderSections(
      builderSections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    );
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    backgroundColor: "#F8FAFC",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    color: "#0F172A",
    fontSize: "0.875rem",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#334155",
    marginBottom: "0.375rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const sectionCardStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
  };

  const sectionBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.25rem 0.625rem",
    borderRadius: "6px",
    backgroundColor: "#F5EDF3",
    color: "#49243F",
    fontSize: "0.7rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "0.5rem",
  };

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#0F172A",
              marginBottom: "0.25rem",
            }}
          >
            Website Pages & Sections (Page-Wise Editor)
          </h1>
          <p style={{ color: "#475569", fontSize: "0.875rem", margin: 0 }}>
            Select any website page below to edit all of its sections, headings,
            FAQs, Featured Projects, Industry tabs, and CTAs in top-to-bottom
            page order.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a
            href={`${pageTabs.find((t) => t.key === activeTab)?.route || "/"}?cms-preview=draft`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.625rem 1rem",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: "8px",
              color: "#334155",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ExternalLink size={15} /> Preview Draft
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              backgroundColor: "#49243F",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: isSaving ? "wait" : "pointer",
              opacity: isSaving ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(73, 36, 63, 0.25)",
            }}
          >
            <Save size={16} /> {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              backgroundColor: "#047857",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: isSaving ? "wait" : "pointer",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <CheckCircle2 size={16} /> {isSaving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {savedNotice && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            backgroundColor: "#ECFDF5",
            border: "1px solid #10B981",
            borderRadius: "10px",
            color: "#047857",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} /> {savedNotice}
        </div>
      )}
      {saveError && (
        <div
          role="alert"
          style={{
            padding: "0.875rem 1.25rem",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "10px",
            color: "#B91C1C",
            marginBottom: "1.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          Page changes were not fully saved: {saveError}
        </div>
      )}

      {/* Page-Wise Selector Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.75rem",
        }}
      >
        {pageTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.35rem",
                padding: "0.875rem 1rem",
                borderRadius: "10px",
                border: isActive ? "2px solid #49243F" : "1px solid #E2E8F0",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: isActive ? "#F5EDF3" : "#FFFFFF",
                color: isActive ? "#49243F" : "#1E293B",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: isActive ? "#8A315D" : "#64748B",
                }}
              >
                <span>Route: {tab.route}</span>
                <span>{tab.sectionCount}</span>
              </div>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        <div style={sectionCardStyle}>
          <div style={sectionBadgeStyle}>Page Builder Approved Blocks</div>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 800,
              color: "#0F172A",
              margin: "0 0 0.5rem",
            }}
          >
            Page structure
          </h3>
          <p style={{ color: "#64748B", fontSize: "0.875rem", marginTop: 0 }}>
            Reorder or hide existing sections, restore a removed section, or add
            a safe text or call-to-action block. Draft changes remain private
            until published.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {builderSections.map((section, index) => {
              const isEditableBlock = section.type !== "legacy";
              return (
                <div
                  key={section.id}
                  style={{
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    padding: "1rem",
                    backgroundColor: section.isVisible ? "#FFFFFF" : "#F8FAFC",
                    opacity: section.isVisible ? 1 : 0.75,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(160px, 1fr) auto auto auto auto",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <input
                      aria-label={`Section ${index + 1} name`}
                      style={inputStyle}
                      value={section.label}
                      onChange={(event) =>
                        updateBuilderSection(section.id, {
                          label: event.target.value,
                        })
                      }
                    />
                    <span
                      style={{
                        color: "#64748B",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {section.type === "legacy"
                        ? "Existing section"
                        : section.type === "richText"
                          ? "Text block"
                          : "Call to action"}
                    </span>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        color: "#334155",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={section.isVisible}
                        onChange={(event) =>
                          updateBuilderSection(section.id, {
                            isVisible: event.target.checked,
                          })
                        }
                      />
                      Visible
                    </label>
                    <button
                      type="button"
                      aria-label={`Move ${section.label} up`}
                      disabled={index === 0}
                      onClick={() =>
                        setBuilderSections(
                          movePageSection(builderSections, section.id, -1),
                        )
                      }
                    >
                      <ArrowUp size={16} />
                    </button>
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <button
                        type="button"
                        aria-label={`Move ${section.label} down`}
                        disabled={index === builderSections.length - 1}
                        onClick={() =>
                          setBuilderSections(
                            movePageSection(builderSections, section.id, 1),
                          )
                        }
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${section.label}`}
                        onClick={() =>
                          setBuilderSections(
                            builderSections
                              .filter((entry) => entry.id !== section.id)
                              .map((entry, order) => ({
                                ...entry,
                                order: order + 1,
                              })),
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {isEditableBlock && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                        marginTop: "0.75rem",
                      }}
                    >
                      <input
                        aria-label={`${section.label} eyebrow`}
                        style={inputStyle}
                        placeholder="Eyebrow (optional)"
                        value={section.content?.eyebrow || ""}
                        onChange={(event) =>
                          updateBuilderSection(section.id, {
                            content: {
                              ...section.content,
                              eyebrow: event.target.value,
                            },
                          })
                        }
                      />
                      <input
                        aria-label={`${section.label} title`}
                        style={inputStyle}
                        placeholder="Heading"
                        value={section.content?.title || ""}
                        onChange={(event) =>
                          updateBuilderSection(section.id, {
                            content: {
                              ...section.content,
                              title: event.target.value,
                            },
                          })
                        }
                      />
                      <textarea
                        aria-label={`${section.label} body`}
                        style={inputStyle}
                        rows={3}
                        placeholder="Text"
                        value={section.content?.body || ""}
                        onChange={(event) =>
                          updateBuilderSection(section.id, {
                            content: {
                              ...section.content,
                              body: event.target.value,
                            },
                          })
                        }
                      />
                      <select
                        aria-label={`${section.label} appearance`}
                        style={inputStyle}
                        value={section.appearance}
                        onChange={(event) =>
                          updateBuilderSection(section.id, {
                            appearance: event.target
                              .value as CmsPageSection["appearance"],
                          })
                        }
                      >
                        <option value="default">Default appearance</option>
                        <option value="warm">Warm canvas</option>
                        <option value="brand">Brand background</option>
                      </select>
                      {section.type === "callToAction" && (
                        <>
                          <input
                            aria-label={`${section.label} button label`}
                            style={inputStyle}
                            placeholder="Button label"
                            value={section.content?.buttonLabel || ""}
                            onChange={(event) =>
                              updateBuilderSection(section.id, {
                                content: {
                                  ...section.content,
                                  buttonLabel: event.target.value,
                                },
                              })
                            }
                          />
                          <input
                            aria-label={`${section.label} button URL`}
                            style={inputStyle}
                            placeholder="Button URL (e.g. /connect-with-us)"
                            value={section.content?.buttonHref || ""}
                            onChange={(event) =>
                              updateBuilderSection(section.id, {
                                content: {
                                  ...section.content,
                                  buttonHref: event.target.value,
                                },
                              })
                            }
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setBuilderSections(addPageSection(builderSections, "richText"))
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.55rem 0.8rem",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                background: "#FFFFFF",
                color: "#334155",
                fontWeight: 700,
              }}
            >
              <Plus size={15} /> Add text block
            </button>
            <button
              type="button"
              onClick={() =>
                setBuilderSections(
                  addPageSection(builderSections, "callToAction"),
                )
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.55rem 0.8rem",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                background: "#FFFFFF",
                color: "#334155",
                fontWeight: 700,
              }}
            >
              <Plus size={15} /> Add call to action
            </button>
            {restoreableSections.length > 0 && (
              <>
                <select
                  aria-label="Select a removed page section to restore"
                  style={{ ...inputStyle, width: "auto", minWidth: "220px" }}
                  value={sectionToRestore}
                  onChange={(event) => setSectionToRestore(event.target.value)}
                >
                  <option value="">Restore a removed section¦</option>
                  {restoreableSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!sectionToRestore}
                  onClick={() => {
                    const section = restoreableSections.find(
                      (entry) => entry.id === sectionToRestore,
                    );
                    if (section) {
                      setBuilderSections([
                        ...builderSections,
                        { ...section, order: builderSections.length + 1 },
                      ]);
                      setSectionToRestore("");
                    }
                  }}
                  style={{
                    padding: "0.55rem 0.8rem",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    color: "#334155",
                    fontWeight: 700,
                  }}
                >
                  Restore
                </button>
              </>
            )}
          </div>
        </div>
        {/* =========================================================
            PAGE 1: HOME PAGE (ALL 9 SECTIONS)
        ========================================================= */}
        {(activeTab === "products" || activeTab === "services") && (
          <div style={sectionCardStyle}>
            <div style={sectionBadgeStyle}>
              {activeTab === "products" ? "Products Page" : "Services Page"}
              Content
            </div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 800,
                color: "#0F172A",
                marginBottom: "1rem",
              }}
            >
              Page copy
            </h3>
            {(activeTab === "products"
              ? [
                  { key: "kicker", label: "Hero Kicker" },
                  { key: "heroTitle", label: "Hero Title" },
                  {
                    key: "heroSubtitle",
                    label: "Hero Description",
                    multiline: true,
                  },
                  { key: "seoTitle", label: "SEO Browser Title" },
                  {
                    key: "seoDescription",
                    label: "SEO Meta Description",
                    multiline: true,
                  },
                ]
              : [
                  { key: "kicker", label: "Hero Kicker" },
                  { key: "heroTitle", label: "Hero Title" },
                  { key: "heroTitleHighlight", label: "Hero Title Highlight" },
                  {
                    key: "heroSubtitle",
                    label: "Hero Description",
                    multiline: true,
                  },
                  { key: "heroNote", label: "Hero Note", multiline: true },
                  {
                    key: "startCardTitle",
                    label: "'Start with where you are' Card Title",
                  },
                  {
                    key: "startCardCopy",
                    label: "'Start with where you are' Card Description",
                    multiline: true,
                  },
                  { key: "practicesKicker", label: "Practices Kicker Badge" },
                  { key: "practicesTitle", label: "Practices Heading" },
                  {
                    key: "practicesSubtitle",
                    label: "Practices Description",
                    multiline: true,
                  },
                  { key: "domainsKicker", label: "Domains Kicker Badge" },
                  { key: "domainsTitle", label: "Domains Heading" },
                  {
                    key: "domainsSubtitle",
                    label: "Domains Description",
                    multiline: true,
                  },
                  { key: "nextStepsKicker", label: "Next Steps Kicker Badge" },
                  { key: "nextStepsTitle", label: "Next Steps Heading" },
                  {
                    key: "nextStepsSubtitle",
                    label: "Next Steps Description",
                    multiline: true,
                  },
                  { key: "seoTitle", label: "SEO Browser Title" },
                  {
                    key: "seoDescription",
                    label: "SEO Meta Description",
                    multiline: true,
                  },
                ]
            ).map((field) => (
              <div key={field.key} style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>{field.label}</label>
                {field.multiline ? (
                  <textarea
                    rows={3}
                    style={inputStyle}
                    value={formData[field.key] || ""}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        [field.key]: event.target.value,
                      })
                    }
                  />
                ) : (
                  <input
                    style={inputStyle}
                    value={formData[field.key] || ""}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        [field.key]: event.target.value,
                      })
                    }
                  />
                )}
              </div>
            ))}

            {activeTab === "services" && (
              <div
                style={{
                  marginTop: "1.5rem",
                  borderTop: "1px solid #E2E8F0",
                  paddingTop: "1rem",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: "0.75rem",
                  }}
                >
                  What Happens Next (Engagement Steps)
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {[0, 1, 2].map((idx) => {
                    const fallbackSteps = [
                      {
                        step: "01",
                        iconName: "MessageSquare",
                        title: "Share your context",
                        description:
                          "Tell us about your goals, current systems, constraints, and what prompted the conversation.",
                      },
                      {
                        step: "02",
                        iconName: "Compass",
                        title: "Discovery conversation",
                        description:
                          "We discuss priorities, architecture, options, and the practical trade-offs involved.",
                      },
                      {
                        step: "03",
                        iconName: "FileText",
                        title: "Written next step",
                        description:
                          "If there is a fit, we provide a scope summary, a recommended engagement model, and clear next actions.",
                      },
                    ];
                    const currentSteps =
                      Array.isArray(formData.nextSteps) &&
                      formData.nextSteps.length === 3
                        ? formData.nextSteps
                        : fallbackSteps;
                    const step = currentSteps[idx] || fallbackSteps[idx];

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: "0.75rem",
                          backgroundColor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 2fr",
                            gap: "0.75rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div>
                            <label
                              style={{ ...labelStyle, fontSize: "0.72rem" }}
                            >
                              Step Number
                            </label>
                            <input
                              style={{
                                ...inputStyle,
                                padding: "0.4rem 0.6rem",
                                fontSize: "0.8rem",
                              }}
                              value={step.step || `0${idx + 1}`}
                              onChange={(e) => {
                                const next = [...currentSteps];
                                next[idx] = {
                                  ...next[idx],
                                  step: e.target.value,
                                };
                                setFormData({ ...formData, nextSteps: next });
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{ ...labelStyle, fontSize: "0.72rem" }}
                            >
                              Step Title
                            </label>
                            <input
                              style={{
                                ...inputStyle,
                                padding: "0.4rem 0.6rem",
                                fontSize: "0.8rem",
                              }}
                              value={step.title || ""}
                              onChange={(e) => {
                                const next = [...currentSteps];
                                next[idx] = {
                                  ...next[idx],
                                  title: e.target.value,
                                };
                                setFormData({ ...formData, nextSteps: next });
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: "0.72rem" }}>
                            Description
                          </label>
                          <textarea
                            rows={2}
                            style={{
                              ...inputStyle,
                              padding: "0.4rem 0.6rem",
                              fontSize: "0.8rem",
                            }}
                            value={step.description || ""}
                            onChange={(e) => {
                              const next = [...currentSteps];
                              next[idx] = {
                                ...next[idx],
                                description: e.target.value,
                              };
                              setFormData({ ...formData, nextSteps: next });
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "home" && (
          <div>
            {/* SECTION 1: HERO BANNER & METRICS */}
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>Home Page Section 1 of 9</div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Hero Banner & Key Performance Metrics
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Main Headline (Line 1 - White)
                  </label>
                  <input
                    style={inputStyle}
                    value={formData.hero?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...(formData.hero || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Headline Highlight (Line 2 - Gold)
                  </label>
                  <input
                    style={inputStyle}
                    value={formData.hero?.titleHighlight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...(formData.hero || {}),
                          titleHighlight: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Hero Subtitle Description</label>
                <textarea
                  rows={3}
                  style={inputStyle}
                  value={formData.hero?.subtitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: {
                        ...(formData.hero || {}),
                        subtitle: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Primary Button Label</label>
                  <input
                    style={inputStyle}
                    value={
                      formData.hero?.primaryCtaText ||
                      formData.hero?.primaryCta?.label ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...(formData.hero || {}),
                          primaryCtaText: e.target.value,
                          primaryCta: {
                            ...(formData.hero?.primaryCta || {}),
                            label: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Primary Button URL</label>
                  <input
                    style={inputStyle}
                    value={
                      formData.hero?.primaryCtaLink ||
                      formData.hero?.primaryCta?.href ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...(formData.hero || {}),
                          primaryCtaLink: e.target.value,
                          primaryCta: {
                            ...(formData.hero?.primaryCta || {}),
                            href: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Secondary Button Label</label>
                  <input
                    style={inputStyle}
                    value={
                      formData.hero?.secondaryCtaText ||
                      formData.hero?.secondaryCta?.label ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...(formData.hero || {}),
                          secondaryCtaText: e.target.value,
                          secondaryCta: {
                            ...(formData.hero?.secondaryCta || {}),
                            label: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Secondary Button URL</label>
                  <input
                    style={inputStyle}
                    value={
                      formData.hero?.secondaryCtaLink ||
                      formData.hero?.secondaryCta?.href ||
                      ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...(formData.hero || {}),
                          secondaryCtaLink: e.target.value,
                          secondaryCta: {
                            ...(formData.hero?.secondaryCta || {}),
                            href: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <label style={labelStyle}>
                Hero Bottom Key Metrics (4 Cards)
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
                  gap: "0.75rem",
                }}
              >
                {(formData.hero?.stats || []).map((st: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#F8FAFC",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <label style={{ ...labelStyle, fontSize: "0.68rem" }}>
                      Metric {idx + 1} Value
                    </label>
                    <input
                      style={{ ...inputStyle, marginBottom: "0.5rem" }}
                      value={st.value || ""}
                      onChange={(e) => {
                        const next = [...(formData.hero?.stats || [])];
                        next[idx] = { ...next[idx], value: e.target.value };
                        setFormData({
                          ...formData,
                          hero: { ...(formData.hero || {}), stats: next },
                        });
                      }}
                    />
                    <label style={{ ...labelStyle, fontSize: "0.68rem" }}>
                      Metric {idx + 1} Label
                    </label>
                    <input
                      style={inputStyle}
                      value={st.label || ""}
                      onChange={(e) => {
                        const next = [...(formData.hero?.stats || [])];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setFormData({
                          ...formData,
                          hero: { ...(formData.hero || {}), stats: next },
                        });
                      }}
                    />
                  </div>
                ))}
              </div>

              <HeroImageControl
                label="Hero Showcase Visual (Laptop Desk & Floating Services)"
                imageUrl={formData.hero?.imageUrl || ""}
                imageAlt={formData.hero?.imageAlt || ""}
                imageFit={formData.hero?.imageFit || "cover"}
                onImageChange={(url) =>
                  setFormData({
                    ...formData,
                    hero: { ...(formData.hero || {}), imageUrl: url },
                  })
                }
                onAltChange={(alt) =>
                  setFormData({
                    ...formData,
                    hero: { ...(formData.hero || {}), imageAlt: alt },
                  })
                }
                onFitChange={(fit) =>
                  setFormData({
                    ...formData,
                    hero: { ...(formData.hero || {}), imageFit: fit },
                  })
                }
                onRemove={() =>
                  setFormData({
                    ...formData,
                    hero: {
                      ...(formData.hero || {}),
                      imageUrl: "",
                      imageAlt: "",
                    },
                  })
                }
                pageName="Home Hero"
              />

              {/* Floating Badges Configuration */}
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <h4
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: "0.75rem",
                  }}
                >
                  Floating Tech Badges (5 badges)
                </h4>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "#64748B",
                    marginBottom: "1rem",
                  }}
                >
                  Customize the floating badges that appear on the hero image.
                  Each badge can have custom text, icon, position, and colors.
                </p>
                {(formData.hero?.floatingBadges || []).map(
                  (badge: any, idx: number) => (
                    <div
                      key={badge.id || idx}
                      style={{
                        padding: "1rem",
                        backgroundColor: "#F8FAFC",
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "#49243F",
                          }}
                        >
                          Badge {idx + 1}
                        </span>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={badge.isVisible !== false}
                            onChange={(e) => {
                              const next = [
                                ...(formData.hero?.floatingBadges || []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                isVisible: e.target.checked,
                              };
                              setFormData({
                                ...formData,
                                hero: {
                                  ...(formData.hero || {}),
                                  floatingBadges: next,
                                },
                              });
                            }}
                          />
                          Visible
                        </label>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
                          gap: "0.75rem",
                        }}
                      >
                        <div>
                          <label style={{ ...labelStyle, fontSize: "0.68rem" }}>
                            Badge Text
                          </label>
                          <input
                            style={{ ...inputStyle, fontSize: "0.8125rem" }}
                            value={badge.text || ""}
                            onChange={(e) => {
                              const next = [
                                ...(formData.hero?.floatingBadges || []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                text: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                hero: {
                                  ...(formData.hero || {}),
                                  floatingBadges: next,
                                },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: "0.68rem" }}>
                            Icon Name (Lucide)
                          </label>
                          <input
                            style={{ ...inputStyle, fontSize: "0.8125rem" }}
                            value={badge.iconName || ""}
                            onChange={(e) => {
                              const next = [
                                ...(formData.hero?.floatingBadges || []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                iconName: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                hero: {
                                  ...(formData.hero || {}),
                                  floatingBadges: next,
                                },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: "0.68rem" }}>
                            Icon Color
                          </label>
                          <input
                            type="color"
                            style={{
                              ...inputStyle,
                              padding: "0.25rem",
                              height: "36px",
                            }}
                            value={badge.colors?.iconColor || "#7C3AED"}
                            onChange={(e) => {
                              const next = [
                                ...(formData.hero?.floatingBadges || []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                colors: {
                                  ...(next[idx].colors || {}),
                                  iconColor: e.target.value,
                                },
                              };
                              setFormData({
                                ...formData,
                                hero: {
                                  ...(formData.hero || {}),
                                  floatingBadges: next,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Traces Configuration */}
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <h4
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: "0.75rem",
                  }}
                >
                  Connecting Traces (5 dotted lines)
                </h4>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "#64748B",
                    marginBottom: "1rem",
                  }}
                >
                  Customize the dotted connecting lines from badges to the
                  laptop.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.hero?.tracesEnabled !== false}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          hero: {
                            ...(formData.hero || {}),
                            tracesEnabled: e.target.checked,
                          },
                        });
                      }}
                    />
                    Enable Traces
                  </label>
                </div>
                {(() => {
                  const defaultTracesConfig = [
                    {
                      id: "trace-1",
                      label: "Trace 1 (Web Development)",
                      defaultColor: "#7C3AED",
                      path: "M 120 10 Q 150 70 240 160",
                      gradientId: "trace1",
                    },
                    {
                      id: "trace-2",
                      label: "Trace 2 (Mobile Apps)",
                      defaultColor: "#0D9488",
                      path: "M 280 15 Q 280 80 320 160",
                      gradientId: "trace2",
                    },
                    {
                      id: "trace-3",
                      label: "Trace 3 (Cloud Solutions)",
                      defaultColor: "#0284C7",
                      path: "M 440 20 Q 400 80 360 160",
                      gradientId: "trace3",
                    },
                    {
                      id: "trace-4",
                      label: "Trace 4 (UI/UX Design)",
                      defaultColor: "#49243F",
                      path: "M 500 120 Q 450 150 380 180",
                      gradientId: "trace4",
                    },
                    {
                      id: "trace-5",
                      label: "Trace 5 (Analytics)",
                      defaultColor: "#06B6D4",
                      path: "M 510 265 Q 460 250 390 230",
                      gradientId: "trace5",
                    },
                  ];

                  const rawTraces = Array.isArray(formData.hero?.traces)
                    ? formData.hero.traces
                    : [];
                  const tracesList: any[] = defaultTracesConfig.map(
                    (cfg, idx) => {
                      const existing =
                        rawTraces.find((t: any) => t.id === cfg.id) ||
                        rawTraces[idx] ||
                        {};
                      return {
                        id: cfg.id,
                        path: existing.path || cfg.path,
                        gradientId: existing.gradientId || cfg.gradientId,
                        gradientStart:
                          existing.gradientStart ||
                          existing.gradientStops?.[0]?.color ||
                          cfg.defaultColor,
                        gradientEnd:
                          existing.gradientEnd ||
                          existing.gradientStops?.[1]?.color ||
                          cfg.defaultColor,
                        gradientStops: existing.gradientStops || [
                          {
                            offset: "0%",
                            color: existing.gradientStart || cfg.defaultColor,
                            opacity: 0.7,
                          },
                          {
                            offset: "100%",
                            color: existing.gradientEnd || cfg.defaultColor,
                            opacity: 0.1,
                          },
                        ],
                        isVisible: existing.isVisible !== false,
                        label: cfg.label,
                      };
                    },
                  );

                  return tracesList.map((trace: any, idx: number) => (
                    <div
                      key={trace.id || idx}
                      style={{
                        padding: "0.75rem",
                        backgroundColor: "#F8FAFC",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        marginBottom: "0.5rem",
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "#334155",
                          minWidth: "220px",
                        }}
                      >
                        {trace.label}
                      </span>
                      <input
                        type="color"
                        style={{
                          ...inputStyle,
                          padding: "0.25rem",
                          height: "32px",
                          width: "60px",
                        }}
                        value={
                          trace.gradientStart ||
                          defaultTracesConfig[idx]?.defaultColor ||
                          "#7C3AED"
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          const next = [...tracesList];
                          next[idx] = {
                            ...next[idx],
                            gradientStart: val,
                            gradientEnd: val,
                            gradientStops: [
                              { offset: "0%", color: val, opacity: 0.7 },
                              { offset: "100%", color: val, opacity: 0.1 },
                            ],
                          };
                          setFormData({
                            ...formData,
                            hero: { ...(formData.hero || {}), traces: next },
                          });
                        }}
                      />
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* SECTION 2: WHO WE ARE (ABOUT SECTION) */}
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>Home Page Section 2 of 9</div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Who We Are Section (Turning Ideas into Digital Reality)
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker Badge</label>
                  <input
                    style={inputStyle}
                    value={formData.aboutSection?.badge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aboutSection: {
                          ...(formData.aboutSection || {}),
                          badge: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Part 1</label>
                  <input
                    style={inputStyle}
                    value={formData.aboutSection?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aboutSection: {
                          ...(formData.aboutSection || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Highlight (Gold)</label>
                  <input
                    style={inputStyle}
                    value={formData.aboutSection?.titleHighlight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aboutSection: {
                          ...(formData.aboutSection || {}),
                          titleHighlight: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Paragraph 1</label>
                  <textarea
                    rows={3}
                    style={inputStyle}
                    value={formData.aboutSection?.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aboutSection: {
                          ...(formData.aboutSection || {}),
                          description: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Paragraph 2</label>
                  <textarea
                    rows={3}
                    style={inputStyle}
                    value={formData.aboutSection?.description2 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aboutSection: {
                          ...(formData.aboutSection || {}),
                          description2: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <HeroImageControl
                label="Workspace Showcase Image (Curved Frame)"
                imageUrl={formData.aboutSection?.imageUrl || ""}
                imageAlt={formData.aboutSection?.imageAlt || ""}
                imageFit={formData.aboutSection?.imageFit || "cover"}
                onImageChange={(url) =>
                  setFormData({
                    ...formData,
                    aboutSection: {
                      ...(formData.aboutSection || {}),
                      imageUrl: url,
                    },
                  })
                }
                onAltChange={(alt) =>
                  setFormData({
                    ...formData,
                    aboutSection: {
                      ...(formData.aboutSection || {}),
                      imageAlt: alt,
                    },
                  })
                }
                onFitChange={(fit) =>
                  setFormData({
                    ...formData,
                    aboutSection: {
                      ...(formData.aboutSection || {}),
                      imageFit: fit,
                    },
                  })
                }
                onRemove={() =>
                  setFormData({
                    ...formData,
                    aboutSection: {
                      ...(formData.aboutSection || {}),
                      imageUrl: "",
                      imageAlt: "",
                    },
                  })
                }
                pageName="Home Who We Are"
              />
            </div>

            {/* SECTION 3: OUR SERVICES (FEATURED SOLUTIONS) */}
            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>Home Page Section 3 of 9</div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Our Services Section ({services.length} Service Cards)
                  </h3>
                </div>
                <Link
                  to="/admin/services"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 0.875rem",
                    borderRadius: "8px",
                    backgroundColor: "#F5EDF3",
                    color: "#49243F",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Layers size={14} /> Manage Individual Services (
                  {services.length})
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker Badge</label>
                  <input
                    style={inputStyle}
                    value={formData.servicesSection?.badge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesSection: {
                          ...(formData.servicesSection || {}),
                          badge: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Line 1</label>
                  <input
                    style={inputStyle}
                    value={formData.servicesSection?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesSection: {
                          ...(formData.servicesSection || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Line 2 (Highlight)</label>
                  <input
                    style={inputStyle}
                    value={formData.servicesSection?.titleHighlight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesSection: {
                          ...(formData.servicesSection || {}),
                          titleHighlight: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Description</label>
                  <textarea
                    rows={2}
                    style={inputStyle}
                    value={formData.servicesSection?.subtitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesSection: {
                          ...(formData.servicesSection || {}),
                          subtitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>CTA Button Text</label>
                  <input
                    style={inputStyle}
                    value={formData.servicesSection?.ctaText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesSection: {
                          ...(formData.servicesSection || {}),
                          ctaText: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>CTA Button Link</label>
                  <input
                    style={inputStyle}
                    value={formData.servicesSection?.ctaLink || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesSection: {
                          ...(formData.servicesSection || {}),
                          ctaLink: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: SOFTWARE PLATFORMS (PRODUCTS SECTION) */}
            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>Home Page Section 4 of 9</div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Our Software Platforms Section ({products.length} Platforms)
                  </h3>
                </div>
                <Link
                  to="/admin/products"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 0.875rem",
                    borderRadius: "8px",
                    backgroundColor: "#F5EDF3",
                    color: "#49243F",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Briefcase size={14} /> Manage Software Products (
                  {products.length})
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker Badge</label>
                  <input
                    style={inputStyle}
                    value={formData.productsSection?.badge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productsSection: {
                          ...(formData.productsSection || {}),
                          badge: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Part 1</label>
                  <input
                    style={inputStyle}
                    value={formData.productsSection?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productsSection: {
                          ...(formData.productsSection || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Highlight</label>
                  <input
                    style={inputStyle}
                    value={formData.productsSection?.titleHighlight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productsSection: {
                          ...(formData.productsSection || {}),
                          titleHighlight: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Subtitle</label>
                  <textarea
                    rows={2}
                    style={inputStyle}
                    value={formData.productsSection?.subtitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productsSection: {
                          ...(formData.productsSection || {}),
                          subtitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>CTA Button Text</label>
                  <input
                    style={inputStyle}
                    value={formData.productsSection?.ctaText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productsSection: {
                          ...(formData.productsSection || {}),
                          ctaText: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>CTA Button Link</label>
                  <input
                    style={inputStyle}
                    value={formData.productsSection?.ctaLink || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productsSection: {
                          ...(formData.productsSection || {}),
                          ctaLink: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: FEATURED PROJECTS SLIDER */}
            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>Home Page Section 5 of 9</div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Featured Projects Interactive Slider
                  </h3>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    to="/admin/portfolio"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.5rem 0.875rem",
                      borderRadius: "8px",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #CBD5E1",
                      color: "#334155",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    <Briefcase size={14} /> Case Studies Collection (
                    {portfolio.length})
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const currentSlides =
                        formData.featuredProjectsSection?.slides || [];
                      setFormData({
                        ...formData,
                        featuredProjectsSection: {
                          ...(formData.featuredProjectsSection || {}),
                          slides: [
                            ...currentSlides,
                            {
                              id: `slide-${Date.now()}`,
                              title: "New Featured Project",
                              categories: ["Enterprise Platform", "Cloud"],
                              description:
                                "Describe the project capabilities and impact.",
                              link: "/portfolio",
                              image:
                                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=85",
                            },
                          ],
                        },
                      });
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.5rem 0.875rem",
                      backgroundColor: "#49243F",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} /> Add Featured Project Slide
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 2fr",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Heading Word 1</label>
                  <input
                    style={inputStyle}
                    value={formData.featuredProjectsSection?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredProjectsSection: {
                          ...(formData.featuredProjectsSection || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Highlight Word</label>
                  <input
                    style={inputStyle}
                    value={
                      formData.featuredProjectsSection?.titleHighlight || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredProjectsSection: {
                          ...(formData.featuredProjectsSection || {}),
                          titleHighlight: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Section Subtitle</label>
                  <input
                    style={inputStyle}
                    value={formData.featuredProjectsSection?.subtitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredProjectsSection: {
                          ...(formData.featuredProjectsSection || {}),
                          subtitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                {(formData.featuredProjectsSection?.slides || []).map(
                  (slide: any, idx: number) => (
                    <div
                      key={slide.id || idx}
                      style={{
                        padding: "1rem",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            color: "#49243F",
                          }}
                        >
                          Slide #{idx + 1}: {slide.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = (
                              formData.featuredProjectsSection?.slides || []
                            ).filter((_: any, i: number) => i !== idx);
                            setFormData({
                              ...formData,
                              featuredProjectsSection: {
                                ...(formData.featuredProjectsSection || {}),
                                slides: next,
                              },
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#E11D48",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.75rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div>
                          <label style={labelStyle}>Project Title</label>
                          <input
                            style={inputStyle}
                            value={slide.title || ""}
                            onChange={(e) => {
                              const next = [
                                ...(formData.featuredProjectsSection?.slides ||
                                  []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                title: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                featuredProjectsSection: {
                                  ...(formData.featuredProjectsSection || {}),
                                  slides: next,
                                },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>
                            Categories (Comma-separated)
                          </label>
                          <input
                            style={inputStyle}
                            value={
                              Array.isArray(slide.categories)
                                ? slide.categories.join(", ")
                                : slide.categories || ""
                            }
                            onChange={(e) => {
                              const next = [
                                ...(formData.featuredProjectsSection?.slides ||
                                  []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                categories: e.target.value
                                  .split(",")
                                  .map((s: string) => s.trim())
                                  .filter(Boolean),
                              };
                              setFormData({
                                ...formData,
                                featuredProjectsSection: {
                                  ...(formData.featuredProjectsSection || {}),
                                  slides: next,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ marginBottom: "0.75rem" }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                          rows={2}
                          style={inputStyle}
                          value={slide.description || ""}
                          onChange={(e) => {
                            const next = [
                              ...(formData.featuredProjectsSection?.slides ||
                                []),
                            ];
                            next[idx] = {
                              ...next[idx],
                              description: e.target.value,
                            };
                            setFormData({
                              ...formData,
                              featuredProjectsSection: {
                                ...(formData.featuredProjectsSection || {}),
                                slides: next,
                              },
                            });
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.75rem",
                        }}
                      >
                        <div>
                          <label style={labelStyle}>Target Link</label>
                          <input
                            style={inputStyle}
                            value={slide.link || ""}
                            onChange={(e) => {
                              const next = [
                                ...(formData.featuredProjectsSection?.slides ||
                                  []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                link: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                featuredProjectsSection: {
                                  ...(formData.featuredProjectsSection || {}),
                                  slides: next,
                                },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Cover Image URL</label>
                          <input
                            style={inputStyle}
                            value={slide.image || ""}
                            onChange={(e) => {
                              const next = [
                                ...(formData.featuredProjectsSection?.slides ||
                                  []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                image: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                featuredProjectsSection: {
                                  ...(formData.featuredProjectsSection || {}),
                                  slides: next,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* SECTION 6: INDUSTRY EXPERTISE MATRIX */}
            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>Home Page Section 6 of 9</div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Industry Expertise Section (Interactive Sector Tabs)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = formData.industrySection?.industries || [];
                    setFormData({
                      ...formData,
                      industrySection: {
                        ...(formData.industrySection || {}),
                        industries: [
                          ...current,
                          {
                            id: `ind-${Date.now()}`,
                            industry: "New Industry Sector",
                            subtitle: "Sector Systems & Platforms",
                            iconName: "Briefcase",
                            challenge: "Sector operational challenge...",
                            architecture:
                              "Engineered technical architecture...",
                            outcome: "Measurable business outcome...",
                            metrics: [],
                            complianceStandards: [],
                          },
                        ],
                      },
                    });
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.5rem 0.875rem",
                    backgroundColor: "#49243F",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Industry Sector
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker Badge</label>
                  <input
                    style={inputStyle}
                    value={formData.industrySection?.badge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        industrySection: {
                          ...(formData.industrySection || {}),
                          badge: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Part 1</label>
                  <input
                    style={inputStyle}
                    value={formData.industrySection?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        industrySection: {
                          ...(formData.industrySection || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Highlight</label>
                  <input
                    style={inputStyle}
                    value={formData.industrySection?.titleHighlight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        industrySection: {
                          ...(formData.industrySection || {}),
                          titleHighlight: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Section Subtitle</label>
                <input
                  style={inputStyle}
                  value={formData.industrySection?.subtitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      industrySection: {
                        ...(formData.industrySection || {}),
                        subtitle: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                {(formData.industrySection?.industries || []).map(
                  (ind: any, idx: number) => (
                    <div
                      key={ind.id || idx}
                      style={{
                        padding: "1rem",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            color: "#49243F",
                          }}
                        >
                          Industry Tab #{idx + 1}: {ind.industry}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = (
                              formData.industrySection?.industries || []
                            ).filter((_: any, i: number) => i !== idx);
                            setFormData({
                              ...formData,
                              industrySection: {
                                ...(formData.industrySection || {}),
                                industries: next,
                              },
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#E11D48",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.75rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div>
                          <label style={labelStyle}>Industry Name</label>
                          <input
                            style={inputStyle}
                            value={ind.industry || ""}
                            onChange={(e) => {
                              const next = [
                                ...(formData.industrySection?.industries || []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                industry: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                industrySection: {
                                  ...(formData.industrySection || {}),
                                  industries: next,
                                },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Sector Subtitle</label>
                          <input
                            style={inputStyle}
                            value={ind.subtitle || ""}
                            onChange={(e) => {
                              const next = [
                                ...(formData.industrySection?.industries || []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                subtitle: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                industrySection: {
                                  ...(formData.industrySection || {}),
                                  industries: next,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                          gap: "0.75rem",
                        }}
                      >
                        <div>
                          <label style={labelStyle}>1. The Challenge</label>
                          <textarea
                            rows={3}
                            style={inputStyle}
                            value={ind.challenge || ""}
                            onChange={(e) => {
                              const next = [
                                ...(formData.industrySection?.industries || []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                challenge: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                industrySection: {
                                  ...(formData.industrySection || {}),
                                  industries: next,
                                },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>2. Our Approach</label>
                          <textarea
                            rows={3}
                            style={inputStyle}
                            value={ind.architecture || ""}
                            onChange={(e) => {
                              const next = [
                                ...(formData.industrySection?.industries || []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                architecture: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                industrySection: {
                                  ...(formData.industrySection || {}),
                                  industries: next,
                                },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>3. Business Value</label>
                          <textarea
                            rows={3}
                            style={inputStyle}
                            value={ind.outcome || ""}
                            onChange={(e) => {
                              const next = [
                                ...(formData.industrySection?.industries || []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                outcome: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                industrySection: {
                                  ...(formData.industrySection || {}),
                                  industries: next,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* SECTION 7: RESOURCE HUB / INSIGHTS INTRO */}
            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>Home Page Section 7 of 9</div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Resource Hub / Insights Section ({insights.length} Articles)
                  </h3>
                </div>
                <Link
                  to="/admin/insights"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 0.875rem",
                    borderRadius: "8px",
                    backgroundColor: "#F5EDF3",
                    color: "#49243F",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <BookOpen size={14} /> Manage Articles ({insights.length})
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker Badge</label>
                  <input
                    style={inputStyle}
                    value={formData.insightsSection?.badge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insightsSection: {
                          ...(formData.insightsSection || {}),
                          badge: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Part 1</label>
                  <input
                    style={inputStyle}
                    value={formData.insightsSection?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insightsSection: {
                          ...(formData.insightsSection || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Highlight</label>
                  <input
                    style={inputStyle}
                    value={formData.insightsSection?.titleHighlight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insightsSection: {
                          ...(formData.insightsSection || {}),
                          titleHighlight: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Subtitle</label>
                  <input
                    style={inputStyle}
                    value={formData.insightsSection?.subtitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insightsSection: {
                          ...(formData.insightsSection || {}),
                          subtitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>CTA Button Text</label>
                  <input
                    style={inputStyle}
                    value={formData.insightsSection?.ctaText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insightsSection: {
                          ...(formData.insightsSection || {}),
                          ctaText: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>CTA Button Link</label>
                  <input
                    style={inputStyle}
                    value={formData.insightsSection?.ctaLink || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insightsSection: {
                          ...(formData.insightsSection || {}),
                          ctaLink: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECTION 8: FREQUENTLY ASKED QUESTIONS & CONSULTATION CARD */}
            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>Home Page Section 8 of 9</div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Frequently Asked Questions (FAQ) & Technical Consultation
                    Card
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentFaqs = formData.faqSection?.faqs || [];
                    setFormData({
                      ...formData,
                      faqSection: {
                        ...(formData.faqSection || {}),
                        faqs: [
                          ...currentFaqs,
                          {
                            question: "New Frequently Asked Question?",
                            answer:
                              "Detailed answer for visitors and clients...",
                          },
                        ],
                      },
                    });
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.5rem 0.875rem",
                    backgroundColor: "#49243F",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add FAQ Item
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker Badge</label>
                  <input
                    style={inputStyle}
                    value={formData.faqSection?.badge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        faqSection: {
                          ...(formData.faqSection || {}),
                          badge: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Part 1</label>
                  <input
                    style={inputStyle}
                    value={formData.faqSection?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        faqSection: {
                          ...(formData.faqSection || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Highlight</label>
                  <input
                    style={inputStyle}
                    value={formData.faqSection?.titleHighlight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        faqSection: {
                          ...(formData.faqSection || {}),
                          titleHighlight: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Section Subtitle</label>
                <input
                  style={inputStyle}
                  value={formData.faqSection?.subtitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      faqSection: {
                        ...(formData.faqSection || {}),
                        subtitle: e.target.value,
                      },
                    })
                  }
                />
              </div>

              {/* Right-Side Consultation Card */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#FAF8F4",
                  border: "1px solid #E3DACF",
                  borderRadius: "10px",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "#49243F",
                    marginBottom: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Right-Side Technical Consultation Card
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Card Badge</label>
                    <input
                      style={inputStyle}
                      value={formData.faqSection?.consultationCard?.badge || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          faqSection: {
                            ...(formData.faqSection || {}),
                            consultationCard: {
                              ...(formData.faqSection?.consultationCard || {}),
                              badge: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Card Title</label>
                    <input
                      style={inputStyle}
                      value={formData.faqSection?.consultationCard?.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          faqSection: {
                            ...(formData.faqSection || {}),
                            consultationCard: {
                              ...(formData.faqSection?.consultationCard || {}),
                              title: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>CTA Button Text</label>
                    <input
                      style={inputStyle}
                      value={
                        formData.faqSection?.consultationCard?.ctaText || ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          faqSection: {
                            ...(formData.faqSection || {}),
                            consultationCard: {
                              ...(formData.faqSection?.consultationCard || {}),
                              ctaText: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Card Description</label>
                  <textarea
                    rows={2}
                    style={inputStyle}
                    value={
                      formData.faqSection?.consultationCard?.description || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        faqSection: {
                          ...(formData.faqSection || {}),
                          consultationCard: {
                            ...(formData.faqSection?.consultationCard || {}),
                            description: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* FAQ Items List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {(formData.faqSection?.faqs || []).map(
                  (faq: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: "1rem",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            color: "#49243F",
                          }}
                        >
                          FAQ Question #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = (
                              formData.faqSection?.faqs || []
                            ).filter((_: any, i: number) => i !== idx);
                            setFormData({
                              ...formData,
                              faqSection: {
                                ...(formData.faqSection || {}),
                                faqs: next,
                              },
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#E11D48",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <input
                        style={{ ...inputStyle, marginBottom: "0.5rem" }}
                        placeholder="Question"
                        value={faq.question || ""}
                        onChange={(e) => {
                          const next = [...(formData.faqSection?.faqs || [])];
                          next[idx] = {
                            ...next[idx],
                            question: e.target.value,
                          };
                          setFormData({
                            ...formData,
                            faqSection: {
                              ...(formData.faqSection || {}),
                              faqs: next,
                            },
                          });
                        }}
                      />
                      <textarea
                        rows={2}
                        style={inputStyle}
                        placeholder="Answer"
                        value={faq.answer || ""}
                        onChange={(e) => {
                          const next = [...(formData.faqSection?.faqs || [])];
                          next[idx] = { ...next[idx], answer: e.target.value };
                          setFormData({
                            ...formData,
                            faqSection: {
                              ...(formData.faqSection || {}),
                              faqs: next,
                            },
                          });
                        }}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* SECTION 9: FINAL CALL-TO-ACTION BANNER */}
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>Home Page Section 9 of 9</div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Bottom Call-to-Action Banner (Shared Across Pages)
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>CTA Heading Part 1</label>
                  <input
                    style={inputStyle}
                    value={formData.finalCta?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        finalCta: {
                          ...(formData.finalCta || {}),
                          title: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>CTA Heading Highlight (Gold)</label>
                  <input
                    style={inputStyle}
                    value={formData.finalCta?.titleHighlight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        finalCta: {
                          ...(formData.finalCta || {}),
                          titleHighlight: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>CTA Subtitle</label>
                  <textarea
                    rows={2}
                    style={inputStyle}
                    value={formData.finalCta?.subtitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        finalCta: {
                          ...(formData.finalCta || {}),
                          subtitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Button Label</label>
                  <input
                    style={inputStyle}
                    value={formData.finalCta?.primaryCtaText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        finalCta: {
                          ...(formData.finalCta || {}),
                          primaryCtaText: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Button Link</label>
                  <input
                    style={inputStyle}
                    value={formData.finalCta?.primaryCtaLink || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        finalCta: {
                          ...(formData.finalCta || {}),
                          primaryCtaLink: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 2: WHO WE ARE / ABOUT US (ALL 4 SECTIONS)
        ========================================================= */}
        {activeTab === "about" && (
          <div>
            {/* SECTION 1: HERO BANNER */}
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>
                Who We Are Page Section 1 of 4
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Page Hero Banner
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Hero Kicker</label>
                  <input
                    style={inputStyle}
                    value={formData.kicker || formData.badge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kicker: e.target.value,
                        badge: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Hero Title</label>
                  <input
                    style={inputStyle}
                    value={formData.heroTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, heroTitle: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Hero Subtitle</label>
                <textarea
                  rows={2}
                  style={inputStyle}
                  value={
                    formData.heroSubtitle || formData.heroDescription || ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      heroSubtitle: e.target.value,
                      heroDescription: e.target.value,
                    })
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px dashed #E2E8F0",
                }}
              >
                <div>
                  <label style={labelStyle}>SEO Browser Title</label>
                  <input
                    style={inputStyle}
                    value={formData.seoTitle || formData.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoTitle: e.target.value,
                        title: e.target.value,
                      })
                    }
                    placeholder="About Us  Values & Delivery Framework | Azaroth Techhive"
                  />
                </div>
                <div>
                  <label style={labelStyle}>SEO Meta Description</label>
                  <input
                    style={inputStyle}
                    value={
                      formData.seoDescription || formData.meta_description || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                        meta_description: e.target.value,
                      })
                    }
                    placeholder="Learn about Azaroth Techhive: our vision, core values..."
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: OUR STORY SECTION */}
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>
                Who We Are Page Section 2 of 4
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Our Story & Company Highlights
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Story Kicker Badge</label>
                  <input
                    style={inputStyle}
                    value={formData.storyBadge || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, storyBadge: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Story Heading</label>
                  <input
                    style={inputStyle}
                    value={formData.storyTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, storyTitle: e.target.value })
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Story Paragraph 1</label>
                  <textarea
                    rows={3}
                    style={inputStyle}
                    value={formData.storyParagraph1 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storyParagraph1: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Story Paragraph 2</label>
                  <textarea
                    rows={3}
                    style={inputStyle}
                    value={formData.storyParagraph2 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storyParagraph2: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <HeroImageControl
                label="Our Story Workspace Visual"
                imageUrl={formData.storyImage || formData.hero?.imageUrl || ""}
                imageAlt={
                  formData.storyImageAlt || formData.hero?.imageAlt || ""
                }
                imageFit="cover"
                onImageChange={(url) =>
                  setFormData({
                    ...formData,
                    storyImage: url,
                  })
                }
                onAltChange={(alt) =>
                  setFormData({
                    ...formData,
                    storyImageAlt: alt,
                  })
                }
                onRemove={() =>
                  setFormData({
                    ...formData,
                    storyImage: "",
                    storyImageAlt: "",
                  })
                }
                pageName="About Us (Our Story)"
              />

              {/* Company Highlights (3 Pillars) */}
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  backgroundColor: "#F8FAFC",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    margin: "0 0 0.75rem",
                  }}
                >
                  Company Highlights (3 Story Pillars)
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                    gap: "1rem",
                  }}
                >
                  {[0, 1, 2].map((idx) => {
                    const fallbackPillars = [
                      {
                        title: "Disciplined",
                        subtitle: "Principled Design",
                        color: "#49243F",
                      },
                      {
                        title: "Tested Quality",
                        subtitle: "Rigorous Verification",
                        color: "#047857",
                      },
                      {
                        title: "True Partnership",
                        subtitle: "Transparent Delivery",
                        color: "#B45309",
                      },
                    ];
                    const currentPillars =
                      Array.isArray(formData.pillars) &&
                      formData.pillars.length === 3
                        ? formData.pillars
                        : fallbackPillars;
                    const item = currentPillars[idx] || fallbackPillars[idx];

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: "0.75rem",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #CBD5E1",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: item.color || "#49243F",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Highlight Card #{idx + 1}
                        </div>
                        <div style={{ marginBottom: "0.5rem" }}>
                          <label style={{ ...labelStyle, fontSize: "0.72rem" }}>
                            Title
                          </label>
                          <input
                            style={{
                              ...inputStyle,
                              padding: "0.4rem 0.6rem",
                              fontSize: "0.8rem",
                            }}
                            value={item.title || ""}
                            onChange={(e) => {
                              const next = [...currentPillars];
                              next[idx] = {
                                ...next[idx],
                                title: e.target.value,
                              };
                              setFormData({ ...formData, pillars: next });
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: "0.5rem" }}>
                          <label style={{ ...labelStyle, fontSize: "0.72rem" }}>
                            Subtitle
                          </label>
                          <input
                            style={{
                              ...inputStyle,
                              padding: "0.4rem 0.6rem",
                              fontSize: "0.8rem",
                            }}
                            value={item.subtitle || item.description || ""}
                            onChange={(e) => {
                              const next = [...currentPillars];
                              next[idx] = {
                                ...next[idx],
                                subtitle: e.target.value,
                                description: e.target.value,
                              };
                              setFormData({ ...formData, pillars: next });
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: "0.72rem" }}>
                            Accent Color
                          </label>
                          <input
                            style={{
                              ...inputStyle,
                              padding: "0.4rem 0.6rem",
                              fontSize: "0.8rem",
                            }}
                            value={item.color || ""}
                            placeholder="#49243F"
                            onChange={(e) => {
                              const next = [...currentPillars];
                              next[idx] = {
                                ...next[idx],
                                color: e.target.value,
                              };
                              setFormData({ ...formData, pillars: next });
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 3: OUR CORE VALUES */}
            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>
                    Who We Are Page Section 3 of 4
                  </div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Our Core Values Section
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = aboutAuxData.values?.values || [];
                    setAboutAuxData({
                      ...aboutAuxData,
                      values: {
                        ...aboutAuxData.values,
                        values: [
                          ...current,
                          {
                            number: `0${current.length + 1}`,
                            title: "New Core Value",
                            description: "Principle description...",
                            iconName: "ShieldCheck",
                          },
                        ],
                      },
                    });
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.5rem 0.875rem",
                    backgroundColor: "#49243F",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Core Value
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 2fr",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker</label>
                  <input
                    style={inputStyle}
                    value={aboutAuxData.values?.badge || ""}
                    onChange={(e) =>
                      setAboutAuxData({
                        ...aboutAuxData,
                        values: {
                          ...aboutAuxData.values,
                          badge: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Section Heading</label>
                  <input
                    style={inputStyle}
                    value={aboutAuxData.values?.heroTitle || ""}
                    onChange={(e) =>
                      setAboutAuxData({
                        ...aboutAuxData,
                        values: {
                          ...aboutAuxData.values,
                          heroTitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Section Subtitle</label>
                  <input
                    style={inputStyle}
                    value={aboutAuxData.values?.heroDescription || ""}
                    onChange={(e) =>
                      setAboutAuxData({
                        ...aboutAuxData,
                        values: {
                          ...aboutAuxData.values,
                          heroDescription: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.875rem",
                }}
              >
                {(aboutAuxData.values?.values || []).map(
                  (v: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: "1rem",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            color: "#49243F",
                          }}
                        >
                          Value #{idx + 1}: {v.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = (
                              aboutAuxData.values?.values || []
                            ).filter((_: any, i: number) => i !== idx);
                            setAboutAuxData({
                              ...aboutAuxData,
                              values: {
                                ...aboutAuxData.values,
                                values: next,
                              },
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#E11D48",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        style={{ ...inputStyle, marginBottom: "0.5rem" }}
                        value={v.title || ""}
                        onChange={(e) => {
                          const next = [...(aboutAuxData.values?.values || [])];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setAboutAuxData({
                            ...aboutAuxData,
                            values: { ...aboutAuxData.values, values: next },
                          });
                        }}
                      />
                      <textarea
                        rows={2}
                        style={inputStyle}
                        value={v.description || ""}
                        onChange={(e) => {
                          const next = [...(aboutAuxData.values?.values || [])];
                          next[idx] = {
                            ...next[idx],
                            description: e.target.value,
                          };
                          setAboutAuxData({
                            ...aboutAuxData,
                            values: { ...aboutAuxData.values, values: next },
                          });
                        }}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* SECTION 4: DELIVERY FRAMEWORK */}
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>
                Who We Are Page Section 4 of 4
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Our Delivery Framework Section (Interactive Stages)
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker</label>
                  <input
                    style={inputStyle}
                    value={aboutAuxData.deliveryFramework?.badge || ""}
                    onChange={(e) =>
                      setAboutAuxData({
                        ...aboutAuxData,
                        deliveryFramework: {
                          ...aboutAuxData.deliveryFramework,
                          badge: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Section Heading</label>
                  <input
                    style={inputStyle}
                    value={aboutAuxData.deliveryFramework?.heroTitle || ""}
                    onChange={(e) =>
                      setAboutAuxData({
                        ...aboutAuxData,
                        deliveryFramework: {
                          ...aboutAuxData.deliveryFramework,
                          heroTitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Section Description</label>
                <textarea
                  rows={2}
                  style={inputStyle}
                  value={aboutAuxData.deliveryFramework?.heroDescription || ""}
                  onChange={(e) =>
                    setAboutAuxData({
                      ...aboutAuxData,
                      deliveryFramework: {
                        ...aboutAuxData.deliveryFramework,
                        heroDescription: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                {(aboutAuxData.deliveryFramework?.stages || []).map(
                  (stage: any, idx: number) => (
                    <div
                      key={stage.stageNumber || idx}
                      style={{
                        padding: "1rem",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          color: "#49243F",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Stage 0{stage.stageNumber || idx + 1}: {stage.title}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.75rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div>
                          <label style={labelStyle}>Stage Title</label>
                          <input
                            style={inputStyle}
                            value={stage.title || ""}
                            onChange={(e) => {
                              const next = [
                                ...(aboutAuxData.deliveryFramework?.stages ||
                                  []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                title: e.target.value,
                              };
                              setAboutAuxData({
                                ...aboutAuxData,
                                deliveryFramework: {
                                  ...aboutAuxData.deliveryFramework,
                                  stages: next,
                                },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Stage Tagline</label>
                          <input
                            style={inputStyle}
                            value={stage.tagline || ""}
                            onChange={(e) => {
                              const next = [
                                ...(aboutAuxData.deliveryFramework?.stages ||
                                  []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                tagline: e.target.value,
                              };
                              setAboutAuxData({
                                ...aboutAuxData,
                                deliveryFramework: {
                                  ...aboutAuxData.deliveryFramework,
                                  stages: next,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Stage Narrative</label>
                        <textarea
                          rows={2}
                          style={inputStyle}
                          value={stage.description || ""}
                          onChange={(e) => {
                            const next = [
                              ...(aboutAuxData.deliveryFramework?.stages || []),
                            ];
                            next[idx] = {
                              ...next[idx],
                              description: e.target.value,
                            };
                            setAboutAuxData({
                              ...aboutAuxData,
                              deliveryFramework: {
                                ...aboutAuxData.deliveryFramework,
                                stages: next,
                              },
                            });
                          }}
                        />
                      </div>

                      {/* Interactive Stage Matrix Details */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                          gap: "0.75rem",
                          marginTop: "0.75rem",
                        }}
                      >
                        <div>
                          <label style={{ ...labelStyle, fontSize: "0.72rem" }}>
                            Key Activities (one per line)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Activity per line..."
                            style={{ ...inputStyle, fontSize: "0.78rem" }}
                            value={
                              Array.isArray(stage.keyActivities)
                                ? stage.keyActivities.join("\n")
                                : ""
                            }
                            onChange={(e) => {
                              const next = [
                                ...(aboutAuxData.deliveryFramework?.stages ||
                                  []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                keyActivities: e.target.value
                                  .split("\n")
                                  .map((l: string) => l.trim())
                                  .filter(Boolean),
                              };
                              setAboutAuxData({
                                ...aboutAuxData,
                                deliveryFramework: {
                                  ...aboutAuxData.deliveryFramework,
                                  stages: next,
                                },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: "0.72rem" }}>
                            Tangible Deliverables (one per line)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Deliverable per line..."
                            style={{ ...inputStyle, fontSize: "0.78rem" }}
                            value={
                              Array.isArray(stage.deliverables)
                                ? stage.deliverables.join("\n")
                                : ""
                            }
                            onChange={(e) => {
                              const next = [
                                ...(aboutAuxData.deliveryFramework?.stages ||
                                  []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                deliverables: e.target.value
                                  .split("\n")
                                  .map((l: string) => l.trim())
                                  .filter(Boolean),
                              };
                              setAboutAuxData({
                                ...aboutAuxData,
                                deliveryFramework: {
                                  ...aboutAuxData.deliveryFramework,
                                  stages: next,
                                },
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: "0.72rem" }}>
                            Quality Gates (one per line)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Quality gate per line..."
                            style={{ ...inputStyle, fontSize: "0.78rem" }}
                            value={
                              Array.isArray(stage.qualityGates)
                                ? stage.qualityGates.join("\n")
                                : ""
                            }
                            onChange={(e) => {
                              const next = [
                                ...(aboutAuxData.deliveryFramework?.stages ||
                                  []),
                              ];
                              next[idx] = {
                                ...next[idx],
                                qualityGates: e.target.value
                                  .split("\n")
                                  .map((l: string) => l.trim())
                                  .filter(Boolean),
                              };
                              setAboutAuxData({
                                ...aboutAuxData,
                                deliveryFramework: {
                                  ...aboutAuxData.deliveryFramework,
                                  stages: next,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 3: OUR PORTFOLIO PAGE
        ========================================================= */}
        {activeTab === "portfolio" && (
          <div>
            {/* SECTION 1: PORTFOLIO HERO */}
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>
                Our Portfolio Page Section 1 of 4
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Portfolio Page Hero Banner
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Hero Kicker</label>
                  <input
                    style={inputStyle}
                    value={formData.kicker || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, kicker: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Hero Title</label>
                  <input
                    style={inputStyle}
                    value={formData.heroTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, heroTitle: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Hero Subtitle</label>
                <textarea
                  rows={2}
                  style={inputStyle}
                  value={formData.heroSubtitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, heroSubtitle: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px dashed #E2E8F0",
                }}
              >
                <div>
                  <label style={labelStyle}>SEO Browser Title</label>
                  <input
                    style={inputStyle}
                    value={formData.seoTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    placeholder="Our Portfolio  Platforms & Engineering Capabilities | Azaroth Tech-Hive"
                  />
                </div>
                <div>
                  <label style={labelStyle}>SEO Meta Description</label>
                  <input
                    style={inputStyle}
                    value={formData.seoDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="Explore Azaroth Tech-Hive's software platforms..."
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PORTFOLIO SNAPSHOT */}
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>
                Our Portfolio Page Section 2 of 4
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Portfolio Snapshot Intro Section
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Snapshot Kicker</label>
                  <input
                    style={inputStyle}
                    value={formData.snapshotBadge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        snapshotBadge: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Snapshot Title Part 1</label>
                  <input
                    style={inputStyle}
                    value={formData.snapshotTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        snapshotTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Snapshot Title Highlight</label>
                  <input
                    style={inputStyle}
                    value={formData.snapshotTitleHighlight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        snapshotTitleHighlight: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Primary Description</label>
                  <textarea
                    rows={3}
                    style={inputStyle}
                    value={formData.snapshotDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        snapshotDescription: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Secondary Note</label>
                  <textarea
                    rows={3}
                    style={inputStyle}
                    value={formData.snapshotNote || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, snapshotNote: e.target.value })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px dashed #E2E8F0",
                }}
              >
                <div>
                  <label style={labelStyle}>SEO Browser Title</label>
                  <input
                    style={inputStyle}
                    value={formData.seoTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    placeholder="Our Portfolio  Platforms & Engineering Capabilities | Azaroth Tech-Hive"
                  />
                </div>
                <div>
                  <label style={labelStyle}>SEO Meta Description</label>
                  <input
                    style={inputStyle}
                    value={formData.seoDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="Explore Azaroth Tech-Hive's software platforms..."
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: SOFTWARE PRODUCTS & PLATFORMS HEADER */}
            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>
                    Our Portfolio Page Section 3 of 4
                  </div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Software Products & Platforms Section
                  </h3>
                </div>
                <Link
                  to="/admin/products"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 0.875rem",
                    borderRadius: "8px",
                    backgroundColor: "#F5EDF3",
                    color: "#49243F",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Briefcase size={14} /> Edit Products Catalog (
                  {products.length})
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 2fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker</label>
                  <input
                    style={inputStyle}
                    value={formData.productsBadge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productsBadge: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Section Title</label>
                  <input
                    style={inputStyle}
                    value={formData.productsTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productsTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Section Subtitle</label>
                  <input
                    style={inputStyle}
                    value={formData.productsSubtitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productsSubtitle: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: ENTERPRISE ENGINEERING SERVICES HEADER */}
            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>
                    Our Portfolio Page Section 4 of 4
                  </div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Enterprise Engineering Services Section
                  </h3>
                </div>
                <Link
                  to="/admin/services"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 0.875rem",
                    borderRadius: "8px",
                    backgroundColor: "#F5EDF3",
                    color: "#49243F",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Layers size={14} /> Edit Enterprise Services (
                  {services.length})
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 2fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker</label>
                  <input
                    style={inputStyle}
                    value={formData.servicesBadge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesBadge: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Section Title</label>
                  <input
                    style={inputStyle}
                    value={formData.servicesTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Section Subtitle</label>
                  <input
                    style={inputStyle}
                    value={formData.servicesSubtitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesSubtitle: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 4: RESOURCE HUB PAGE
        ========================================================= */}
        {activeTab === "insights" && (
          <div style={sectionCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div>
                <div style={sectionBadgeStyle}>Resource Hub Page</div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    margin: 0,
                  }}
                >
                  Resource Hub Hero Banner & Articles
                </h3>
              </div>
              <Link
                to="/admin/insights"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "8px",
                  backgroundColor: "#F5EDF3",
                  color: "#49243F",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <BookOpen size={14} /> Manage All Resource Hub Articles (
                {insights.length})
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={labelStyle}>Hero Kicker</label>
                <input
                  style={inputStyle}
                  value={formData.kicker || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, kicker: e.target.value })
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Hero Title</label>
                <input
                  style={inputStyle}
                  value={formData.heroTitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, heroTitle: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Hero Subtitle</label>
              <textarea
                rows={3}
                style={inputStyle}
                value={formData.heroSubtitle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, heroSubtitle: e.target.value })
                }
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "1rem",
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px dashed #E2E8F0",
              }}
            >
              <div>
                <label style={labelStyle}>SEO Browser Title</label>
                <input
                  style={inputStyle}
                  value={formData.seoTitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, seoTitle: e.target.value })
                  }
                  placeholder="Resource Hub  Engineering Insights & Publications | Azaroth Tech-Hive"
                />
              </div>
              <div>
                <label style={labelStyle}>SEO Meta Description</label>
                <input
                  style={inputStyle}
                  value={formData.seoDescription || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, seoDescription: e.target.value })
                  }
                  placeholder="Browse engineering insights on system architecture..."
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 5: CLIENT TESTIMONIALS PAGE
        ========================================================= */}
        {activeTab === "testimonials" && (
          <div>
            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>
                    Testimonials Page Section 1 of 2
                  </div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Page Hero Banner
                  </h3>
                </div>
                <Link
                  to="/admin/testimonials"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 0.875rem",
                    borderRadius: "8px",
                    backgroundColor: "#F5EDF3",
                    color: "#49243F",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <MessageSquareQuote size={14} /> Manage Client Reviews (
                  {testimonials.length})
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Hero Kicker</label>
                  <input
                    style={inputStyle}
                    value={formData.kicker || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, kicker: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Hero Title</label>
                  <input
                    style={inputStyle}
                    value={formData.heroTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, heroTitle: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Hero Subtitle</label>
                <textarea
                  rows={2}
                  style={inputStyle}
                  value={formData.heroSubtitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, heroSubtitle: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px dashed #E2E8F0",
                }}
              >
                <div>
                  <label style={labelStyle}>SEO Browser Title</label>
                  <input
                    style={inputStyle}
                    value={formData.seoTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    placeholder="Client Testimonials  Enterprise Engineering Endorsements | Azaroth Tech-Hive"
                  />
                </div>
                <div>
                  <label style={labelStyle}>SEO Meta Description</label>
                  <input
                    style={inputStyle}
                    value={formData.seoDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="Read verified client testimonials and executive endorsements..."
                  />
                </div>
              </div>
            </div>

            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>
                Testimonials Page Section 2 of 2
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Testimonials Grid Section Header
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Section Kicker</label>
                  <input
                    style={inputStyle}
                    value={formData.sectionBadge || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, sectionBadge: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Part 1</label>
                  <input
                    style={inputStyle}
                    value={formData.sectionTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, sectionTitle: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Highlight</label>
                  <input
                    style={inputStyle}
                    value={formData.sectionTitleHighlight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sectionTitleHighlight: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Section Subtitle</label>
                <textarea
                  rows={2}
                  style={inputStyle}
                  value={formData.sectionSubtitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sectionSubtitle: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 6: CONNECT WITH US PAGE
        ========================================================= */}
        {activeTab === "connect" && (
          <div>
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>
                Connect With Us Page Section 1 of 3
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Page Hero Banner
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Hero Kicker</label>
                  <input
                    style={inputStyle}
                    value={formData.kicker || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, kicker: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Hero Title</label>
                  <input
                    style={inputStyle}
                    value={formData.heroTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, heroTitle: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Hero Subtitle</label>
                <textarea
                  rows={2}
                  style={inputStyle}
                  value={formData.heroSubtitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, heroSubtitle: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px dashed #E2E8F0",
                }}
              >
                <div>
                  <label style={labelStyle}>SEO Browser Title</label>
                  <input
                    style={inputStyle}
                    value={formData.seoTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    placeholder="Connect With Us  Azaroth Tech-Hive"
                  />
                </div>
                <div>
                  <label style={labelStyle}>SEO Meta Description</label>
                  <input
                    style={inputStyle}
                    value={formData.seoDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="Schedule a confidential architecture review or discuss enterprise engineering engagements with Azaroth Tech-Hive."
                  />
                </div>
              </div>
            </div>

            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={sectionBadgeStyle}>
                    Connect With Us Page Section 2 of 3
                  </div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                    }}
                  >
                    Headquarters Card & Contact Page FAQs
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = formData.faqs || [];
                    setFormData({
                      ...formData,
                      faqs: [
                        ...current,
                        {
                          question: "New Contact Question?",
                          answer: "Clear answer...",
                        },
                      ],
                    });
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.5rem 0.875rem",
                    backgroundColor: "#49243F",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Contact FAQ
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Office Card Heading</label>
                  <input
                    style={inputStyle}
                    value={formData.officeHeading || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        officeHeading: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Contact FAQ Heading</label>
                  <input
                    style={inputStyle}
                    value={formData.faqHeading || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, faqHeading: e.target.value })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Office Working Hours</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Monday “ Friday: 9:00 AM “ 6:00 PM IST"
                    value={formData.officeHours || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, officeHours: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Turnaround SLA</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Response within 1 business day"
                    value={formData.responseSla || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, responseSla: e.target.value })
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {(formData.faqs || []).map((faq: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "1rem",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: "#49243F",
                        }}
                      >
                        Contact FAQ #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = (formData.faqs || []).filter(
                            (_: any, i: number) => i !== idx,
                          );
                          setFormData({ ...formData, faqs: next });
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#E11D48",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      style={{ ...inputStyle, marginBottom: "0.5rem" }}
                      value={faq.question || ""}
                      onChange={(e) => {
                        const next = [...(formData.faqs || [])];
                        next[idx] = { ...next[idx], question: e.target.value };
                        setFormData({ ...formData, faqs: next });
                      }}
                    />
                    <textarea
                      rows={2}
                      style={inputStyle}
                      value={faq.answer || ""}
                      onChange={(e) => {
                        const next = [...(formData.faqs || [])];
                        next[idx] = { ...next[idx], answer: e.target.value };
                        setFormData({ ...formData, faqs: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>
                Connect With Us Page • Section 3 of 3
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                Contact Form Labels, Placeholders & Submission State
              </h3>

              {/* Sub-panel A: Executive Success State Screen */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#49243F",
                    marginBottom: "0.75rem",
                  }}
                >
                  1. Executive Success State Screen
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Success Badge / Pill</label>
                    <input
                      style={inputStyle}
                      value={formData.successBadge || ""}
                      placeholder="Priority Architecture Queue"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          successBadge: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Reference ID Label</label>
                    <input
                      style={inputStyle}
                      value={formData.referenceIdLabel || ""}
                      placeholder="Reference:"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referenceIdLabel: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Success Title</label>
                    <input
                      style={inputStyle}
                      value={formData.successTitle || ""}
                      placeholder="Message Received"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          successTitle: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Success Message</label>
                    <input
                      style={inputStyle}
                      value={formData.successMessage || ""}
                      placeholder="A solution architect will review your brief and reply within one business day."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          successMessage: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>SLA Metric Label</label>
                    <input
                      style={inputStyle}
                      value={formData.slaTitle || ""}
                      placeholder="Response SLA"
                      onChange={(e) =>
                        setFormData({ ...formData, slaTitle: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>SLA Metric Value</label>
                    <input
                      style={inputStyle}
                      value={formData.slaValue || ""}
                      placeholder="Within 1 Business Day"
                      onChange={(e) =>
                        setFormData({ ...formData, slaValue: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>NDA Metric Label</label>
                    <input
                      style={inputStyle}
                      value={formData.ndaTitle || ""}
                      placeholder="Enterprise NDA"
                      onChange={(e) =>
                        setFormData({ ...formData, ndaTitle: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>NDA Metric Value</label>
                    <input
                      style={inputStyle}
                      value={formData.ndaValue || ""}
                      placeholder="Strict Confidentiality"
                      onChange={(e) =>
                        setFormData({ ...formData, ndaValue: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={labelStyle}>Next Steps Section Title</label>
                  <input
                    style={inputStyle}
                    value={formData.successNextTitle || ""}
                    placeholder="What Happens Next"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        successNextTitle: e.target.value,
                      })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Next Step 1</label>
                    <input
                      style={inputStyle}
                      value={formData.successNextStep1 || ""}
                      placeholder="Your brief is assigned to a Principal Solutions Architect for initial feasibility review."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          successNextStep1: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Next Step 2</label>
                    <input
                      style={inputStyle}
                      value={formData.successNextStep2 || ""}
                      placeholder="We review scope, integration constraints, and timeline targets within one business day."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          successNextStep2: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Next Step 3</label>
                    <input
                      style={inputStyle}
                      value={formData.successNextStep3 || ""}
                      placeholder="Expect a scoped reply or scheduling link from your advisory team."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          successNextStep3: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>WhatsApp CTA Text</label>
                    <input
                      style={inputStyle}
                      value={formData.whatsappBtnText || ""}
                      placeholder="Instant WhatsApp Chat"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsappBtnText: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Portfolio CTA Text</label>
                    <input
                      style={inputStyle}
                      value={formData.portfolioBtnText || ""}
                      placeholder="Explore Portfolio"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolioBtnText: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Portfolio CTA Link</label>
                    <input
                      style={inputStyle}
                      value={formData.portfolioBtnLink || ""}
                      placeholder="/portfolio"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolioBtnLink: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Send Another CTA Text</label>
                    <input
                      style={inputStyle}
                      value={formData.sendAnotherBtnText || ""}
                      placeholder="Send Another Message"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sendAnotherBtnText: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Sub-panel B: Form Columns & Grid Layout Builder (Add Column & Remove Column) */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px dashed #E2E8F0",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 800,
                        color: "#49243F",
                        margin: 0,
                      }}
                    >
                      2. Form Columns & Grid Layout Builder
                    </h4>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#64748B",
                        margin: "0.25rem 0 0",
                      }}
                    >
                      Add new columns, remove unwanted columns, change column
                      span (1 col 50% vs 2 col 100%), and reorder fields.
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const currentCols: ContactFormColumn[] =
                          Array.isArray(formData.formColumns) &&
                          formData.formColumns.length > 0
                            ? formData.formColumns
                            : DEFAULT_CONTACT_FORM_COLUMNS;
                        const nextIndex = currentCols.length + 1;
                        const newCol: ContactFormColumn = {
                          id: `col_${Date.now()}`,
                          name: `custom_field_${nextIndex}`,
                          label: `Custom Field ${nextIndex}`,
                          placeholder: `Enter value...`,
                          type: "text",
                          width: "half",
                          required: false,
                          requiredError: `Custom Field ${nextIndex} is required.`,
                        };
                        setFormData({
                          ...formData,
                          formColumns: [...currentCols, newCol],
                        });
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.45rem 0.85rem",
                        borderRadius: "8px",
                        backgroundColor: "#49243F",
                        color: "#FFFFFF",
                        border: "none",
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(73, 36, 63, 0.2)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Plus size={15} /> Add Column
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          formColumns: DEFAULT_CONTACT_FORM_COLUMNS,
                        });
                      }}
                      title="Reset to canonical 8 contact form columns"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.45rem 0.75rem",
                        borderRadius: "8px",
                        backgroundColor: "#FFFFFF",
                        color: "#64748B",
                        border: "1px solid #CBD5E1",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reset Defaults
                    </button>
                  </div>
                </div>

                {/* Columns List */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {(() => {
                    const currentCols: ContactFormColumn[] =
                      Array.isArray(formData.formColumns) &&
                      formData.formColumns.length > 0
                        ? formData.formColumns
                        : DEFAULT_CONTACT_FORM_COLUMNS;

                    return currentCols.map((col, index) => (
                      <div
                        key={col.id || `col_${index}`}
                        style={{
                          backgroundColor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          borderRadius: "10px",
                          padding: "1rem",
                          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
                        }}
                      >
                        {/* Column Header Bar */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.85rem",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "24px",
                                height: "24px",
                                borderRadius: "6px",
                                backgroundColor: "#0F172A",
                                color: "#FFFFFF",
                                fontSize: "0.75rem",
                                fontWeight: 800,
                              }}
                            >
                              {index + 1}
                            </span>
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: "0.875rem",
                                color: "#0F172A",
                              }}
                            >
                              {col.label || "Untitled Column"}
                            </span>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                padding: "0.15rem 0.45rem",
                                borderRadius: "4px",
                                backgroundColor: col.required
                                  ? "#FFF1F2"
                                  : "#F8FAFC",
                                color: col.required ? "#BE123C" : "#94A3B8",
                                border: `1px solid ${col.required ? "#FECDD3" : "#E2E8F0"}`,
                              }}
                            >
                              {col.required ? "Required" : "Optional"}
                            </span>
                          </div>

                          {/* Reorder and Remove Buttons */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                            }}
                          >
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => {
                                const next = [...currentCols];
                                const [item] = next.splice(index, 1);
                                next.splice(index - 1, 0, item);
                                setFormData({ ...formData, formColumns: next });
                              }}
                              title="Move column up"
                              style={{
                                padding: "0.25rem 0.45rem",
                                borderRadius: "6px",
                                border: "1px solid #CBD5E1",
                                backgroundColor: "#FFFFFF",
                                cursor: index === 0 ? "not-allowed" : "pointer",
                                opacity: index === 0 ? 0.4 : 1,
                              }}
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={index === currentCols.length - 1}
                              onClick={() => {
                                const next = [...currentCols];
                                const [item] = next.splice(index, 1);
                                next.splice(index + 1, 0, item);
                                setFormData({ ...formData, formColumns: next });
                              }}
                              title="Move column down"
                              style={{
                                padding: "0.25rem 0.45rem",
                                borderRadius: "6px",
                                border: "1px solid #CBD5E1",
                                backgroundColor: "#FFFFFF",
                                cursor:
                                  index === currentCols.length - 1
                                    ? "not-allowed"
                                    : "pointer",
                                opacity:
                                  index === currentCols.length - 1 ? 0.4 : 1,
                              }}
                            >
                              <ArrowDown size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const next = currentCols.filter(
                                  (_, i) => i !== index,
                                );
                                setFormData({ ...formData, formColumns: next });
                              }}
                              title="Remove column from form"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                padding: "0.3rem 0.65rem",
                                borderRadius: "6px",
                                border: "1px solid #FECDD3",
                                backgroundColor: "#FFF1F2",
                                color: "#BE123C",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <Trash2 size={13} /> Remove Column
                            </button>
                          </div>
                        </div>

                        {/* Column Field Attributes */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                            gap: "0.75rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <div>
                            <label style={labelStyle}>Column Label</label>
                            <input
                              style={inputStyle}
                              value={col.label || ""}
                              placeholder="e.g. Project Budget"
                              onChange={(e) => {
                                const next = [...currentCols];
                                next[index] = {
                                  ...next[index],
                                  label: e.target.value,
                                };
                                setFormData({ ...formData, formColumns: next });
                              }}
                            />
                          </div>

                          <div>
                            <label style={labelStyle}>Field Key / Name</label>
                            <input
                              style={inputStyle}
                              value={col.name || ""}
                              placeholder="e.g. budget"
                              onChange={(e) => {
                                const next = [...currentCols];
                                next[index] = {
                                  ...next[index],
                                  name: e.target.value.replace(
                                    /[^a-zA-Z0-9_]/g,
                                    "",
                                  ),
                                };
                                setFormData({ ...formData, formColumns: next });
                              }}
                            />
                          </div>

                          <div>
                            <label style={labelStyle}>Field Type</label>
                            <select
                              style={inputStyle}
                              value={col.type || "text"}
                              onChange={(e) => {
                                const next = [...currentCols];
                                const newType = e.target.value as any;
                                next[index] = {
                                  ...next[index],
                                  type: newType,
                                  width: [
                                    "textarea",
                                    "country",
                                    "file",
                                    "checkbox",
                                  ].includes(newType)
                                    ? "full"
                                    : next[index].width,
                                };
                                setFormData({ ...formData, formColumns: next });
                              }}
                            >
                              <option value="text">Text Input</option>
                              <option value="email">Email Input</option>
                              <option value="tel">Phone (with Flags)</option>
                              <option value="country">Country Combobox</option>
                              <option value="textarea">
                                Textarea (Multiline)
                              </option>
                              <option value="select">Dropdown Select</option>
                              <option value="number">Number Input</option>
                              <option value="file">File Attachments</option>
                              <option value="checkbox">
                                Checkbox Agreement
                              </option>
                            </select>
                          </div>

                          <div>
                            <label style={labelStyle}>
                              Column Width / Span
                            </label>
                            <select
                              style={inputStyle}
                              value={col.width || "half"}
                              onChange={(e) => {
                                const next = [...currentCols];
                                next[index] = {
                                  ...next[index],
                                  width: e.target.value as any,
                                };
                                setFormData({ ...formData, formColumns: next });
                              }}
                            >
                              <option value="half">
                                1 Column / Half Width (50%)
                              </option>
                              <option value="full">
                                2 Columns / Full Width (100%)
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* Placeholder and Required Settings */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 1.5fr 1fr",
                            gap: "0.75rem",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <label style={labelStyle}>
                              Placeholder / Helper
                            </label>
                            <input
                              style={inputStyle}
                              value={col.placeholder || ""}
                              placeholder="e.g. Enter value..."
                              onChange={(e) => {
                                const next = [...currentCols];
                                next[index] = {
                                  ...next[index],
                                  placeholder: e.target.value,
                                };
                                setFormData({ ...formData, formColumns: next });
                              }}
                            />
                          </div>

                          <div>
                            <label style={labelStyle}>
                              Required Error Message
                            </label>
                            <input
                              style={inputStyle}
                              value={col.requiredError || ""}
                              placeholder="e.g. This field is required."
                              onChange={(e) => {
                                const next = [...currentCols];
                                next[index] = {
                                  ...next[index],
                                  requiredError: e.target.value,
                                };
                                setFormData({ ...formData, formColumns: next });
                              }}
                            />
                          </div>

                          <div style={{ paddingTop: "1.25rem" }}>
                            <label
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.45rem",
                                cursor: "pointer",
                                fontSize: "0.8125rem",
                                fontWeight: 700,
                                color: "#0F172A",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(col.required)}
                                onChange={(e) => {
                                  const next = [...currentCols];
                                  next[index] = {
                                    ...next[index],
                                    required: e.target.checked,
                                  };
                                  setFormData({
                                    ...formData,
                                    formColumns: next,
                                  });
                                }}
                              />
                              Required Field
                            </label>
                          </div>
                        </div>

                        {/* Extra conditional settings for Select, File, and Checkbox */}
                        {col.type === "select" && (
                          <div style={{ marginTop: "0.75rem" }}>
                            <label style={labelStyle}>
                              Dropdown Options (Comma-separated)
                            </label>
                            <input
                              style={inputStyle}
                              value={
                                Array.isArray(col.options)
                                  ? col.options.join(", ")
                                  : ""
                              }
                              placeholder="Cloud Architecture, Platform Modernization, Enterprise AI, Dedicated Team"
                              onChange={(e) => {
                                const next = [...currentCols];
                                next[index] = {
                                  ...next[index],
                                  options: e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                };
                                setFormData({ ...formData, formColumns: next });
                              }}
                            />
                          </div>
                        )}

                        {col.type === "file" && (
                          <div style={{ marginTop: "0.75rem" }}>
                            <label style={labelStyle}>
                              File Attachment Hint Text
                            </label>
                            <input
                              style={inputStyle}
                              value={col.hint || ""}
                              placeholder="PDF, DOCX, XLSX, ZIP · max 15MB"
                              onChange={(e) => {
                                const next = [...currentCols];
                                next[index] = {
                                  ...next[index],
                                  hint: e.target.value,
                                };
                                setFormData({ ...formData, formColumns: next });
                              }}
                            />
                          </div>
                        )}

                        {col.type === "checkbox" && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "0.75rem",
                              marginTop: "0.75rem",
                            }}
                          >
                            <div>
                              <label style={labelStyle}>Policy Link Text</label>
                              <input
                                style={inputStyle}
                                value={col.consentLinkText || ""}
                                placeholder="Privacy Policy"
                                onChange={(e) => {
                                  const next = [...currentCols];
                                  next[index] = {
                                    ...next[index],
                                    consentLinkText: e.target.value,
                                  };
                                  setFormData({
                                    ...formData,
                                    formColumns: next,
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Policy Link URL</label>
                              <input
                                style={inputStyle}
                                value={col.consentLinkUrl || ""}
                                placeholder="/privacy-policy"
                                onChange={(e) => {
                                  const next = [...currentCols];
                                  next[index] = {
                                    ...next[index],
                                    consentLinkUrl: e.target.value,
                                  };
                                  setFormData({
                                    ...formData,
                                    formColumns: next,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Sub-panel C: Keep Button & Customize */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#49243F",
                    marginBottom: "0.75rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px dashed #E2E8F0",
                  }}
                >
                  3. Submit Button Configuration (Keep Button & Customize)
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Submit Button Text</label>
                    <input
                      style={inputStyle}
                      value={formData.submitBtnText || ""}
                      placeholder="Submit"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submitBtnText: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Submitting In-Progress Text
                    </label>
                    <input
                      style={inputStyle}
                      value={formData.submittingBtnText || ""}
                      placeholder="Submitting..."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submittingBtnText: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Button Width / Alignment</label>
                    <select
                      style={inputStyle}
                      value={formData.submitBtnWidth || "full"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submitBtnWidth: e.target.value,
                        })
                      }
                    >
                      <option value="full">Full Width (100%)</option>
                      <option value="left">Left Aligned</option>
                      <option value="center">Center Aligned</option>
                      <option value="right">Right Aligned</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Button Icon</label>
                    <select
                      style={inputStyle}
                      value={formData.submitBtnIcon || "Send"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submitBtnIcon: e.target.value,
                        })
                      }
                    >
                      <option value="Send">Send Arrow</option>
                      <option value="ArrowRight">Right Arrow</option>
                      <option value="CheckCircle2">Check Circle</option>
                      <option value="Sparkles">Sparkles</option>
                      <option value="None">None (Text Only)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>
                    Reassurance Note Below Button
                  </label>
                  <input
                    style={inputStyle}
                    value={formData.submitBtnNote || ""}
                    placeholder="e.g. Your contact information is protected under strict enterprise NDA."
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        submitBtnNote: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Sub-panel C: Form Validation & Submission Error Strings */}
              <div>
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#49243F",
                    marginBottom: "0.75rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px dashed #E2E8F0",
                  }}
                >
                  3. Validation & Submission Error Messages
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Full Name Required Error</label>
                    <input
                      style={inputStyle}
                      value={formData.fullNameRequiredError || ""}
                      placeholder="Full Name is required."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fullNameRequiredError: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Company Required Error</label>
                    <input
                      style={inputStyle}
                      value={formData.companyRequiredError || ""}
                      placeholder="Company name is required."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyRequiredError: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Email Required Error</label>
                    <input
                      style={inputStyle}
                      value={formData.emailRequiredError || ""}
                      placeholder="Work Email is required."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emailRequiredError: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Invalid Format Error</label>
                    <input
                      style={inputStyle}
                      value={formData.emailInvalidError || ""}
                      placeholder="Please provide a valid email address."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emailInvalidError: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Phone Required Error</label>
                    <input
                      style={inputStyle}
                      value={formData.phoneRequiredError || ""}
                      placeholder="Contact number is required."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneRequiredError: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Invalid Format Error</label>
                    <input
                      style={inputStyle}
                      value={formData.phoneInvalidError || ""}
                      placeholder="Enter a valid phone number."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneInvalidError: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Country Required Error</label>
                    <input
                      style={inputStyle}
                      value={formData.countryRequiredError || ""}
                      placeholder="Country / Region is required."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          countryRequiredError: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Message Required Error</label>
                    <input
                      style={inputStyle}
                      value={formData.messageRequiredError || ""}
                      placeholder="Please describe your project or requirements."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          messageRequiredError: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Message Min Length Error</label>
                    <input
                      style={inputStyle}
                      value={formData.messageMinLengthError || ""}
                      placeholder="Please provide at least 10 characters."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          messageMinLengthError: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Consent Required Error</label>
                    <input
                      style={inputStyle}
                      value={formData.consentRequiredError || ""}
                      placeholder="Please confirm you agree to be contacted."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          consentRequiredError: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>File Size Limit Error</label>
                    <input
                      style={inputStyle}
                      value={formData.fileSizeError || ""}
                      placeholder="exceeds the 15 MB limit."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fileSizeError: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      File Type Unsupported Error
                    </label>
                    <input
                      style={inputStyle}
                      value={formData.fileTypeError || ""}
                      placeholder="has an unsupported file type."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fileTypeError: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Submission General Error</label>
                    <input
                      style={inputStyle}
                      value={formData.submitErrorMessage || ""}
                      placeholder="Failed to submit enquiry. Please try again."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submitErrorMessage: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Submission Unexpected Error
                    </label>
                    <input
                      style={inputStyle}
                      value={formData.submitUnexpectedErrorMessage || ""}
                      placeholder="An unexpected error occurred. Please try again."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submitUnexpectedErrorMessage: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Direct Email Link Text</label>
                    <input
                      style={inputStyle}
                      value={formData.submitErrorDirectEmailText || ""}
                      placeholder="Email us directly"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submitErrorDirectEmailText: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 7 & 8: PRIVACY POLICY & TERMS OF SERVICE
        ========================================================= */}
        {(activeTab === "privacy-policy" ||
          activeTab === "terms-of-service") && (
          <div>
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>Legal Page Metadata</div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                {activeTab === "privacy-policy"
                  ? "Privacy Policy"
                  : "Terms of Service"}
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Hero Badge / Kicker</label>
                  <input
                    style={inputStyle}
                    value={formData.kicker || ""}
                    placeholder={
                      activeTab === "privacy-policy"
                        ? "Statutory Compliance"
                        : "Commercial Terms"
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, kicker: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>Effective Date</label>
                  <input
                    style={inputStyle}
                    value={formData.effectiveDate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        effectiveDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                {activeTab === "privacy-policy" ? (
                  <div>
                    <label style={labelStyle}>Privacy Contact Email</label>
                    <input
                      style={inputStyle}
                      value={formData.contactEmail || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>
                      Governing Law & Jurisdiction
                    </label>
                    <input
                      style={inputStyle}
                      value={formData.governingLaw || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          governingLaw: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Introduction Paragraph</label>
                <textarea
                  rows={3}
                  style={inputStyle}
                  value={formData.introduction || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, introduction: e.target.value })
                  }
                />
              </div>
            </div>

            <div style={sectionCardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    margin: 0,
                  }}
                >
                  Document Clauses & Sections
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      sections: [
                        ...(formData.sections || []),
                        {
                          heading: `${(formData.sections?.length || 0) + 1}. New Clause`,
                          body: "Clause details...",
                        },
                      ],
                    })
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.5rem 0.875rem",
                    backgroundColor: "#49243F",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Clause
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {(formData.sections || []).map((sec: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "1rem",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: "#49243F",
                        }}
                      >
                        Clause #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = (formData.sections || []).filter(
                            (_: any, i: number) => i !== idx,
                          );
                          setFormData({ ...formData, sections: next });
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#E11D48",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      style={{ ...inputStyle, marginBottom: "0.5rem" }}
                      value={sec.heading || ""}
                      onChange={(e) => {
                        const next = [...(formData.sections || [])];
                        next[idx] = { ...next[idx], heading: e.target.value };
                        setFormData({ ...formData, sections: next });
                      }}
                    />
                    <textarea
                      rows={3}
                      style={inputStyle}
                      value={sec.body || ""}
                      onChange={(e) => {
                        const next = [...(formData.sections || [])];
                        next[idx] = { ...next[idx], body: e.target.value };
                        setFormData({ ...formData, sections: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            11. NOT FOUND / 404 PAGE
        ========================================================= */}
        {activeTab === "not-found" && (
          <div>
            <div style={sectionCardStyle}>
              <div style={sectionBadgeStyle}>Error 404 Architecture</div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: "1rem",
                }}
              >
                404 Route Not Found Settings
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Badge Text</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.badge || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    placeholder="Status 404"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Title</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Route Not Found"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Description / Explanation</label>
                <textarea
                  rows={3}
                  style={inputStyle}
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="The path you navigated to does not exist or has been relocated within our enterprise architecture."
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Primary Button Label</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.homeBtnText || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, homeBtnText: e.target.value })
                    }
                    placeholder="Return to Homepage"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Primary Button Link</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.homeBtnLink || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, homeBtnLink: e.target.value })
                    }
                    placeholder="/"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>Secondary Button Label</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.insightsBtnText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insightsBtnText: e.target.value,
                      })
                    }
                    placeholder="Browse Resource Hub"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Secondary Button Link</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.insightsBtnLink || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insightsBtnLink: e.target.value,
                      })
                    }
                    placeholder="/technology-insights"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>SEO Browser Title</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.seoTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    placeholder="Page Not Found  Azaroth Tech-Hive"
                  />
                </div>
                <div>
                  <label style={labelStyle}>SEO Meta Description</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.seoDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="The page you are looking for does not exist..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1rem",
            paddingBottom: "3rem",
          }}
        >
          <button
            type="submit"
            disabled={isSaving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.875rem 2rem",
              backgroundColor: "#49243F",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "0.9375rem",
              cursor: isSaving ? "wait" : "pointer",
              opacity: isSaving ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(73, 36, 63, 0.3)",
            }}
          >
            <Save size={18} /> {isSaving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
};
export default AdminPagesManager;
