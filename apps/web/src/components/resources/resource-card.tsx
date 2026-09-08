"use client";

import React, { useState } from "react";
import { ResourceItem } from "./resource-data";

// ─── Placeholder Media ────────────────────────────────────────────────────────
export function PlaceholderMedia() {
  return (
    <div className="w-full aspect-[16/10] bg-[#bcbcbc] flex items-center justify-center overflow-hidden select-none rounded-[2px]">
      <svg
        className="w-14 h-14 sm:w-16 sm:h-16 text-[#e2e2e2] drop-shadow-sm"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="28" y="18" width="54" height="46" rx="2" stroke="white" strokeWidth="3.5" fill="#cacaca" transform="rotate(6 28 18)" />
        <rect x="18" y="26" width="58" height="48" rx="2" stroke="white" strokeWidth="3.5" fill="#c0c0c0" />
        <circle cx="60" cy="40" r="4.5" fill="white" />
        <path d="M24 66L38 48L48 60L56 50L68 66H24Z" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── ResourceCard ─────────────────────────────────────────────────────────────
interface ResourceCardProps {
  item: ResourceItem;
  isHovered?: boolean;
  displacementX?: number;
  cardMaxWidthClass?: string;
  onHover?: () => void;
  onLeave?: () => void;
}

export function ResourceCard({
  item,
  isHovered = false,
  displacementX = 0,
  cardMaxWidthClass = "max-w-[340px] sm:max-w-[360px] md:max-w-[375px]",
  onHover,
  onLeave,
}: ResourceCardProps) {
  const [internalHover, setInternalHover] = useState(false);
  const activeHover = onHover ? isHovered : internalHover;

  const handleMouseEnter = () => {
    if (onHover) onHover();
    else setInternalHover(true);
  };

  const handleMouseLeave = () => {
    if (onLeave) onLeave();
    else setInternalHover(false);
  };

  return (
    /*
     * Outer container: sets column layout and width constraints.
     * Sibling displacement: translates smoothly left or right when another card in the grid is hovered.
     */
    <div
      className={`relative flex flex-col w-full ${cardMaxWidthClass}`}
      style={{
        transform: `translateX(${displacementX}px)`,
        transition: "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ── Number heading (001, 002...) ──
          STATIC: Sits directly above the card at z-0.
          When hovered, the card body (z-30) scales up and translates upward,
          completely covering the number heading on top. */}
      <div
        className="font-sixsound text-[#464343] font-bold tracking-widest pl-1 mb-1.5 select-none pointer-events-none"
        style={{ fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)", position: "relative", zIndex: 0 }}
      >
        {item.number}
      </div>

      {/* ── Card Body (Enlarges on hover, NO rotation) ──
          - transformOrigin: "50% 50%"
          - No rotation (rotate: 0deg)
          - Growth & upward expansion: scale(1.1) translateY(-22px) -> covers the number completely
          - zIndex: rises to 30 on hover to cover the number */}
      <div
        className="futuristic-card-outer group p-[2.5px] bg-[#1a3817] hover:bg-[#2d5a10] hover:shadow-[0_0_36px_rgba(143,254,9,0.4)] flex-1 flex flex-col cursor-pointer"
        style={{
          transform: activeHover
            ? "scale(1.1) translateY(-22px)"
            : "scale(1) translateY(0)",
          transformOrigin: "50% 50%",
          transition: "transform 260ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease, background-color 200ms ease",
          position: "relative",
          zIndex: activeHover ? 30 : 10,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Inner dark panel with sci-fi polygon shape */}
        <div className="futuristic-card-inner bg-[#0b170a] pt-3.5 pb-4.5 pl-3.5 sm:pl-4.5 pr-6.5 sm:pr-8.5 flex flex-col justify-between flex-1 min-h-[340px] sm:min-h-[360px]">

          <div className="flex flex-col px-1">
            {/* Top Media */}
            <PlaceholderMedia />

            {/* Card title — neon green, Sixsound font */}
            <h3
              className="font-sixsound text-[#8FFE09] font-bold tracking-wide mt-3 mb-1.5 leading-snug sm:leading-tight break-words"
              style={{ fontSize: "clamp(1rem, 2.8vw, 1.18rem)" }}
            >
              {item.title}
            </h3>

            {/* Description — text-justify with generous internal margin and break-words */}
            <p
              className="font-mono text-[#9ca3af] leading-relaxed mb-4 font-normal text-justify break-words text-[0.74rem] sm:text-[0.79rem]"
            >
              {item.description}
            </p>
          </div>

          {/* ── Action Button with REAL space between text button and arrow box ── */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 sm:gap-2.5 self-start cursor-pointer mt-auto select-none group/btn px-1"
          >
            {/* Main button box */}
            <span
              className="bg-[#8FFE09] text-black font-bold font-mono uppercase tracking-wider px-3 py-1.5 transition-all duration-200 group-hover/btn:brightness-110 group-hover/btn:shadow-[0_0_14px_rgba(143,254,9,0.6)] flex items-center text-[0.7rem] sm:text-[0.75rem]"
            >
              {item.buttonText}
            </span>

            {/* Separate arrow box */}
            <span className="bg-[#8FFE09] text-black px-2 py-1.5 transition-all duration-200 group-hover/btn:brightness-110 group-hover/btn:shadow-[0_0_14px_rgba(143,254,9,0.6)] flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 group-hover/btn:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>

        </div>
      </div>
    </div>
  );
}

// ─── ResourceGrid (Manages mutual displacement across sibling cards) ──────────
interface ResourceGridProps {
  items: ResourceItem[];
  gridClassName?: string;
  cardMaxWidthClass?: string;
}

export function ResourceGrid({
  items,
  gridClassName,
  cardMaxWidthClass,
}: ResourceGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={gridClassName}>
      {items.map((item, index) => {
        const isHovered = hoveredIndex === index;
        let displacementX = 0;

        if (hoveredIndex !== null) {
          if (index < hoveredIndex) {
            // Card is to the left of the hovered card -> displace smoothly to the left
            displacementX = -20;
          } else if (index > hoveredIndex) {
            // Card is to the right of the hovered card -> displace smoothly to the right
            displacementX = 20;
          }
        }

        return (
          <ResourceCard
            key={item.id}
            item={item}
            isHovered={isHovered}
            displacementX={displacementX}
            cardMaxWidthClass={cardMaxWidthClass}
            onHover={() => setHoveredIndex(index)}
            onLeave={() => setHoveredIndex(null)}
          />
        );
      })}
    </div>
  );
}

