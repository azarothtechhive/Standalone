import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Users,
  ShieldCheck,
  Workflow,
  Layers,
  Cpu,
} from "lucide-react";
import logoImg from "../../assets/Logo.png";
import { useCMS } from "../../context/CMSContext";
import { getPublicNavigation } from "../../utils/publicNavigation";

export interface SubNavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  isExternal?: boolean;
}

export interface NavItem {
  name: string;
  href: string;
  isExternal?: boolean;
  isActive: (pathname: string) => boolean;
  children?: SubNavItem[];
}

type NavigationLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string;
  external?: boolean;
};

const NavigationLink: React.FC<NavigationLinkProps> = ({
  href,
  external,
  children,
  ...props
}) =>
  external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ) : (
    <Link to={href} {...props}>
      {children}
    </Link>
  );

export const siteNavItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
    isActive: (p) => p === "/",
  },
  {
    name: "Who we are",
    href: "/about",
    isActive: (p) =>
      p.startsWith("/about") ||
      p.startsWith("/values") ||
      p.startsWith("/delivery-framework") ||
      p.startsWith("/who-we-are"),
    children: [
      {
        name: "About Us",
        href: "/about#about-us",
        icon: <Users size={18} style={{ color: "#49243F" }} />,
      },
      {
        name: "Our Values",
        href: "/about#our-values",
        icon: <ShieldCheck size={18} style={{ color: "#49243F" }} />,
      },
      {
        name: "Delivery Framework",
        href: "/about#delivery-framework",
        icon: <Workflow size={18} style={{ color: "#49243F" }} />,
      },
    ],
  },
  {
    name: "Our Portfolio",
    href: "/portfolio",
    isActive: (p) =>
      p.startsWith("/portfolio") ||
      p.startsWith("/products") ||
      p.startsWith("/services") ||
      p.startsWith("/service") ||
      p.startsWith("/projects"),
    children: [
      {
        name: "Explore Products",
        href: "/portfolio#products",
        icon: <Layers size={18} style={{ color: "#49243F" }} />,
      },
      {
        name: "Explore Services",
        href: "/portfolio#services",
        icon: <Cpu size={18} style={{ color: "#49243F" }} />,
      },
    ],
  },
  {
    name: "Resource Hub",
    href: "/resource-hub",
    isActive: (p) =>
      p.startsWith("/resource-hub") ||
      p.startsWith("/technology-insights") ||
      p.startsWith("/insights"),
  },
  {
    name: "Testimonials",
    href: "/testimonials",
    isActive: (p) => p.startsWith("/testimonials"),
  },
  {
    name: 'Connect With Us',
    href: '/connect-with-us',
    isActive: (p) =>
      p.startsWith('/connect-with-us') ||
      p === '/contact' ||
      p === '/connect',
  },
];

const CRIMSON_DEEP = "#49243F";
const CRIMSON_VIBRANT = "#49243F";
const CRIMSON_ACCENT = "#49243F";

const getStartedButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.4rem",
  borderRadius: "9999px",
  background: "var(--gradient-button)",
  color: "#FFFFFF",
  fontWeight: 600,
  fontSize: "0.9375rem",
  textDecoration: "none",
  border: "none",
  boxShadow: "0 4px 14px 0 rgba(73, 36, 63, 0.35)",
  transition: "all 200ms ease-out",
};

