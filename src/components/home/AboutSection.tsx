import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { heroWorkspaceImg } from "../../assets/images";
import { useCMS } from "../../context/CMSContext";

export const AboutSection: React.FC = () => {
  const { pages } = useCMS();
  const aboutSection = pages["home"]?.aboutSection || {};
  const titlePart1 = aboutSection.title || "Turning Ideas into";
  const titleHighlight = aboutSection.titleHighlight || "Digital Reality";
  const paragraph1 =
    aboutSection.description ||
    "Azaroth Tech-Hive delivers practical software engineering solutions that help businesses overcome technical challenges, improve operations, and transform ideas into dependable digital products. We support the software lifecycle, from requirements analysis and solution design to application development, integration, and modernisation.";
  const paragraph2 =
    aboutSection.description2 ||
    "Each stage focuses on business objectives, engineering quality, and practical outcomes. We prioritise reliability, security, performance, usability, and maintainability, delivering lasting value without unnecessary complexity. Whether developing new applications or enhancing existing systems, we help businesses leverage technology effectively and prepare for future growth.";
  const workspaceImg = aboutSection.imageUrl || heroWorkspaceImg;
  const workspaceAlt = aboutSection.imageAlt || "Azaroth Tech-Hive Engineering Team";
  const workspaceFit = (aboutSection.imageFit as any) || "cover";

  const imageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = imageRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="who-we-are"
      style={{
        backgroundColor: "#FFFFFF",
        paddingTop: "3.5rem",
        paddingBottom: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Who We Are"
    >
      <div className="container">
        {/* Main About Section */}
        <div
          className="about-home-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "clamp(2rem, 5vw, 4rem)",
            alignItems: "center",
            marginBottom: "4.5rem",
          }}
        >
          {/* Workspace Image */}
          <div style={{ position: "relative", minWidth: 0 }}>
            <div
              ref={imageRef}
              className={`hero-workspace-frame ${
                isVisible ? "is-visible" : ""
              }`}
              style={{
                position: "relative",
                zIndex: 1,
                borderRadius: "24px 100px 24px 100px",
                overflow: "hidden",
                boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.12)",
                border: "2px solid #C99B52",
                boxSizing: "border-box",
              }}
            >
              <img
                src={workspaceImg}
                alt={workspaceAlt}
                style={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "4 / 3",
                  objectFit: workspaceFit,
                  display: "block",
                }}
              />
            </div>
          </div>

          {/* About Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: "620px", minWidth: 0 }}
          >
            <h1
              style={{
                fontSize: "clamp(1.9rem, 4.2vw, 2.25rem)",
                fontWeight: 700,
                color: "var(--color-text-primary, #1F2937)",
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
                marginBottom: "clamp(1rem, 2.5vw, 1.35rem)",
                display: "flex",
                flexWrap: "wrap",
                columnGap: "0.3em",
              }}
            >
              <span
                style={{
                  background: "var(--gradient-heading)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {titlePart1}
              </span>

              <span
                style={{
                  color: "#C18B40",
                }}
              >
                {titleHighlight}
              </span>
            </h1>

            <div
              style={{
                fontSize: "1rem",
                color: "var(--color-text-secondary, #4B5563)",
                lineHeight: 1.65,
                marginBottom: "1.5rem",
                textAlign: "justify",
              }}
            >
              <div className="service-description">
                <p>{paragraph1}</p>
                <br />
                <p>{paragraph2}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Metrics Section */}
      </div>

      <style>{`
        @media (max-width: 960px) {
          .about-home-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
            margin-bottom: 2.5rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;
