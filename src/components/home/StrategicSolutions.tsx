import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import {
  ecommercePlatformImg,
  mobileBankingAppImg,
  analyticsDashboardImg,
  creativePortfolioImg,
} from "../../assets/images";
import { useCMS } from "../../context/CMSContext";

interface ProjectItem {
  id: string;
  title: string;
  categories: string;
  image: string;
  description: string;
  link: string;
}

const defaultProjects: ProjectItem[] = [
  {
    id: "e-commerce-platform",
    title: "E-Commerce Platform",
    categories: "Web Development \u00B7 E-Commerce",
    image: ecommercePlatformImg,
    description:
      "High-concurrency headless digital storefront with sub-second checkout and real-time inventory synchronization.",
    link: "/portfolio#products",
  },
  {
    id: "mobile-banking-app",
    title: "Mobile Banking App",
    categories: "Mobile Apps \u00B7 Fintech",
    image: mobileBankingAppImg,
    description:
      "Biometric-secured iOS and Android banking app featuring instant payments, budget analytics, and multi-currency accounts.",
    link: "/portfolio#services",
  },
  {
    id: "analytics-dashboard",
    title: "Analytics Dashboard",
    categories: "Web App \u00B7 Business Intelligence",
    image: analyticsDashboardImg,
    description:
      "Real-time telemetry and executive data warehouse dashboard processing millions of events per minute.",
    link: "/portfolio#services",
  },
  {
    id: "creative-portfolio",
    title: "Creative Portfolio",
    categories: "UI/UX Design \u00B7 Branding",
    image: creativePortfolioImg,
    description:
      "Bespoke design portfolio and digital asset exhibition engineered with fluid micro-interactions and spatial design.",
    link: "/portfolio#services",
  },
];

const AUTOPLAY_INTERVAL = 3000; // 3 seconds (configurable 3-5 seconds)

