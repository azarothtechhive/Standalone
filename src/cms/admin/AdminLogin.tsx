// src/pages/admin/AdminLogin.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Database,
  Loader2,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useCMS } from "../CMSContext";
import logoImg from "../../assets/Logo.png";

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAdminAuth();
  const { settings } = useCMS();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const reason = searchParams.get('reason');
    if (reason === 'session_expired') {
      setInfoMessage('Your CMS session has expired due to inactivity. Please log in again.');
    } else if (reason === 'logged_out') {
      setInfoMessage('You have been logged out successfully.');
    }
  }, [location.search]);

  // If already logged in, redirect to admin dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      const destination = (location.state as any)?.from?.pathname || "/admin";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      const destination = (location.state as any)?.from?.pathname || "/admin";
      navigate(destination, { replace: true });
    } else {
      setErrorMessage(res.message || "Invalid email or password.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
        backgroundImage:
          "radial-gradient(ellipse at 50% 15%, rgba(24, 24, 27, 0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 85%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)",
        padding: "2rem 1rem",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        color: "#0F172A",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Grid Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          padding: "2.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img
            src={settings?.logoUrl || logoImg}
            alt="Azaroth Tech-Hive"
            style={{
              height: "46px",
              maxWidth: "160px",
              margin: "0 auto 1rem",
              objectFit: "contain",
            }}
          />
          {/* <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F4F4F5', border: '1px solid #E4E4E7', padding: '0.25rem 0.75rem', borderRadius: '9999px', marginBottom: '0.75rem' }}>
            <Shield size={14} color="#18181B" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#18181B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Mission Control CMS
            </span>
          </div> */}
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#0F172A",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Azaroth Content Portal
          </h1>
        </div>

        {/* Informational / Session Expired Alert */}
        {infoMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              backgroundColor: "#FEF3C7",
              border: "1px solid #FDE68A",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              color: "#92400E",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              backgroundColor: "#FFE4E6",
              border: "1px solid #FECDD3",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              color: "#BE123C",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "0.5rem",
              }}
            >
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                color="#64748B"
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem 0.75rem 2.75rem",
                  color: "#0F172A",
                  fontSize: "0.9375rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#18181B")}
                onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "0.5rem",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                color="#64748B"
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem 0.75rem 2.75rem",
                  color: "#0F172A",
                  fontSize: "0.9375rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#18181B")}
                onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.8125rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#475569",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#18181B", cursor: "pointer" }}
              />
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              width: "100%",
              backgroundColor: "#18181B",
              backgroundImage:
                "linear-gradient(135deg, #18181B 0%, #27272A 100%)",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.9375rem",
              padding: "0.875rem",
              borderRadius: "8px",
              border: "1px solid #09090B",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(24, 24, 27, 0.25)",
              transition: "all 0.2s ease",
              marginTop: "0.5rem",
            }}
            onMouseEnter={(e) =>
              !isLoading && (e.currentTarget.style.backgroundColor = "#27272A")
            }
            onMouseLeave={(e) =>
              !isLoading && (e.currentTarget.style.backgroundColor = "#18181B")
            }
          >
            {isLoading ? (
              <>
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#FFFFFF",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Authenticating...
              </>
            ) : (
              <>
                Access CMS Control Center
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Back to public site */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a
            href="/"
            style={{
              fontSize: "0.8125rem",
              color: "#64748B",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#18181B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
          >
            Return to public website
          </a>
        </div>
      </motion.div>
    </div>
  );
};
