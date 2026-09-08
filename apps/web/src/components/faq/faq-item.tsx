"use client";

import { useId } from "react";
import { FAQItemData } from "./faq-data";

interface FAQItemProps {
  item: FAQItemData;
  isOpen: boolean;
  onToggle: () => void;
  isFirst?: boolean;
}

export function FAQItem({
  item,
  isOpen,
  onToggle,
  isFirst = false,
}: FAQItemProps) {
  const contentId = useId();
  const headerId = useId();

  return (
    <div
      className={`relative w-full select-none flex flex-col ${isFirst ? "mt-0" : "-mt-[36px]"
        }`}
    >
      {/* Interactive FAQ Box */}
      <button
        type="button"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={onToggle}
        className="group relative w-full text-left cursor-pointer focus:outline-none transition-colors duration-300"
      >
        {/* Full Green Background Fill */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isOpen ? "opacity-100 bg-[#76ff03]" : "opacity-0 bg-transparent"
            }`}
          style={{
            clipPath:
              "polygon(0px 36px, 40px 36px, 76px 0px, 100% 0px, 100% calc(100% - 36px), 76px calc(100% - 36px), 40px 100%, 0px 100%)",
          }}
        />

        {/* Content Container: Centered around visual equator */}
        <div className="relative z-10 w-full min-h-[90px] pl-24 sm:pl-28 md:pl-32 lg:pl-36 pr-14 sm:pr-20 md:pr-24 lg:pr-32 pt-8 pb-16 sm:pt-9 sm:pb-18 md:pt-10 md:pb-20 flex flex-col justify-center transition-all duration-300">
          {/* Question Text: Sixsound font (Always in CAPS) */}
          <h3
            className={`font-[family-name:var(--font-sixsound)] text-sm sm:text-base md:text-lg lg:text-xl tracking-wider uppercase transition-colors duration-300 text-left leading-snug ${isOpen ? "text-black font-bold" : "text-white group-hover:text-[#76ff03]"
              }`}
          >
            {item.question}
          </h3>

          {/* Answer Text: IBM Plex Mono font */}
          <div
            id={contentId}
            role="region"
            aria-labelledby={headerId}
            className={`grid transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen
              ? "grid-rows-[1fr] opacity-100 mt-4 pt-1"
              : "grid-rows-[0fr] opacity-0 mt-0"
              }`}
          >
            <div className="overflow-hidden">
              <p className="text-black font-[family-name:var(--font-ibm-plex-mono)] font-mono text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed tracking-normal font-medium max-w-5xl text-left">
                {item.answer}
              </p>
            </div>
          </div>
        </div>

        {/* Square on the right: Dynamically centered vertically on the visual equator */}
        <div
          className="absolute right-6 sm:right-10 md:right-16 top-[calc(50%-18px)] -translate-y-1/2 z-20 pointer-events-none transition-transform duration-300"
          aria-hidden="true"
        >
          <div
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${isOpen
              ? "bg-black scale-105"
              : "bg-zinc-300 group-hover:bg-[#76ff03] group-hover:shadow-[0_0_10px_#76ff03]"
              }`}
          />
        </div>

        {/* Bottom Circuit Line */}
        <div
          className="absolute bottom-0 left-0 w-full h-[36px] pointer-events-none z-20"
          aria-hidden="true"
        >
          <svg className="w-full h-[36px] overflow-visible">
            {/* Square terminal on left */}
            <rect x="0" y="33" width="6" height="6" fill="#76ff03" />

            {/* 45-degree angle line: (0, 36) -> (40, 36) -> (76, 0) -> H 10000 */}
            <path
              d="M 0 36 L 40 36 L 76 0 H 10000"
              fill="none"
              stroke="#76ff03"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </button>
    </div>
  );
}
