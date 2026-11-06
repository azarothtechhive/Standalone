// src/pages/admin/AdminSettingsManager.tsx
/**
 * Global Site Settings Editor.
 * BRAND-7: Brand color is strictly a code token (`#8E4585`), never a CMS field;
 * no color picker or runtime theme preset selector exists in the CMS.
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Settings,
  Save,
  CheckCircle2,
  Building,
  MapPin,
  Globe,
  Share2,
  Layers,
  Eye,
  EyeOff,
  Plus,
  Bot,
  X,
  Layout,
  Palette,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useCMS, defaultModules } from "../CMSContext";
import {
  WebsiteSettings,
  WebsiteModuleSetting,
  ChatbotConfig,
} from "../cmsService";
import { adminColors, adminStyles } from "../../styles/adminTheme";
import { ImageUpload } from "../../components/common/ImageUpload";
import logoImg from "../../assets/Logo.png";

const defaultChatbotConfig: ChatbotConfig = {
  isEnabled: true,
  botName: "Azaroth AI Guide",
  botRole: "Automated engineering assistant",
  welcomeMessage:
    "Hello! I'm the automated Azaroth site guide. Ask me about our platforms, engineering services or how to reach the team.",
  quickPrompts: [
    "Explore Products",
    "Explore Services",
    "Request a Quote",
    "Connect With Us",
  ],
  supportEmail: "hello@azaroth-techhive.com",
  supportPhone: "+91 6379480931",
  position: "bottom-right",
};

export const AdminSettingsManager: React.FC = () => {
  const { settings, updateSettings, toggleModule } = useCMS();

  const [formData, setFormData] = useState<Partial<WebsiteSettings>>({
    ...settings,
  });
  const [modulesList, setModulesList] = useState<WebsiteModuleSetting[]>(
    settings.modulesConfig && settings.modulesConfig.length > 0
      ? settings.modulesConfig
      : defaultModules
  );
  const [chatbotForm, setChatbotForm] = useState<ChatbotConfig>({
    ...defaultChatbotConfig,
    ...(settings.chatbotConfig || {}),
  });
  const [newPromptInput, setNewPromptInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"branding" | "settings">("branding");

  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
      if (settings.chatbotConfig) {
        setChatbotForm({
          ...defaultChatbotConfig,
          ...settings.chatbotConfig,
        });
      }
      if (settings.modulesConfig && settings.modulesConfig.length > 0) {
        setModulesList(settings.modulesConfig);
      }
    }
  }, [settings]);

  const handleToggleModuleItem = async (slug: string) => {
    try {
      await toggleModule(slug);
      setNotification("Updated module configuration.");
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification(`Error toggling module: ${err.message}`);
    }
  };

  const handleToggleChatbot = () => {
    setChatbotForm((prev) => ({
      ...prev,
      isEnabled: !prev.isEnabled,
    }));
  };

  const handleAddQuickPrompt = () => {
    const trimmed = newPromptInput.trim();
    if (!trimmed) return;
    const current = chatbotForm.quickPrompts || [];
    if (!current.includes(trimmed)) {
      setChatbotForm((prev) => ({
        ...prev,
        quickPrompts: [...current, trimmed],
      }));
    }
    setNewPromptInput("");
  };

  const handleRemoveQuickPrompt = (promptToRemove: string) => {
    setChatbotForm((prev) => ({
      ...prev,
      quickPrompts: (prev.quickPrompts || []).filter(
        (p) => p !== promptToRemove
      ),
    }));
  };

  const handleAddKnowledgeItem = () => {
    setChatbotForm((prev) => ({
      ...prev,
      knowledgeBase: [
        ...(prev.knowledgeBase || []),
        {
          id: Date.now().toString(),
          triggerKeywords: ["example keyword"],
          response: "Example automated answer for this keyword query.",
          buttons: [],
        },
      ],
    }));
  };

  const handleRemoveKnowledgeItem = (idx: number) => {
    setChatbotForm((prev) => ({
      ...prev,
      knowledgeBase: (prev.knowledgeBase || []).filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateKnowledgeItem = (idx: number, updates: any) => {
    setChatbotForm((prev) => {
      const current = [...(prev.knowledgeBase || [])];
      current[idx] = { ...current[idx], ...updates };
      return { ...prev, knowledgeBase: current };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      const payload: Partial<WebsiteSettings> = {
        ...formData,
        modulesConfig: modulesList,
        chatbotConfig: chatbotForm,
      };

      await updateSettings(payload);
      setNotification("Site settings saved successfully.");
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        padding: "0",
        overflowX: "hidden",
      }}
    >
      <div style={{ marginBottom: "clamp(1rem, 2vw, 2rem)", padding: "clamp(0.5rem, 1vw, 0)" }}>
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
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              backgroundColor: adminColors.amber.light,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Settings size={22} color={adminColors.amber.text} />
          </div>
          Site Settings
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: adminColors.slate.textMuted,
            marginTop: "0.5rem",
            marginLeft: "3.5rem",
          }}
        >
          Manage corporate identity, brand assets, interactive site guide,
          headquarters contact channels, global SEO defaults, and footer copy.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Site settings sections"
        style={{
          display: "inline-flex",
          gap: "0.35rem",
          padding: "0.3rem",
          backgroundColor: "#F1F5F9",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          marginBottom: "1.25rem",
        }}
      >
        {[
          { id: "branding" as const, label: "Branding", description: "Identity, logo & visual theme" },
          { id: "settings" as const, label: "Settings", description: "Guide, contact, SEO & modules" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === tab.id ? "#FFFFFF" : "transparent",
              color: activeTab === tab.id ? adminColors.indigo.text : adminColors.slate.textMuted,
              boxShadow: activeTab === tab.id ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
              cursor: "pointer",
              fontSize: "0.8125rem",
              fontWeight: 700,
            }}
            title={tab.description}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {notification && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.875rem 1.25rem",
            backgroundColor: adminColors.emerald.light,
            border: `1px solid ${adminColors.emerald.border}`,
            borderRadius: "10px",
            color: adminColors.emerald.text,
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} color={adminColors.emerald.base} />{" "}
          {notification}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
      >
        {activeTab === "branding" && (
          <>
        {/* 1. Corporate Identity & Brand Logo */}
        <div
          style={{
            backgroundColor: adminColors.slate.card,
            border: `1px solid ${adminColors.slate.border}`,
            borderRadius: "12px",
            padding: "1.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.25rem",
              borderBottom: `1px solid ${adminColors.slate.borderLight}`,
              paddingBottom: "0.875rem",
            }}
          >
            <Building size={17} color={adminColors.indigo.text} />
            <h2
              style={{
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: adminColors.indigo.text,
                margin: 0,
              }}
            >
              1. Corporate Identity &amp; Brand Logo
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            <div
              style={{
                padding: "1.25rem",
                borderRadius: "10px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
              <ImageUpload
                value={formData.logoUrl || ""}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                label="Official Brand Logo"
                description="Upload brand logo (PNG, SVG, WebP, JPG). Max 5MB."
                isLogo={true}
                aspectRatioHint="Recommended: 4:1 or 1:1 SVG/PNG"
              />
              {!formData.logoUrl && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.6rem 0.75rem",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "6px",
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <img
                    src={logoImg}
                    alt="Default Logo"
                    style={{ height: "24px", objectFit: "contain" }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                    Using default bundled logo
                  </span>
                </div>
              )}

              <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px dashed #CBD5E1" }}>
                <ImageUpload
                  value={formData.faviconUrl || ""}
                  onChange={(url) => setFormData({ ...formData, faviconUrl: url })}
                  label="Browser Favicon Icon"
                  description="Upload website favicon (.ico, .png, .svg). Max 2MB."
                  isLogo={true}
                  aspectRatioHint="Recommended: 1:1 square (32x32, 64x64, 128x128)"
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
                gap: "1.25rem",
              }}
            >
              <div>
                <label style={adminStyles.label}>Legal Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  style={adminStyles.input}
                />
              </div>

              <div>
                <label style={adminStyles.label}>Corporate Tagline</label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  style={adminStyles.input}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={adminStyles.label}>
                  Company Description &amp; Meta Overview
                </label>
                <textarea
                  rows={3}
                  value={formData.metaDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaDescription: e.target.value,
                    })
                  }
                  style={adminStyles.textarea}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Visual Theme & Color Palette Customization */}
        <div
          style={{
            backgroundColor: adminColors.slate.card,
            border: `1px solid ${adminColors.slate.border}`,
            borderRadius: "12px",
            padding: "1.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
              borderBottom: `1px solid ${adminColors.slate.borderLight}`,
              paddingBottom: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <Palette size={17} color="#49243F" />
              <div>
                <h2
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    color: adminColors.indigo.text,
                    margin: 0,
                  }}
                >
                  2. Visual Theme &amp; Color Palette Customization
                </h2>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: adminColors.slate.textMuted,
                  }}
                >
                  Configure brand primary, secondary, and accent colors or select pre-configured luxury palettes.
                </span>
              </div>
            </div>
          </div>

          {/* Theme Presets */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={adminStyles.label}>Theme Presets</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              {[
                {
                  id: "imperial-plum",
                  name: "Imperial Plum & Antique Gold",
                  description: "Official luxury enterprise brand identity",
                  primary: "#49243F",
                  secondary: "#8A315D",
                  accent: "#C99B52",
                  bg: "#FAF8F4",
                  text: "#18181B",
                },
                {
                  id: "deep-plum",
                  name: "Deep Plum & Rose",
                  description: "Rich contrast with prominent plum tones",
                  primary: "#35182E",
                  secondary: "#8A315D",
                  accent: "#C99B52",
                  bg: "#FAF8F4",
                  text: "#18181B",
                },
                {
                  id: "velvet-noir",
                  name: "Velvet Noir & Gold",
                  description: "High-contrast modern editorial aesthetic",
                  primary: "#18181B",
                  secondary: "#49243F",
                  accent: "#C99B52",
                  bg: "#FAF8F4",
                  text: "#18181B",
                },
              ].map((preset) => {
                const isSelected =
                  formData.themeConfig?.preset === preset.id ||
                  (!formData.themeConfig?.preset && preset.id === "imperial-plum");

                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        primary_color: preset.primary,
                        secondary_color: preset.secondary,
                        accent_color: preset.accent,
                        background_color: preset.bg,
                        themeConfig: {
                          ...formData.themeConfig,
                          preset: preset.id,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          accentColor: preset.accent,
                          backgroundColor: preset.bg,
                          textColor: preset.text,
                        },
                      });
                    }}
                    style={{
                      padding: "1rem",
                      borderRadius: "10px",
                      border: isSelected
                        ? "2px solid #49243F"
                        : "1px solid #E2E8F0",
                      backgroundColor: isSelected ? "#FDFCFB" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", gap: "6px", marginBottom: "0.75rem" }}>
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: preset.primary,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: preset.secondary,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: preset.accent,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: preset.bg,
                          border: "1px solid #CBD5E1",
                        }}
                      />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1E293B" }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "0.25rem" }}>
                      {preset.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Inputs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <label style={adminStyles.label}>Primary Color</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="color"
                  value={formData.themeConfig?.primaryColor || formData.primary_color || "#49243F"}
                  onChange={(e) => {
                    const color = e.target.value;
                    setFormData({
                      ...formData,
                      primary_color: color,
                      themeConfig: {
                        ...formData.themeConfig,
                        preset: "custom",
                        primaryColor: color,
                      },
                    });
                  }}
                  style={{ width: "36px", height: "36px", border: "none", borderRadius: "6px", cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  value={formData.themeConfig?.primaryColor || formData.primary_color || "#49243F"}
                  onChange={(e) => {
                    const color = e.target.value;
                    setFormData({
                      ...formData,
                      primary_color: color,
                      themeConfig: {
                        ...formData.themeConfig,
                        preset: "custom",
                        primaryColor: color,
                      },
                    });
                  }}
                  style={{ ...adminStyles.input, flex: 1 }}
                />
              </div>
            </div>

            <div>
              <label style={adminStyles.label}>Secondary / Hover Color</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="color"
                  value={formData.themeConfig?.secondaryColor || formData.secondary_color || "#8A315D"}
                  onChange={(e) => {
                    const color = e.target.value;
                    setFormData({
                      ...formData,
                      secondary_color: color,
                      themeConfig: {
                        ...formData.themeConfig,
                        preset: "custom",
                        secondaryColor: color,
                      },
                    });
                  }}
                  style={{ width: "36px", height: "36px", border: "none", borderRadius: "6px", cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  value={formData.themeConfig?.secondaryColor || formData.secondary_color || "#8A315D"}
                  onChange={(e) => {
                    const color = e.target.value;
                    setFormData({
                      ...formData,
                      secondary_color: color,
                      themeConfig: {
                        ...formData.themeConfig,
                        preset: "custom",
                        secondaryColor: color,
                      },
                    });
                  }}
                  style={{ ...adminStyles.input, flex: 1 }}
                />
              </div>
            </div>

            <div>
              <label style={adminStyles.label}>Accent / Gold Token</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="color"
                  value={formData.themeConfig?.accentColor || formData.accent_color || "#C99B52"}
                  onChange={(e) => {
                    const color = e.target.value;
                    setFormData({
                      ...formData,
                      accent_color: color,
                      themeConfig: {
                        ...formData.themeConfig,
                        preset: "custom",
                        accentColor: color,
                      },
                    });
                  }}
                  style={{ width: "36px", height: "36px", border: "none", borderRadius: "6px", cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  value={formData.themeConfig?.accentColor || formData.accent_color || "#C99B52"}
                  onChange={(e) => {
                    const color = e.target.value;
                    setFormData({
                      ...formData,
                      accent_color: color,
                      themeConfig: {
                        ...formData.themeConfig,
                        preset: "custom",
                        accentColor: color,
                      },
                    });
                  }}
                  style={{ ...adminStyles.input, flex: 1 }}
                />
              </div>
            </div>

            <div>
              <label style={adminStyles.label}>Canvas Background</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="color"
                  value={formData.themeConfig?.backgroundColor || formData.background_color || "#FAF8F4"}
                  onChange={(e) => {
                    const color = e.target.value;
                    setFormData({
                      ...formData,
                      background_color: color,
                      themeConfig: {
                        ...formData.themeConfig,
                        preset: "custom",
                        backgroundColor: color,
                      },
                    });
                  }}
                  style={{ width: "36px", height: "36px", border: "none", borderRadius: "6px", cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  value={formData.themeConfig?.backgroundColor || formData.background_color || "#FAF8F4"}
                  onChange={(e) => {
                    const color = e.target.value;
                    setFormData({
                      ...formData,
                      background_color: color,
                      themeConfig: {
                        ...formData.themeConfig,
                        preset: "custom",
                        backgroundColor: color,
                      },
                    });
                  }}
                  style={{ ...adminStyles.input, flex: 1 }}
                />
              </div>
            </div>
          </div>

          {/* Live Preview Bar */}
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "10px",
              backgroundColor: formData.themeConfig?.backgroundColor || formData.background_color || "#FAF8F4",
              border: "1px solid #E2E8F0",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              Live Theme Preview
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "6px",
                  backgroundColor: formData.themeConfig?.primaryColor || formData.primary_color || "#49243F",
                  color: "#FAF8F4",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                }}
              >
                Primary Button
              </div>
              <div
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "20px",
                  backgroundColor: `${formData.themeConfig?.accentColor || formData.accent_color || "#C99B52"}22`,
                  color: formData.themeConfig?.accentColor || formData.accent_color || "#C99B52",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  border: `1px solid ${formData.themeConfig?.accentColor || formData.accent_color || "#C99B52"}55`,
                }}
              >
                Accent Tag
              </div>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: formData.themeConfig?.primaryColor || formData.primary_color || "#49243F",
                  fontFamily: "serif",
                }}
              >
                {formData.companyName || "Azaroth Tech-Hive"}
              </span>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === "settings" && (
          <>
        {/* 1. Interactive Site Guide Widget */}
        <div
          style={{
            backgroundColor: adminColors.slate.card,
            border: `1px solid ${adminColors.slate.border}`,
            borderRadius: "12px",
            padding: "1.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
              borderBottom: `1px solid ${adminColors.slate.borderLight}`,
              paddingBottom: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <Bot size={17} color="#4F46E5" />
              <h2
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  color: "#1E293B",
                  margin: 0,
                }}
              >
                1. Interactive Site Guide Widget
              </h2>
            </div>

            <button
              type="button"
              onClick={handleToggleChatbot}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.9rem",
                borderRadius: "8px",
                border: `1px solid ${chatbotForm.isEnabled ? "#A7F3D0" : "#FDE68A"}`,
                backgroundColor: chatbotForm.isEnabled ? "#ECFDF5" : "#FEF3C7",
                color: chatbotForm.isEnabled ? "#047857" : "#B45309",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {chatbotForm.isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>{chatbotForm.isEnabled ? "Enabled" : "Disabled"}</span>
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label style={adminStyles.label}>Assistant Display Name</label>
              <input
                type="text"
                value={chatbotForm.botName || ""}
                onChange={(e) =>
                  setChatbotForm({ ...chatbotForm, botName: e.target.value })
                }
                style={adminStyles.input}
              />
            </div>

            <div>
              <label style={adminStyles.label}>Assistant Subtitle / Role</label>
              <input
                type="text"
                value={chatbotForm.botRole || ""}
                onChange={(e) =>
                  setChatbotForm({ ...chatbotForm, botRole: e.target.value })
                }
                style={adminStyles.input}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={adminStyles.label}>Welcome Greeting Message</label>
            <textarea
              rows={2}
              value={chatbotForm.welcomeMessage || ""}
              onChange={(e) =>
                setChatbotForm({
                  ...chatbotForm,
                  welcomeMessage: e.target.value,
                })
              }
              style={adminStyles.textarea}
            />
          </div>

          <div>
            <label style={adminStyles.label}>Quick Prompt Chips</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
                marginBottom: "0.625rem",
              }}
            >
              {(chatbotForm.quickPrompts || []).map((prompt, idx) => (
                <span
                  key={idx}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.3rem 0.65rem",
                    borderRadius: "9999px",
                    backgroundColor: "#EEF2FF",
                    color: "#4338CA",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    border: "1px solid #C7D2FE",
                  }}
                >
                  {prompt}
                  <button
                    type="button"
                    onClick={() => handleRemoveQuickPrompt(prompt)}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "#6366F1",
                      display: "flex",
                    }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={newPromptInput}
                onChange={(e) => setNewPromptInput(e.target.value)}
                placeholder="Add quick prompt..."
                style={{ ...adminStyles.input, flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddQuickPrompt}
                style={{
                  padding: "0.5rem 0.85rem",
                  borderRadius: "8px",
                  backgroundColor: "#1E293B",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Plus size={14} /> Add Chip
              </button>
            </div>
          </div>

          {/* Custom Q&A Knowledge Base */}
          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: `1px dashed ${adminColors.slate.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <label style={{ ...adminStyles.label, marginBottom: "0.15rem" }}>
                  Automated Q&A Knowledge Base (Custom Trigger Rules)
                </label>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748B" }}>
                  Define keyword triggers that return custom answers and optional call-to-action buttons.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddKnowledgeItem}
                style={{
                  padding: "0.45rem 0.85rem",
                  borderRadius: "8px",
                  backgroundColor: "#49243F",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Plus size={14} /> Add Q&A Rule
              </button>
            </div>

            {(!chatbotForm.knowledgeBase || chatbotForm.knowledgeBase.length === 0) ? (
              <div style={{ padding: "0.875rem", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px dashed #CBD5E1", fontSize: "0.8rem", color: "#64748B", textAlign: "center" }}>
                No custom Q&A rules defined yet. Standard built-in keywords (products, services, quote, contact, about) will handle user queries automatically.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {chatbotForm.knowledgeBase.map((item, idx) => {
                  const triggerStr = Array.isArray(item.triggerKeywords)
                    ? item.triggerKeywords.join(", ")
                    : String(item.triggerKeywords || "");
                  const primaryButton = item.buttons && item.buttons.length > 0 ? item.buttons[0] : { label: "", action: "" };

                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        padding: "0.875rem",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#49243F" }}>
                          Rule #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKnowledgeItem(idx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#EF4444",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          <Trash2 size={13} /> Remove Rule
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
                        <div>
                          <label style={{ fontSize: "0.725rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: "0.2rem" }}>
                            Trigger Keywords (comma-separated, e.g. audit, security, pentest)
                          </label>
                          <input
                            type="text"
                            value={triggerStr}
                            placeholder="e.g. audit, compliance, iso27001"
                            onChange={(e) => {
                              const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                              handleUpdateKnowledgeItem(idx, { triggerKeywords: arr });
                            }}
                            style={adminStyles.input}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: "0.725rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: "0.2rem" }}>
                            Bot Response Message
                          </label>
                          <textarea
                            rows={2}
                            value={item.response || ""}
                            placeholder="Enter the automated response message..."
                            onChange={(e) => handleUpdateKnowledgeItem(idx, { response: e.target.value })}
                            style={adminStyles.textarea}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                          <div>
                            <label style={{ fontSize: "0.725rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: "0.2rem" }}>
                              Action Button Label (optional)
                            </label>
                            <input
                              type="text"
                              value={primaryButton.label || ""}
                              placeholder="e.g. Schedule Audit"
                              onChange={(e) => {
                                const newButtons = [{ label: e.target.value, action: primaryButton.action || "/connect-with-us" }];
                                handleUpdateKnowledgeItem(idx, { buttons: newButtons });
                              }}
                              style={adminStyles.input}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.725rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: "0.2rem" }}>
                              Action Route / Link (optional)
                            </label>
                            <input
                              type="text"
                              value={primaryButton.action || ""}
                              placeholder="e.g. /connect-with-us"
                              onChange={(e) => {
                                const newButtons = [{ label: primaryButton.label || "Learn More", action: e.target.value }];
                                handleUpdateKnowledgeItem(idx, { buttons: newButtons });
                              }}
                              style={adminStyles.input}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>


        {/* 2. Website Section & Module Visibility */}
        <div
          style={{
            backgroundColor: adminColors.slate.card,
            border: `1px solid ${adminColors.slate.border}`,
            borderRadius: "12px",
            padding: "1.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.25rem",
              borderBottom: `1px solid ${adminColors.slate.borderLight}`,
              paddingBottom: "0.875rem",
            }}
          >
            <Layers size={17} color={adminColors.indigo.text} />
            <h2
              style={{
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: adminColors.indigo.text,
                margin: 0,
              }}
            >
              2. Website Section &amp; Module Visibility
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {modulesList.map((mod) => {
              const isEnabled = mod.isEnabled !== false;
              return (
                <div
                  key={mod.id}
                  style={{
                    padding: "1rem",
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#0F172A",
                      }}
                    >
                      {mod.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      {mod.path}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleModuleItem(mod.slug)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.45rem 0.85rem",
                      borderRadius: "8px",
                      border: `1px solid ${isEnabled ? "#A7F3D0" : "#FDE68A"}`,
                      backgroundColor: isEnabled ? "#ECFDF5" : "#FEF3C7",
                      color: isEnabled ? "#047857" : "#B45309",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {isEnabled ? <Eye size={15} /> : <EyeOff size={15} />}
                    <span>{isEnabled ? "Enabled" : "Disabled"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>


        {/* 3. Headquarters & Contact Channels */}
        <div
          style={{
            backgroundColor: adminColors.slate.card,
            border: `1px solid ${adminColors.slate.border}`,
            borderRadius: "12px",
            padding: "1.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.25rem",
              borderBottom: `1px solid ${adminColors.slate.borderLight}`,
              paddingBottom: "0.875rem",
            }}
          >
            <MapPin size={17} color={adminColors.emerald.text} />
            <h2
              style={{
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: adminColors.emerald.text,
                margin: 0,
              }}
            >
              3. Headquarters &amp; Contact Channels
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
              gap: "1.25rem",
            }}
          >
            <div style={{ gridColumn: "span 2" }}>
              <label style={adminStyles.label}>
                Head Office Physical Address
              </label>
              <input
                type="text"
                value={formData.headquarters || ""}
                onChange={(e) =>
                  setFormData({ ...formData, headquarters: e.target.value })
                }
                style={adminStyles.input}
              />
            </div>

            <div>
              <label style={adminStyles.label}>General / Support Email</label>
              <input
                type="email"
                value={formData.supportEmail || ""}
                onChange={(e) =>
                  setFormData({ ...formData, supportEmail: e.target.value })
                }
                style={adminStyles.input}
              />
            </div>

            <div>
              <label style={adminStyles.label}>Official Phone Number</label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                style={adminStyles.input}
              />
            </div>
          </div>
        </div>


        {/* 4. Social Profiles */}
        <div
          style={{
            backgroundColor: adminColors.slate.card,
            border: `1px solid ${adminColors.slate.border}`,
            borderRadius: "12px",
            padding: "1.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.25rem",
              borderBottom: `1px solid ${adminColors.slate.borderLight}`,
              paddingBottom: "0.875rem",
            }}
          >
            <Share2 size={17} color={adminColors.amber.text} />
            <h2
              style={{
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: adminColors.amber.text,
                margin: 0,
              }}
            >
              4. Social Profiles
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
              gap: "1.25rem",
            }}
          >
            <div>
              <label style={adminStyles.label}>LinkedIn URL</label>
              <input
                type="text"
                value={formData.linkedinUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, linkedinUrl: e.target.value })
                }
                style={adminStyles.input}
              />
            </div>

            <div>
              <label style={adminStyles.label}>Twitter / X URL</label>
              <input
                type="text"
                value={formData.twitterUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, twitterUrl: e.target.value })
                }
                style={adminStyles.input}
              />
            </div>

            <div>
              <label style={adminStyles.label}>GitHub URL</label>
              <input
                type="text"
                value={formData.githubUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, githubUrl: e.target.value })
                }
                style={adminStyles.input}
              />
            </div>
          </div>
        </div>


        {/* 5. Global Search & SEO Metadata */}
        <div
          style={{
            backgroundColor: adminColors.slate.card,
            border: `1px solid ${adminColors.slate.border}`,
            borderRadius: "12px",
            padding: "1.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.25rem",
              borderBottom: `1px solid ${adminColors.slate.borderLight}`,
              paddingBottom: "0.875rem",
            }}
          >
            <Globe size={17} color={adminColors.rose.text} />
            <h2
              style={{
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: adminColors.rose.text,
                margin: 0,
              }}
            >
              5. Global Search &amp; SEO Metadata
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1.25rem",
            }}
          >
            <div>
              <label style={adminStyles.label}>Global HTML Title Tag</label>
              <input
                type="text"
                value={formData.metaTitle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                style={adminStyles.input}
              />
            </div>
          </div>
        </div>





        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            backgroundColor: adminColors.slate.card,
            border: `1px solid ${adminColors.slate.border}`,
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                backgroundColor: adminColors.amber.light,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Layout size={18} color={adminColors.amber.text} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: adminColors.slate.textPrimary }}>
                Footer content has its own module
              </div>
              <div style={{ fontSize: "0.8125rem", color: adminColors.slate.textMuted }}>
                Column layout, copyright, and footer links are managed in Footer Manager to avoid duplicate fields.
              </div>
            </div>
          </div>
          <Link
            to="/admin/footer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 1rem",
              backgroundColor: "#49243F",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Open Footer Manager <ExternalLink size={13} />
          </Link>
        </div>
          </>
        )}

        {/* Submit Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            position: "sticky",
            bottom: "1rem",
            zIndex: 30,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(8px)",
            padding: "0.75rem",
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          }}
        >
          <button
            type="submit"
            disabled={isSaving}
            style={{
              ...adminStyles.primaryButton,
              padding: "0.875rem 2.5rem",
              fontSize: "0.9375rem",
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            <Save size={18} />{" "}
            {isSaving ? "Saving Settings..." : "Save Site Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};


