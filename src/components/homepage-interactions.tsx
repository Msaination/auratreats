"use client";

import { useEffect, useState } from "react";

const experienceSlides = [
  { src: "/images/1.jpg", alt: "Aura Spa skincare products arranged on a display shelf" },
  { src: "/images/2.jpg", alt: "Spa skincare and treatment products" },
  { src: "/images/15.jpg", alt: "Products arranged at the Aura Spa treatment counter" },
  { src: "/images/22.jpg", alt: "Spa oils and skincare displayed on a shelf" },
  { src: "/images/24.jpg", alt: "Aromatherapy products arranged for a spa treatment", align: "left" },
  { src: "/images/41.jpg", alt: "Tea and botanicals prepared for a spa ritual", align: "right" },
  { src: "/images/43.jpg", alt: "A calm Aura Spa treatment room" },
  { src: "/images/47.jpg", alt: "The Aura Spa relaxation lounge" },
  { src: "/images/211.jpg", alt: "A guest relaxing during a wellness treatment" },
  { src: "/images/243.jpg", alt: "A therapist preparing treatment products" },
  { src: "/images/285.jpg", alt: "A spa treatment bed prepared for a guest" },
  { src: "/images/AuraBG.jpg", alt: "The Aura Spa lounge and reception area" },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 720px)");
    setIsDesktop(desktopQuery.matches);
    const updateMenuState = () => {
      document.body.classList.toggle("menu-open", isOpen && !desktopQuery.matches);
    };
    const updateBreakpoint = () => {
      setIsDesktop(desktopQuery.matches);
      if (desktopQuery.matches) {
        setIsOpen(false);
      }
      updateMenuState();
    };

    updateMenuState();
    desktopQuery.addEventListener("change", updateBreakpoint);

    return () => {
      desktopQuery.removeEventListener("change", updateBreakpoint);
      document.body.classList.remove("menu-open");
    };
  }, [isOpen]);

  function closeNavigation() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-nav"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <nav
        className={`site-nav${isOpen || isDesktop ? " is-open" : ""}`}
        id="site-nav"
        aria-label="Primary navigation"
        aria-hidden={!isOpen && !isDesktop}
      >
        {[
          ["Welcome", "#welcome"],
          ["Experience", "#experience"],
          ["Offerings", "#offerings"],
          ["Events", "#events"],
          ["Contact", "#contact"],
        ].map(([label, href]) => (
          <a href={href} key={href} tabIndex={isOpen || isDesktop ? 0 : -1} onClick={closeNavigation}>
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}

export function RevealOnScroll() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}

export function ExperienceSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isPaused || isHovered || isFocused || document.hidden) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((slide) => (slide + 1) % experienceSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isFocused, isHovered, isPaused]);

  useEffect(() => {
    let wasVisible = !document.hidden;
    function syncVisibility() {
      const isVisible = !document.hidden;
      if (isVisible === wasVisible) {
        return;
      }
      wasVisible = isVisible;
      if (isVisible) {
        setIsPaused(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      } else {
        setIsPaused(true);
      }
    }

    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  function showSlide(index: number) {
    const nextIndex = (index + experienceSlides.length) % experienceSlides.length;
    setActiveSlide(nextIndex);
    setIsPaused(false);
  }

  return (
    <div
      className="experience-slider"
      role="region"
      aria-label="Aura Spa photo slideshow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocused(false);
        }
      }}
    >
      <div className="experience-slides">
        {experienceSlides.map((slide, index) => (
          <figure
            className={`experience-slide${index === activeSlide ? " is-active" : ""}`}
            data-image-align={slide.align}
            aria-hidden={index !== activeSlide}
            key={slide.src}
          >
            <img src={slide.src} alt={slide.alt} loading={index === activeSlide ? "eager" : "lazy"} />
          </figure>
        ))}
      </div>
      <div className="experience-slider-controls">
        <div className="experience-slider-nav">
          <button type="button" aria-label="Previous slide" onClick={() => showSlide(activeSlide - 1)}>‹</button>
          <button type="button" aria-label="Next slide" onClick={() => showSlide(activeSlide + 1)}>›</button>
        </div>
        <div className="experience-slider-dots" role="group" aria-label="Choose a slide">
          {experienceSlides.map((slide, index) => (
            <button
              className="experience-slider-dot"
              type="button"
              aria-label={`Show slide ${index + 1} of ${experienceSlides.length}`}
              aria-pressed={activeSlide === index}
              onClick={() => showSlide(index)}
              key={slide.src}
            />
          ))}
        </div>
        <button
          className="experience-slider-toggle"
          type="button"
          aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
          aria-pressed={isPaused}
          onClick={() => setIsPaused((paused) => !paused)}
        >
          {isPaused ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
}