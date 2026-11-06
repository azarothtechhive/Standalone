import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Position references for smooth physics
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    // Smooth animation loop using linear interpolation (lerp)
    const animate = () => {
      if (!active) return;

      // Ring trails with smooth damping factor
      const ease = 0.22;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    const onPointerMove = (e: MouseEvent | PointerEvent) => {
      // Check for valid desktop pointer movements
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) {
        // Snap ring position immediately on first appearance
        ringPos.current.x = e.clientX;
        ringPos.current.y = e.clientY;
        setIsVisible(true);
      }
    };

    const onPointerOver = (e: MouseEvent) => {
      const target = e.target;
      if (target instanceof Element) {
        const isClickable = target.closest(
          'a, button, [role="button"], input, select, textarea, label, [tabindex], .clickable, .cursor-pointer, [data-cursor-hover], .azaroth-nav-link'
        ) !== null;
        setIsHovering(isClickable);
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    // If pure touch event fires, hide custom cursor
    const onTouchStart = () => {
      setIsVisible(false);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseover', onPointerOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      active = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseover', onPointerOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, [isVisible]);

  return (
    <>
      {/* Central Glowing Dot */}
      <div
        ref={dotRef}
        className={`custom-cursor-dot${isHovering ? ' is-hovering' : ''}`}
        aria-hidden="true"
        style={{
          opacity: isVisible ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 200ms ease, width 180ms ease, height 180ms ease, background-color 250ms ease, box-shadow 250ms ease',
        }}
      />

      {/* Orbiting Rotating Dashed Ring */}
      <div
        ref={ringRef}
        className={`custom-cursor-ring${isHovering ? ' is-hovering' : ''}`}
        aria-hidden="true"
        style={{
          opacity: isVisible ? (isHovering ? 1 : 0.85) : 0,
          pointerEvents: 'none',
          transition: 'opacity 200ms ease, width 220ms cubic-bezier(0.16, 1, 0.3, 1), height 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="custom-cursor-ring-spinner" style={{ pointerEvents: 'none' }} />
      </div>
    </>
  );
};

export default CustomCursor;
