"use client";

import React, { useEffect, useState } from "react";
import { RESOURCE_SECTIONS } from "./resource-data";

export function SectionSidebar() {
  const [activeSection, setActiveSection] = useState<string>("youtube");

  // Scroll spy: updates activeSection as the user scrolls through sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = RESOURCE_SECTIONS.length - 1; i >= 0; i--) {
        const section = RESOURCE_SECTIONS[i];
        if (!section) continue;
        const el = document.getElementById(section.id);
        if (el && scrollPosition >= el.offsetTop - 100) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 30;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <aside
      aria-label="Section navigation"
      className="fixed right-3.5 md:right-5 lg:right-6 xl:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-6 select-none"
    >
      {RESOURCE_SECTIONS.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group flex items-center gap-3 cursor-pointer outline-none focus:outline-none transition-all duration-200"
          >
            {/* Label */}
            <span
              className={`font-mono text-xs sm:text-sm md:text-[15px] tracking-wider transition-colors duration-200 ${
                isActive
                  ? "text-[#8FFE09] font-bold drop-shadow-[0_0_8px_rgba(143,254,9,0.5)]"
                  : "text-[#71717a] group-hover:text-[#d4d4d8]"
              }`}
            >
              {section.navLabel}
            </span>

            {/* Pill indicator */}
            <span
              className={`h-2 w-7 sm:w-8 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-[#8FFE09] shadow-[0_0_12px_rgba(143,254,9,0.85)] scale-105"
                  : "bg-[#3f3f46] group-hover:bg-[#52525b]"
              }`}
            />
          </button>
        );
      })}
    </aside>
  );
}