export const StrategicSolutions: React.FC = () => {
  const { pages, portfolio: cmsPortfolio } = useCMS();
  const featuredSection = pages["home"]?.featuredProjectsSection || {};
  const sectionTitle = featuredSection.title || "Featured";
  const sectionTitleHighlight = featuredSection.titleHighlight || "Projects";
  const sectionSubtitle =
    featuredSection.subtitle ||
    "Explore some of our latest projects and see how we turn ideas into impactful digital solutions.";

  const fallbackImages = [
    ecommercePlatformImg,
    mobileBankingAppImg,
    analyticsDashboardImg,
    creativePortfolioImg,
  ];

  const projects: ProjectItem[] = useMemo(() => {
    const rawSlides = featuredSection.slides;
    if (Array.isArray(rawSlides) && rawSlides.length > 0) {
      return rawSlides.map((s: any, idx: number) => ({
        id: s.id || `proj-${idx}`,
        title: s.title || defaultProjects[idx % defaultProjects.length].title,
        categories: Array.isArray(s.categories)
          ? s.categories.join(" \u00B7 ")
          : s.categories ||
            defaultProjects[idx % defaultProjects.length].categories,
        image:
          s.image || fallbackImages[idx % fallbackImages.length],
        description:
          s.description ||
          defaultProjects[idx % defaultProjects.length].description,
        link: s.link || (s.slug ? `/portfolio/${s.slug}` : "/portfolio"),
      }));
    }

    if (Array.isArray(cmsPortfolio) && cmsPortfolio.length > 0) {
      return cmsPortfolio.map((p, idx) => ({
        id: p.id || `proj-${idx}`,
        title: p.name || p.title || defaultProjects[idx % defaultProjects.length].title,
        categories: p.category || p.industry || defaultProjects[idx % defaultProjects.length].categories,
        image: p.coverImage || fallbackImages[idx % fallbackImages.length],
        description: p.summary || defaultProjects[idx % defaultProjects.length].description,
        link: `/portfolio/${p.slug || p.id}`,
      }));
    }

    return defaultProjects;
  }, [featuredSection.slides, cmsPortfolio]);

  const TOTAL_PROJECTS = projects.length || 1;
  const extendedProjects = useMemo(
    () => [
      ...projects,
      ...projects,
      ...projects,
      ...projects,
      ...projects,
    ],
    [projects],
  );

  // Start at index TOTAL_PROJECTS * 2 (the beginning of the middle project set in a 5-set loop)
  const [displayIndex, setDisplayIndex] = useState(TOTAL_PROJECTS * 2);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Math.min(window.innerWidth - 64, 1200);
    }
    return 1200;
  });

  const isAnimating = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Active dot index synchronized with currently displayed lead project
  const currentIndex =
    ((displayIndex % TOTAL_PROJECTS) + TOTAL_PROJECTS) % TOTAL_PROJECTS;

  // Reduced motion preference detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Responsive container width tracking via ResizeObserver
  useEffect(() => {
    const updateWidth = () => {
      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setContainerWidth(rect.width);
        }
      }
    };

    updateWidth();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && viewportRef.current) {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            setContainerWidth(entry.contentRect.width);
          }
        }
      });
      ro.observe(viewportRef.current);
    }

    window.addEventListener("resize", updateWidth);
    window.addEventListener("orientationchange", updateWidth);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", updateWidth);
      window.removeEventListener("orientationchange", updateWidth);
    };
  }, []);

  // Responsive dimensions for Center-Focus Coverflow
  const getSliderMetrics = (width: number) => {
    if (width < 640) {
      return { cardWidth: Math.min(width * 0.82, 330), gapPx: 16 };
    }
    if (width < 1024) {
      return { cardWidth: Math.min(width * 0.55, 420), gapPx: 22 };
    }
    // Desktop: center card takes ~44% width (max 490px), leaving side cards nicely visible
    return { cardWidth: Math.min(Math.max(width * 0.44, 400), 490), gapPx: 28 };
  };

  const { cardWidth, gapPx } = getSliderMetrics(containerWidth);

  // Exact center offset: translates track so card[displayIndex] is perfectly centered horizontally
  const centerShift = (containerWidth - cardWidth) / 2;
  const offsetPx = displayIndex * (cardWidth + gapPx) - centerShift;

  // Re-enable CSS transitions on next frame after instant boundary snap
  useEffect(() => {
    if (!isTransitioning) {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [isTransitioning]);

  // Safety unlock in case onTransitionEnd doesn't fire
  useEffect(() => {
    if (isAnimating.current) {
      const timer = setTimeout(() => {
        isAnimating.current = false;
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [displayIndex]);

  // Handle instant boundary snap when transitions complete across the 5 clone sets
  const handleTransitionEnd = () => {
    isAnimating.current = false;
    setDisplayIndex((prev) => {
      if (prev >= TOTAL_PROJECTS * 3) {
        setIsTransitioning(false);
        return prev - TOTAL_PROJECTS;
      }
      if (prev < TOTAL_PROJECTS * 2) {
        setIsTransitioning(false);
        return prev + TOTAL_PROJECTS;
      }
      return prev;
    });
  };

  // Immediate snap when reduced motion is preferred
  useEffect(() => {
    if (prefersReducedMotion) {
      isAnimating.current = false;
      setDisplayIndex((prev) => {
        if (prev >= TOTAL_PROJECTS * 3) return prev - TOTAL_PROJECTS;
        if (prev < TOTAL_PROJECTS * 2) return prev + TOTAL_PROJECTS;
        return prev;
      });
    }
  }, [displayIndex, prefersReducedMotion]);

  // Next Slide
  const nextSlide = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setIsTransitioning(true);
    setDisplayIndex((prev) => prev + 1);
  }, []);

  // Previous Slide
  const prevSlide = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setIsTransitioning(true);
    setDisplayIndex((prev) => prev - 1);
  }, []);

  // Direct Pagination Dot Navigation
  const goToSlide = useCallback((targetIdx: number) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setIsTransitioning(true);
    setDisplayIndex(TOTAL_PROJECTS * 2 + targetIdx);
  }, []);

  // Autoplay with pause-on-hover & reduced motion support
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, nextSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section
      id="projects"
      style={{
        backgroundColor: "#F8FAFC",
        paddingTop: "5.5rem",
        paddingBottom: "5.5rem",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Featured Projects"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textAlign: "left",
            maxWidth: "1080px",
            margin: "0 0 3.25rem 0",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3.2vw, 2.25rem)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                background: "var(--gradient-heading)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
            >
              {sectionTitle} {sectionTitleHighlight}
            </span>
          </h2>

          <p
            style={{
              fontSize: "1.0625rem",
              color: "#64748B",
              lineHeight: 1.6,
              width: "100%",
              maxWidth: "none",
              margin: 0,
              boxSizing: "border-box",
            }}
          >
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* Slider Outer Wrapper */}
        <div
          style={{
            position: "relative",
            width: "100%",
          }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured Projects Slider"
        >
          {/* Manual Left Arrow Button */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Project"
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              width: "2.75rem",
              height: "2.75rem",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 6px 16px rgba(73, 36, 63, 0.08)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#1E293B",
              transition: "all 200ms ease-out",
            }}
            className="slider-nav-btn slider-nav-btn-prev lg:flex"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Manual Right Arrow Button */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Project"
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              width: "2.75rem",
              height: "2.75rem",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 6px 16px rgba(73, 36, 63, 0.08)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#1E293B",
              transition: "all 200ms ease-out",
            }}
            className="slider-nav-btn slider-nav-btn-next lg:flex"
          >
            <ChevronRight size={20} />
          </button>

          {/* Slider Viewport (overflow hidden, touch enabled) */}
          <div
            ref={viewportRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              overflow: "hidden",
              width: "100%",
              paddingTop: "2.5rem",
              paddingBottom: "2.5rem",
              marginTop: "-1.5rem",
              marginBottom: "-1.5rem",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Sliding Track */}
            <div
              onTransitionEnd={handleTransitionEnd}
              style={{
                display: "flex",
                gap: `${gapPx}px`,
                transform: `translate3d(-${offsetPx}px, 0, 0)`,
                transition: prefersReducedMotion
                  ? "none"
                  : isTransitioning
                    ? "transform 360ms cubic-bezier(0.16, 1, 0.3, 1)"
                    : "none",
                willChange: "transform",
                alignItems: "center",
              }}
            >
              {extendedProjects.map((proj, extendedIdx) => {
                const isCurrent = extendedIdx === displayIndex;
                const distFromActive = Math.abs(extendedIdx - displayIndex);

                // Coverflow Zoom & Depth Scaling
                const cardScale = isCurrent
                  ? 1.08
                  : distFromActive === 1
                    ? 0.88
                    : 0.82;

                const cardOpacity = isCurrent
                  ? 1
                  : distFromActive === 1
                    ? 0.68
                    : 0.35;

                const cardZIndex = isCurrent
                  ? 15
                  : distFromActive === 1
                    ? 5
                    : 1;

                return (
                  <div
                    key={`${proj.id}-${extendedIdx}`}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${proj.title} (${(extendedIdx % TOTAL_PROJECTS) + 1} of ${TOTAL_PROJECTS})`}
                    onClick={() => {
                      if (!isCurrent) {
                        if (isAnimating.current) return;
                        isAnimating.current = true;
                        setIsTransitioning(true);
                        setDisplayIndex(extendedIdx);
                      }
                    }}
                    style={{
                      flex: `0 0 ${cardWidth}px`,
                      width: `${cardWidth}px`,
                      maxWidth: `${cardWidth}px`,
                      boxSizing: "border-box",
                      transform: prefersReducedMotion
                        ? "none"
                        : `scale(${cardScale})`,
                      transformOrigin: "center center",
                      opacity: prefersReducedMotion ? 1 : cardOpacity,
                      zIndex: cardZIndex,
                      transition: prefersReducedMotion
                        ? "none"
                        : isTransitioning
                          ? "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 360ms cubic-bezier(0.16, 1, 0.3, 1)"
                          : "none",
                      cursor: isCurrent ? "default" : "pointer",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "1.25rem",
                        overflow: "hidden",
                        border: isCurrent
                          ? "2px solid rgba(73, 36, 63, 0.5)"
                          : "1px solid rgba(226, 232, 240, 0.85)",
                        boxShadow: isCurrent
                          ? "0 20px 42px -10px rgba(73, 36, 63, 0.22), 0 8px 20px -4px rgba(15, 23, 42, 0.1)"
                          : "0 4px 14px -2px rgba(15, 23, 42, 0.05)",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        position: "relative",
                        transition: prefersReducedMotion
                          ? "none"
                          : "box-shadow 360ms ease, border-color 360ms ease",
                      }}
                      className={isCurrent ? "group" : "hover:opacity-90 group"}
                    >
                      {/* Active Indicator Top Tag */}
                      {isCurrent && (
                        <div
                          style={{
                            position: "absolute",
                            top: "0.85rem",
                            left: "0.85rem",
                            zIndex: 10,
                            background: "#49243F",
                            color: "#FFFFFF",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            padding: "0.25rem 0.75rem",
                            borderRadius: "9999px",
                            boxShadow: "0 2px 10px rgba(73, 36, 63, 0.4)",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                          }}
                        >
                          Featured Now
                        </div>
                      )}

                      {/* Image Container with 16:9 ratio */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "200px",
                          overflow: "hidden",
                          backgroundColor: "#0F172A",
                        }}
                      >
                        <img
                          src={proj.image}
                          alt={proj.title}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 350ms ease-out",
                          }}
                          className="group-hover:scale-105"
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to top, rgba(15, 23, 42, 0.35) 0%, transparent 60%)",
                            pointerEvents: "none",
                          }}
                        />
                      </div>

                      {/* Card Content */}
                      <div
                        style={{
                          padding: "1.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flex: 1,
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              fontSize: isCurrent ? "1.2rem" : "1.0625rem",
                              fontWeight: 600,
                              color: "#1E293B",
                              marginBottom: "0.35rem",
                              transition: "font-size 300ms ease",
                            }}
                          >
                            {proj.title}
                          </h3>
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              color: "#49243F",
                              fontWeight: 600,
                              margin: 0,
                            }}
                          >
                            {proj.categories}
                          </p>
                        </div>

                        {/* Circular Arrow Button with Crimson Gradient Hover */}
                        <Link
                          to={proj.link}
                          state={{ from: '/' }}
                          aria-label={`View ${proj.title}`}
                          style={{
                            width: "2.35rem",
                            height: "2.35rem",
                            borderRadius: "50%",
                            backgroundColor: isCurrent ? "#49243F" : "#F4F4F5",
                            color: isCurrent ? "#FFFFFF" : "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 200ms ease-out",
                            textDecoration: "none",
                            boxShadow: isCurrent
                              ? "0 4px 12px rgba(73, 36, 63, 0.35)"
                              : "none",
                          }}
                          className="slider-card-action hover:scale-110"
                        >
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* View All Projects Button */}
        {/* <div style={{ textAlign: "center", marginTop: "2.75rem" }}>
          <Link
            to="/portfolio"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.85rem 1.85rem",
              borderRadius: "9999px",
              border: "1.5px solid #49243F",
              color: "#49243F",
              backgroundColor: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
              transition: "all 200ms ease-out",
              boxShadow: "0 2px 8px rgba(73, 36, 63, 0.04)",
            }}
            className="hover:bg-rose-50 hover:border-rose-700 hover:text-rose-800 hover:shadow-md"
          >
            <span>Explore All Projects &amp; Platforms</span>
            <ArrowRight size={16} />
          </Link>
        </div> */}
      </div>

      <style>{`
        .slider-nav-btn:hover {
          background: #49243F !important;
          color: #FFFFFF !important;
          border-color: #49243F !important;
          box-shadow: 0 6px 20px rgba(73, 36, 63, 0.35) !important;
          transform: translateY(-50%) scale(1.08) !important;
        }
        .slider-card-action:hover {
          background: #49243F !important;
          color: #FFFFFF !important;
          box-shadow: 0 4px 14px rgba(73, 36, 63, 0.4) !important;
        }
        @media (max-width: 639px) {
          .slider-nav-btn-prev {
            left: 0.25rem !important;
          }
          .slider-nav-btn-next {
            right: 0.25rem !important;
          }
        }
        @media (min-width: 640px) {
          .slider-nav-btn-prev {
            left: 0.25rem !important;
          }
          .slider-nav-btn-next {
            right: 0.25rem !important;
          }
        }
        @media (max-width: 767px) {
          .slider-nav-btn {
            width: 2.25rem !important;
            height: 2.25rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default StrategicSolutions;
