// src/pages/admin/AdminLayout.tsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Layers,
  Briefcase,
  BookOpen,
  MessageSquareQuote,
  Navigation,
  Mail,
  FileSpreadsheet,
  Image,
  Settings,
  History,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  KeyRound,
  Database,
  User,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelBottom,
  Sparkles,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useCMS } from "../CMSContext";
import logoImg from "../../assets/Logo.png";
import { CustomCursor } from "../../components/common/CustomCursor";
import { authService } from "../../services/authService";

export const AdminLayout: React.FC = () => {
  const { user, logout, isSuperAdmin, refreshProfile } = useAdminAuth();
  const { isLive, refreshContent, settings } = useCMS();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("azaroth_admin_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("azaroth_admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (window.innerWidth < 1024) {
          setMobileMenuOpen((prev) => !prev);
        } else {
          toggleSidebar();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const rawName = user?.name?.trim();
  const loggedInName =
    !rawName || rawName === "Principal System Administrator"
      ? user?.email
        ? user.email.split("@")[0]
        : "Admin"
      : rawName;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileStatus, setProfileStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleOpenProfile = () => {
    setProfileName(loggedInName);
    setProfileEmail(user?.email || "");
    setProfileStatus(null);
    setShowProfileModal(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileStatus({ success: false, message: "Name cannot be empty" });
      return;
    }
    if (!profileEmail.trim()) {
      setProfileStatus({ success: false, message: "Email cannot be empty" });
      return;
    }

    setIsSavingProfile(true);
    setProfileStatus(null);

    try {
      const res = await authService.updateProfile({
        name: profileName.trim(),
        email: profileEmail.trim().toLowerCase(),
      });
      if (res.success) {
        await refreshProfile();
        setProfileStatus({
          success: true,
          message: "User profile updated successfully!",
        });
        setTimeout(() => {
          setShowProfileModal(false);
          setProfileStatus(null);
        }, 1500);
      } else {
        setProfileStatus({
          success: false,
          message: res.message || "Failed to update profile",
        });
      }
    } catch {
      setProfileStatus({ success: false, message: "Failed to update profile" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const navItems = [
    {
      to: "/admin",
      end: true,
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "#18181B",
    },
    {
      to: "/admin/pages",
      label: "Pages & Sections (Page-Wise)",
      icon: FileText,
      color: "#49243F",
    },
    {
      to: "/admin/products",
      label: "Products Catalog",
      icon: ShoppingBag,
      color: "#18181B",
    },
    {
      to: "/admin/services",
      label: "Enterprise Services",
      icon: Layers,
      color: "#49243F",
    },
    {
      to: "/admin/portfolio",
      label: "Featured Projects",
      icon: Briefcase,
      color: "#49243F",
    },
    {
      to: "/admin/insights",
      label: "Resource Hub Articles",
      icon: BookOpen,
      color: "#18181B",
    },
    {
      to: "/admin/testimonials",
      label: "Client Testimonials",
      icon: MessageSquareQuote,
      color: "#49243F",
    },
    {
      to: "/admin/navigation",
      label: "Navigation Menu",
      icon: Navigation,
      color: "#18181B",
    },
    {
      to: "/admin/footer",
      label: "Footer Architecture",
      icon: PanelBottom,
      color: "#49243F",
    },
    {
      to: "/admin/animations",
      label: "Animation Effects",
      icon: Sparkles,
      color: "#7C3AED",
    },
    {
      to: "/admin/inquiries",
      label: "Inquiries Inbox",
      icon: Mail,
      color: "#18181B",
    },
    {
      to: "/admin/media",
      label: "Media Library",
      icon: Image,
      color: "#18181B",
    },
    {
      to: "/admin/settings",
      label: "Branding & Settings",
      icon: Settings,
      color: "#18181B",
    },
    {
      to: "/admin/audit-logs",
      label: "Audit Trail",
      icon: History,
      color: "#E11D48",
    },
    ...(isSuperAdmin
      ? [
          {
            to: "/admin/users",
            label: "Team & Access",
            icon: Users,
            color: "#18181B",
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        success: false,
        message: "New passwords do not match",
      });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({
        success: false,
        message: "Password must be at least 8 characters",
      });
      return;
    }

    setIsChangingPass(true);
    setPasswordStatus(null);

    try {
      const data = await authService.changePassword(
        currentPassword,
        newPassword,
      );
      setPasswordStatus(data);
      if (data.success) {
        setTimeout(() => {
          setShowPasswordModal(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordStatus(null);
        }, 1500);
      }
    } catch {
      setPasswordStatus({
        success: false,
        message: "Failed to connect to authentication server",
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#F8FAFC",
        color: "#0F172A",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      <CustomCursor />
      {/* Sidebar for Desktop - Left Navigation */}
      <aside
        style={{
          width: sidebarCollapsed ? "72px" : "260px",
          minWidth: sidebarCollapsed ? "72px" : "260px",
          maxWidth: sidebarCollapsed ? "72px" : "260px",
          flexShrink: 0,
          height: "100vh",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 40,
          boxShadow: "1px 0 3px rgba(0, 0, 0, 0.02)",
          transition:
            "width 0.2s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.2s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          visibility: "visible",
        }}
        className="hidden lg:flex"
      >
        {/* Brand Header */}
        <div
          style={{
            flexShrink: 0,
            padding: sidebarCollapsed ? "1.15rem 0.5rem" : "1.25rem 1.25rem",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
            backgroundColor: "#FFFFFF",
            minWidth: sidebarCollapsed ? "72px" : "260px",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              gap: sidebarCollapsed ? "0" : "0.75rem",
              width: sidebarCollapsed ? "100%" : "auto",
            }}
          >
            <img
              src={settings?.logoUrl || logoImg}
              alt="Azaroth"
              title={sidebarCollapsed ? "Azaroth CMS — Click to expand" : undefined}
              onClick={sidebarCollapsed ? toggleSidebar : undefined}
              style={{
                height: sidebarCollapsed ? "30px" : "34px",
                width: sidebarCollapsed ? "30px" : "auto",
                maxWidth: sidebarCollapsed ? "30px" : "120px",
                objectFit: "contain",
                cursor: sidebarCollapsed ? "pointer" : "default",
                transition: "all 0.2s ease",
              }}
            />
            {!sidebarCollapsed && (
              <div>
                <div
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Azaroth CMS
                </div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "#D97706",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  End-to-End Control
                </div>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              title="Collapse sidebar (Ctrl+B)"
              style={{
                background: "none",
                border: "none",
                color: "#64748B",
                cursor: "pointer",
                padding: "0.35rem",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F1F5F9";
                e.currentTarget.style.color = "#0F172A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#64748B";
              }}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>

        {/* Navigation List - Independently Scrollable */}
        <nav
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: sidebarCollapsed ? "0.75rem 0.4rem" : "1rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            overscrollBehavior: "contain",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={sidebarCollapsed ? item.label : undefined}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  gap: sidebarCollapsed ? "0" : "0.75rem",
                  padding: sidebarCollapsed ? "0.625rem 0" : "0.625rem 0.875rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: "none",
                  color: isActive ? "#18181B" : "#475569",
                  backgroundColor: isActive ? "#F4F4F5" : "transparent",
                  border: isActive
                    ? "1px solid #E4E4E7"
                    : "1px solid transparent",
                  borderLeft: !sidebarCollapsed && isActive
                    ? "3px solid #18181B"
                    : (isActive ? "1px solid #E4E4E7" : "1px solid transparent"),
                  transition: "all 0.15s ease",
                  position: "relative",
                })}
              >
                <Icon size={sidebarCollapsed ? 20 : 18} color={item.color} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Database Status & Footer */}
        <div
          style={{
            flexShrink: 0,
            padding: sidebarCollapsed ? "0.75rem 0.4rem" : "1rem",
            borderTop: "1px solid #E2E8F0",
            backgroundColor: "#F8FAFC",
            display: "flex",
            flexDirection: "column",
            alignItems: sidebarCollapsed ? "center" : "stretch",
            gap: "0.5rem",
          }}
        >
          {sidebarCollapsed ? (
            <>
              <button
                onClick={() => refreshContent()}
                title={`Database: ${isLive ? "Postgres Neon Live" : "Local Fallback"} (Click to sync)`}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "8px",
                  backgroundColor: isLive ? "#ECFDF5" : "#FEF3C7",
                  border: `1px solid ${isLive ? "#A7F3D0" : "#FDE68A"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                  margin: "0 auto",
                }}
              >
                <Database size={16} color={isLive ? "#047857" : "#D97706"} />
              </button>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                title="View Live Website"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  margin: "0 auto",
                }}
              >
                <ExternalLink size={16} color="#18181B" />
              </a>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.25rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.25rem 0.625rem",
                    borderRadius: "9999px",
                    backgroundColor: isLive ? "#ECFDF5" : "#FEF3C7",
                    color: isLive ? "#047857" : "#B45309",
                    border: `1px solid ${isLive ? "#A7F3D0" : "#FDE68A"}`,
                  }}
                >
                  <Database size={13} color={isLive ? "#047857" : "#D97706"} />
                  {isLive ? "Postgres Neon Live" : "Local Fallback"}
                </span>
                <button
                  onClick={() => refreshContent()}
                  title="Refresh all CMS data"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#18181B",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  Sync
                </button>
              </div>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#334155",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  transition: "background 0.2s",
                }}
              >
                <ExternalLink size={13} color="#18181B" /> View Live Website
              </a>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100vh",
          maxHeight: "100vh",
          overflow: "hidden",
          backgroundColor: "#F8FAFC",
        }}
      >
        {/* Top Header */}
        <header
          style={{
            height: "64px",
            flexShrink: 0,
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 clamp(0.75rem, 2vw, 1.5rem)",
            position: "sticky",
            top: 0,
            zIndex: 30,
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            boxSizing: "border-box",
            maxWidth: "100%",
            width: "100%",
          }}
        >
          {/* Sidebar Toggle & Environment status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(0.5rem, 1.5vw, 1rem)",
              minWidth: 0,
            }}
          >
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileMenuOpen(!mobileMenuOpen);
                } else {
                  toggleSidebar();
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F8FAFC",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                padding: "0.45rem",
                cursor: "pointer",
                color: "#334155",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F1F5F9";
                e.currentTarget.style.borderColor = "#94A3B8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F8FAFC";
                e.currentTarget.style.borderColor = "#CBD5E1";
              }}
              title={
                sidebarCollapsed
                  ? "Expand sidebar (Ctrl+B)"
                  : "Collapse sidebar (Ctrl+B)"
              }
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {mobileMenuOpen ? (
                <X size={19} color="#49243F" />
              ) : sidebarCollapsed ? (
                <PanelLeftOpen size={19} color="#49243F" />
              ) : (
                <PanelLeftClose size={19} color="#49243F" />
              )}
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#047857",
                  flexShrink: 0,
                }}
              />
              <span
                className="hidden sm:inline"
                style={{
                  fontSize: "0.8125rem",
                  color: "#475569",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                Production CMS Control
              </span>
            </div>
          </div>

          {/* User controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(0.5rem, 1.5vw, 1rem)",
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleOpenProfile}
              title="Click to view and edit user profile"
              style={{
                textAlign: "right",
                display: "flex",
                flexDirection: "column",
                background: "none",
                border: "1px solid transparent",
                borderRadius: "8px",
                padding: "0.25rem 0.5rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F1F5F9";
                e.currentTarget.style.borderColor = "#CBD5E1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <User size={14} color="#18181B" />
                {loggedInName}
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: user?.role === "SUPER_ADMIN" ? "#18181B" : "#B45309",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {user?.role || "Admin"}
              </span>
            </button>

            <button
              onClick={() => setShowPasswordModal(true)}
              title="Change Password"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                color: "#475569",
                padding: "0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <KeyRound size={16} color="#18181B" />
            </button>

            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                backgroundColor: "#FFE4E6",
                border: "1px solid #FECDD3",
                borderRadius: "8px",
                color: "#BE123C",
                padding: "0.5rem 0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                transition: "background 0.15s ease",
              }}
            >
              <LogOut size={15} color="#E11D48" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              position: "fixed",
              top: "64px",
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#FFFFFF",
              zIndex: 50,
              padding: "1.5rem",
              overflowY: "auto",
              borderTop: "1px solid #E2E8F0",
            }}
            className="lg:hidden"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      fontSize: "0.9375rem",
                      fontWeight: isActive ? 600 : 500,
                      textDecoration: "none",
                      color: isActive ? "#18181B" : "#334155",
                      backgroundColor: isActive ? "#F4F4F5" : "transparent",
                      border: isActive
                        ? "1px solid #E4E4E7"
                        : "1px solid transparent",
                    })}
                  >
                    <Icon size={20} color={item.color} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {/* Mobile-only footer actions */}
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.25rem 0.625rem",
                      borderRadius: "9999px",
                      backgroundColor: isLive ? "#ECFDF5" : "#FEF3C7",
                      color: isLive ? "#047857" : "#B45309",
                      border: `1px solid ${isLive ? "#A7F3D0" : "#FDE68A"}`,
                    }}
                  >
                    <Database
                      size={13}
                      color={isLive ? "#047857" : "#D97706"}
                    />
                    {isLive ? "Postgres Neon Live" : "Local Fallback"}
                  </span>
                  <button
                    onClick={() => refreshContent()}
                    title="Refresh all CMS data"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#18181B",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                    }}
                  >
                    Sync
                  </button>
                </div>

                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#334155",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    transition: "background 0.2s",
                  }}
                >
                  <ExternalLink size={13} color="#18181B" /> View Live Website
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Sub-route Content - Independent Scrollable Area */}
        <main
          style={{
            flex: 1,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "clamp(1rem, 2vw, 2rem)",
            backgroundColor: "#F8FAFC",
            WebkitOverflowScrolling: "touch",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* User Profile & Account Details Modal */}
      {showProfileModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <User size={20} color="#18181B" /> My Account & Profile
                </h3>
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    fontSize: "0.8125rem",
                    color: "#64748B",
                  }}
                >
                  Manage your administrative credentials and personal details.
                </p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {profileStatus && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: profileStatus.success
                    ? "#ECFDF5"
                    : "#FFE4E6",
                  color: profileStatus.success ? "#047857" : "#BE123C",
                  border: `1px solid ${profileStatus.success ? "#A7F3D0" : "#FECDD3"}`,
                }}
              >
                {profileStatus.success && <CheckCircle2 size={16} />}
                {profileStatus.message}
              </div>
            )}

            <form
              onSubmit={handleProfileSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Display / Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    padding: "0.625rem 0.75rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    padding: "0.625rem 0.75rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "#F8FAFC",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748B",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Assigned Role
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "#0F172A",
                      marginTop: "0.15rem",
                    }}
                  >
                    {user?.role}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748B",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Status
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "#047857",
                      marginTop: "0.15rem",
                    }}
                  >
                    Active
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "0.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowPasswordModal(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#49243F",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  <KeyRound size={14} /> Change Password
                </button>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    style={{
                      padding: "0.625rem 1rem",
                      borderRadius: "8px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      color: "#475569",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    style={{
                      padding: "0.625rem 1.25rem",
                      borderRadius: "8px",
                      backgroundColor: "#18181B",
                      border: "1px solid #09090B",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(24, 24, 27, 0.25)",
                    }}
                  >
                    {isSavingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "2rem",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#0F172A",
                }}
              >
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {passwordStatus && (
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  backgroundColor: passwordStatus.success
                    ? "#ECFDF5"
                    : "#FFE4E6",
                  color: passwordStatus.success ? "#047857" : "#BE123C",
                  border: `1px solid ${passwordStatus.success ? "#A7F3D0" : "#FECDD3"}`,
                }}
              >
                {passwordStatus.message}
              </div>
            )}

            <form
              onSubmit={handlePasswordSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    padding: "0.625rem 0.75rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    padding: "0.625rem 0.75rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    padding: "0.625rem 0.75rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "0.75rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    padding: "0.625rem 1rem",
                    borderRadius: "8px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#475569",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass}
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "8px",
                    backgroundColor: "#18181B",
                    border: "1px solid #09090B",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(24, 24, 27, 0.25)",
                  }}
                >
                  {isChangingPass ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