export const Header: React.FC = () => {
  const { settings, navigation } = useCMS();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>(
    {
      "Who we are": false,
      "Our Portfolio": false,
    },
  );

  const location = useLocation();
  const publicNavItems = useMemo(
    () => getPublicNavigation(navigation, siteNavItems),
    [navigation],
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ignore the legacy "/Logo.png" override so the bundled brand logo is used.
  const cmsLogo = settings?.logoUrl;
  const brandIcon =
    cmsLogo && cmsLogo !== "/logo-footer.png" && cmsLogo !== "/Logo.png"
      ? cmsLogo
      : logoImg;

  const companyName = settings?.companyName || "Azaroth Tech-Hive";
  const companyParts = companyName.trim().split(/\s+/);
  const brandPrimary = companyParts[0]?.toUpperCase() || "AZAROTH";
  const brandSecondary =
    companyParts.slice(1).join(" ")?.toUpperCase() ||
    (companyParts.length > 1 ? "" : "TECH-HIVE");

  const headerCtaText = settings?.headerConfig?.ctaText || "Connect With Us";
  const headerCtaLink = settings?.headerConfig?.ctaLink || "/connect-with-us";

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Close the mobile drawer when the viewport grows to desktop.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const toggleMobileAccordion = (name: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        width: "100%",
        backgroundColor: isScrolled
          ? "rgba(255, 255, 255, 0.98)"
          : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid var(--color-border, #E4E4E7)`,
        boxShadow: isScrolled
          ? "0 4px 20px -2px rgba(73, 36, 63, 0.08)"
          : "none",
        transition: "all 200ms ease-out",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(0.5rem, 2vw, 1rem)",
          height: "clamp(3.5rem, 5vw, 4.75rem)",
          minHeight: "3.5rem",
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          id="nav-brand-logo"
          aria-label={`${companyName} home`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(0.5rem, 2vw, 0.75rem)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <img
            src={brandIcon}
            alt={settings?.companyName || "Azaroth Tech-Hive Logo"}
            className="header-brand-logo"
            style={{
              maxHeight: "clamp(3.5rem, 6vw, 2.5rem)",
              maxWidth: "clamp(6rem, 15vw, 8rem)",
              objectFit: "contain",
              flexShrink: 0,
              filter: "drop-shadow(0 2px 4px rgba(73, 36, 63, 0.15))",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              className="header-brand-name"
              style={{
                fontSize: "clamp(1rem, 3vw, 1rem)",
                fontWeight: 700,
                color: "var(--color-primary, #49243F)",
                fontFamily: "serif",
                letterSpacing: "0.04em",
                lineHeight: 1.1,
              }}
            >
              {brandPrimary}
            </span>

            {brandSecondary && (
              <span
                className="header-brand-sub"
                style={{
                  fontSize: "clamp(0.5rem, 1.5vw, 0.625rem)",
                  fontWeight: 600,
                  color: "var(--color-brand-gold, #C99B52)",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                }}
              >
                {brandSecondary}
              </span>
            )}
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex flex-1 items-center justify-end gap-2 lg:gap-4"
        >
          {publicNavItems.map((item) => {
            const active = item.isActive(location.pathname);
            const isDropdownOpen = activeDropdown === item.name;

            if (item.children && item.children.length > 0) {
              return (
                <div
                  key={item.name}
                  style={{ position: "relative" }}
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div style={{ display: "inline-flex", alignItems: "center" }}>
                    <NavigationLink
                      href={item.href}
                      external={item.isExternal}
                      aria-current={active ? "page" : undefined}
                      aria-haspopup="true"
                      aria-expanded={isDropdownOpen}
                      style={{
                        fontSize: "clamp(0.8125rem, 1.5vw, 0.9375rem)",
                        fontWeight: active ? 600 : 500,
                        color: active ? CRIMSON_DEEP : "#374151",
                        padding: "clamp(0.5rem, 1vw, 0.65rem) 0.25rem",
                        textDecoration: "none",
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "clamp(0.25rem, 0.5vw, 0.35rem)",
                        transition: "color 160ms ease-out",
                      }}
                      className="azaroth-nav-link"
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        size={15}
                        style={{
                          transition: "transform 200ms ease-out",
                          transform: isDropdownOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          color: active ? CRIMSON_VIBRANT : "#64748B",
                        }}
                      />

                      {/* Active indicator bar */}
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          left: 0,
                          right: 0,
                          height: "2.5px",
                          background: "#C99B52",
                          borderRadius: "2px",
                          transform: active ? "scaleX(1)" : "scaleX(0)",
                          transformOrigin: "left",
                          transition: "transform 200ms ease-out",
                        }}
                        className="azaroth-nav-indicator"
                      />
                    </NavigationLink>
                  </div>

                  {/* Dropdown Menu Overlay */}
                  {isDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: item.name === "Our Portfolio" ? "-1.5rem" : "0",
                        paddingTop: "0.65rem",
                        zIndex: 110,
                        minWidth: "clamp(18rem, 40vw, 22rem)",
                        maxWidth: "min(90vw, 22rem)",
                      }}
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderRadius: "1rem",
                          border: "1px solid #E4E4E7",
                          boxShadow:
                            "0 20px 40px -15px rgba(73, 36, 63, 0.15), 0 0 0 1px rgba(0,0,0,0.03)",
                          padding: "0.65rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.2rem",
                          backdropFilter: "blur(20px)",
                        }}
                        className="azaroth-dropdown-menu"
                      >
                        {item.children.map((sub) => {
                          const isSubActive =
                            location.pathname === sub.href ||
                            (sub.href.includes("#") &&
                              location.pathname === sub.href.split("#")[0] &&
                              (location.hash === `#${sub.href.split("#")[1]}` ||
                                (!location.hash &&
                                  sub.href.endsWith("#about-us"))));
                          return (
                            <NavigationLink
                              key={sub.name}
                              href={sub.href}
                              external={sub.isExternal}
                              onClick={() => {
                                setActiveDropdown(null);
                                if (sub.href.includes("#")) {
                                  const [targetPath, hash] =
                                    sub.href.split("#");
                                  if (location.pathname === targetPath) {
                                    const elem = document.getElementById(hash);
                                    if (elem) {
                                      elem.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                      window.history.pushState(
                                        null,
                                        "",
                                        `#${hash}`,
                                      );
                                    }
                                  }
                                }
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "0.8rem 0.85rem",
                                minHeight: "3.25rem",
                                boxSizing: "border-box",
                                borderRadius: "0.625rem",
                                textDecoration: "none",
                                backgroundColor: isSubActive
                                  ? "rgba(73, 36, 63, 0.08)"
                                  : "transparent",
                                transition: "background-color 160ms ease-out",
                              }}
                              className="azaroth-dropdown-item"
                            >
                              <div
                                style={{
                                  width: "2.25rem",
                                  height: "2.25rem",
                                  borderRadius: "8px",
                                  backgroundColor: isSubActive
                                    ? "rgba(73, 36, 63, 0.16)"
                                    : "#FDF2F4",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {sub.icon || <Layers size={18} style={{ color: "#49243F" }} />}
                              </div>
                              <span
                                style={{
                                  fontSize: "0.9rem",
                                  fontWeight: 600,
                                  color: isSubActive ? CRIMSON_DEEP : "#18181B",
                                  lineHeight: 1.4,
                                }}
                                className="dropdown-item-title"
                              >
                                {sub.name}
                              </span>
                            </NavigationLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavigationLink
                key={item.name}
                href={item.href}
                external={item.isExternal}
                aria-current={active ? "page" : undefined}
                style={{
                  fontSize: "clamp(0.8125rem, 1.5vw, 0.9375rem)",
                  fontWeight: active ? 600 : 500,
                  color: active ? CRIMSON_DEEP : "#374151",
                  padding: "clamp(0.5rem, 1vw, 0.65rem) 0.25rem",
                  textDecoration: "none",
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  transition: "color 160ms ease-out",
                }}
                className="azaroth-nav-link"
              >
                <span>{item.name}</span>

                {/* Gold navigation indicator */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    left: 0,
                    right: 0,
                    height: "2.5px",
                    background: "#C99B52",
                    borderRadius: "2px",
                    transform: active ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 200ms ease-out",
                  }}
                  className="azaroth-nav-indicator"
                />
              </NavigationLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(0.5rem, 1.5vw, 0.875rem)",
            flexShrink: 0,
          }}
        >
          <Link
            to={headerCtaLink}
            style={{
              ...getStartedButtonStyle,
              padding: "clamp(0.5rem, 1.2vw, 0.625rem) clamp(1rem, 2.5vw, 1.4rem)",
              fontSize: "clamp(0.8125rem, 1.5vw, 0.9375rem)",
            }}
            className="hidden sm:flex header-connect-cta hover:opacity-95 hover:shadow-lg hover:scale-105"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gradient-button-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--gradient-button)";
            }}
          >
            <span>{headerCtaText}</span>
            <ArrowRight size={15} />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "clamp(2rem, 5vw, 2.5rem)",
              height: "clamp(2rem, 5vw, 2.5rem)",
              borderRadius: "0.75rem",
              border: "1px solid #FECDD3",
              backgroundColor: "#FFFFFF",
              color: "#49243F",
              cursor: "pointer",
              transition: "all 200ms ease-out",
              minWidth: "2rem",
              minHeight: "2rem",
            }}
            className="flex lg:hidden"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(73, 36, 63, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            style={{
              position: "fixed",
              inset: 0,
              top: "clamp(3.5rem, 5vw, 4.75rem)",
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(31, 41, 55, 0.5)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              overscrollBehavior: "contain",
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
          <nav
            id="mobile-navigation"
            aria-label="Mobile Navigation"
            style={{
              backgroundColor: "#FFFFFF",
              padding: "clamp(1rem, 3vw, 1.5rem) clamp(0.75rem, 2vw, 1.25rem)",
              borderBottom: `2px solid ${CRIMSON_VIBRANT}`,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              maxHeight: "calc(100vh - clamp(3.5rem, 5vw, 4.75rem))",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              position: "relative",
              zIndex: 10000,
              color: "#1F2937",
              width: "100%",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {publicNavItems.map((item) => {
              const active = item.isActive(location.pathname);
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = mobileExpanded[item.name];

              if (hasChildren) {
                return (
                  <div
                    key={item.name}
                    style={{ display: "flex", flexDirection: "column", color: "#1F2937" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "clamp(0.75rem, 2vw, 0.875rem) clamp(0.75rem, 2vw, 1rem)",
                        borderRadius: "8px",
                        backgroundColor: active
                          ? "rgba(73, 36, 63, 0.06)"
                          : "transparent",
                        borderLeft: active
                          ? `3px solid ${CRIMSON_ACCENT}`
                          : "3px solid transparent",
                      }}
                    >
                      <NavigationLink
                        href={item.href}
                        external={item.isExternal}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          fontWeight: active ? 600 : 500,
                          fontSize: "clamp(0.9375rem, 2vw, 1rem)",
                          color: active ? CRIMSON_DEEP : "#1F2937",
                          textDecoration: "none",
                          flex: 1,
                          position: "relative",
                          zIndex: 1,
                          display: "block",
                        }}
                      >
                        {item.name}
                      </NavigationLink>
                      <button
                        type="button"
                        onClick={() => toggleMobileAccordion(item.name)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "0.25rem 0.5rem",
                          cursor: "pointer",
                          color: "#64748B",
                          display: "flex",
                          alignItems: "center",
                          position: "relative",
                          zIndex: 1,
                        }}
                        aria-label={`Toggle ${item.name} submenu`}
                      >
                        <ChevronDown
                          size={18}
                          style={{
                            transition: "transform 200ms ease-out",
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        />
                      </button>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.25rem",
                          paddingLeft: "clamp(1rem, 2.5vw, 1.25rem)",
                          paddingTop: "0.35rem",
                          paddingBottom: "0.35rem",
                          borderLeft: "2px dashed #FECDD3",
                          marginLeft: "clamp(1rem, 2.5vw, 1.25rem)",
                          position: "relative",
                          zIndex: 1,
                          color: "#1F2937",
                        }}
                      >
                        {item.children?.map((sub) => {
                          const isSubActive =
                            location.pathname === sub.href ||
                            (sub.href.includes("#") &&
                              location.pathname === sub.href.split("#")[0] &&
                              (location.hash === `#${sub.href.split("#")[1]}` ||
                                (!location.hash &&
                                  sub.href.endsWith("#about-us"))));
                          return (
                            <NavigationLink
                              key={sub.name}
                              href={sub.href}
                              external={sub.isExternal}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                if (sub.href.includes("#")) {
                                  const [targetPath, hash] =
                                    sub.href.split("#");
                                  if (location.pathname === targetPath) {
                                    const elem = document.getElementById(hash);
                                    if (elem) {
                                      elem.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                      window.history.pushState(
                                        null,
                                        "",
                                        `#${hash}`,
                                      );
                                    }
                                  }
                                }
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "clamp(0.5rem, 1.5vw, 0.75rem)",
                                padding: "clamp(0.625rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)",
                                borderRadius: "8px",
                                textDecoration: "none",
                                backgroundColor: isSubActive
                                  ? "rgba(73, 36, 63, 0.08)"
                                  : "transparent",
                                transition: "background-color 160ms ease-out",
                                position: "relative",
                                zIndex: 1,
                              }}
                            >
                              <div
                                style={{
                                  width: "clamp(1.75rem, 4vw, 2rem)",
                                  height: "clamp(1.75rem, 4vw, 2rem)",
                                  borderRadius: "8px",
                                  backgroundColor: isSubActive
                                    ? "rgba(73, 36, 63, 0.16)"
                                    : "#FDF2F4",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {sub.icon || <Layers size={18} style={{ color: "#49243F" }} />}
                              </div>
                              <span
                                style={{
                                  fontSize: "clamp(0.875rem, 2vw, 0.9rem)",
                                  fontWeight: 600,
                                  color: isSubActive ? CRIMSON_DEEP : "#18181B",
                                  lineHeight: 1.4,
                                }}
                              >
                                {sub.name}
                              </span>
                            </NavigationLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavigationLink
                  key={item.name}
                  href={item.href}
                  external={item.isExternal}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontWeight: active ? 600 : 500,
                    fontSize: "clamp(0.9375rem, 2vw, 1rem)",
                    color: active ? CRIMSON_DEEP : "#1F2937",
                    textDecoration: "none",
                    padding: "clamp(0.75rem, 2vw, 0.875rem) clamp(0.75rem, 2vw, 1rem)",
                    borderRadius: "8px",
                    backgroundColor: active
                      ? "rgba(73, 36, 63, 0.06)"
                      : "transparent",
                    borderLeft: active
                      ? `3px solid ${CRIMSON_ACCENT}`
                      : "3px solid transparent",
                    position: "relative",
                    zIndex: 1,
                    display: "block",
                  }}
                >
                  {item.name}
                </NavigationLink>
              );
            })}

            <div
              style={{
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <Link
                to={headerCtaLink}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  ...getStartedButtonStyle,
                  width: "100%",
                  boxSizing: "border-box",
                }}
                className="hover:opacity-90"
              >
                <span>{headerCtaText}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </nav>
        </div>,
          document.body,
        )}

      {/* Theme-matched hover and keyboard focus styles */}
      <style>{`
        @media (min-width: 1024px) {
          div[role="dialog"][aria-label="Mobile navigation menu"],
          #mobile-navigation {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .header-connect-cta {
            display: none !important;
          }

          .header-brand-logo {
            max-height: 2.25rem !important;
          }

          .header-brand-name {
            font-size: 1.0625rem !important;
          }

          .header-brand-sub {
            font-size: 0.5625rem !important;
            letter-spacing: 0.16em !important;
          }
        }

        .azaroth-nav-link:hover {
          color: ${CRIMSON_DEEP} !important;
        }

        .azaroth-nav-link:hover .azaroth-nav-indicator {
          transform: scaleX(1) !important;
        }

        .azaroth-dropdown-item:hover {
          background-color: rgba(73, 36, 63, 0.08) !important;
        }

        .azaroth-dropdown-item:hover .dropdown-item-title {
          color: ${CRIMSON_ACCENT} !important;
        }

        .azaroth-nav-link:focus-visible,
        .azaroth-rfq-button:focus-visible {
          outline: 3px solid ${CRIMSON_DEEP};
          outline-offset: 4px;
        }

        @media (prefers-reduced-motion: reduce) {
          .azaroth-nav-link,
          .azaroth-nav-indicator,
          .azaroth-dropdown-menu {
            transition: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
