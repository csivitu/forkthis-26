"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ResourceItem } from "./resource-data";

const CARD_CLIP_PATH = `polygon(
  28px 0px,
  calc(100% - 28px) 0px,
  100% 28px,
  100% 62%,
  calc(100% - 22px) calc(62% + 22px),
  calc(100% - 22px) calc(100% - 28px),
  calc(100% - 50px) 100%,
  28px 100%,
  0px calc(100% - 28px),
  0px 28px
)`;

// ─── Card Media ───────────────────────────────────────────────────────────────
// Renders the appropriate image based on the item's imageType:
//  • youtube  → full-bleed cover thumbnail
//  • article  → centered art.png on a dark tinted bg
//  • github   → centered, brightened github logo on dark bg
function CardMedia({ item }: { item: ResourceItem }) {
  if (item.imageUrl && item.imageType === "youtube") {
    return (
      <div
        className="w-full aspect-[16/10] overflow-hidden select-none relative"
        style={{ backgroundColor: "transparent" }}
      >
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 460px"
        />
        {/* plain rectangular bright green outline for thumbnail (half thickness) */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ border: "1.5px solid #8FFE09", boxSizing: "border-box", backgroundColor: "transparent" }}
        />
      </div>
    );
  }

  if (item.imageUrl && item.imageType === "article") {
    return (
      <div className="w-full aspect-[16/10] flex items-center justify-center overflow-hidden select-none relative" style={{ backgroundColor: "transparent" }}>
        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden flex items-center justify-center bg-transparent">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={200}
            height={200}
            className="object-cover"
            style={{ backgroundColor: "transparent" }}
          />
        </div>
      </div>
    );
  }

  if (item.imageUrl && item.imageType === "github") {
    return (
      <div className="w-full aspect-[16/10] flex items-center justify-center overflow-hidden select-none relative" style={{ backgroundColor: "transparent" }}>
        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden flex items-center justify-center bg-transparent">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={200}
            height={200}
            className="object-cover"
            style={{ backgroundColor: "transparent" }}
          />
        </div>
      </div>
    );
  }

  // Fallback placeholder
  return (
    <div className="w-full aspect-[16/10] bg-transparent flex items-center justify-center overflow-hidden select-none">
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
  cardMaxWidthClass = "max-w-[390px] sm:max-w-[430px] md:max-w-[460px]",
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
      className={`relative mx-auto flex w-full flex-col ${cardMaxWidthClass}`}
      style={{
        transform: `translateX(${displacementX}px)`,
        transition: "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ── Number heading (001, 002...) ──
          Aligned with the beginning of the top horizontal edge (28px from left edge) */}
      <div
        className="relative z-0 mb-1.5 pl-[28px] font-sixsound text-[clamp(0.92rem,1.15vw,1.1rem)] font-bold tracking-widest text-[#464343] select-none pointer-events-none"
      >
        {item.number}
      </div>

      {/* ── Card Body (Enlarges on hover with luminous neon green glow) ── */}
      <div
        className="futuristic-card-outer group p-[2px] flex-1 flex flex-col cursor-pointer"
        style={{
          clipPath: CARD_CLIP_PATH,
          backgroundColor: activeHover ? "#5cb818" : "#1a3318",
          filter: activeHover
            ? "drop-shadow(0 0 10px rgba(143, 254, 9, 0.85)) drop-shadow(0 0 24px rgba(143, 254, 9, 0.55)) drop-shadow(0 0 45px rgba(143, 254, 9, 0.28))"
            : "drop-shadow(0 0 1px rgba(0, 0, 0, 0.5))",
          transform: activeHover
            ? "scale(1.06) translateY(-18px)"
            : "scale(1) translateY(0)",
          transformOrigin: "50% 50%",
          transition:
            "transform 160ms cubic-bezier(0.22, 1, 0.36, 1), background-color 140ms ease, filter 140ms ease",
          position: "relative",
          zIndex: activeHover ? 30 : 10,
          willChange: "transform, filter",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Inner dark panel with matching sci-fi polygon shape, shifted lower down */}
        <div
          className="futuristic-card-inner bg-[#132512] pt-6 sm:pt-7 md:pt-8 pb-5 sm:pb-6 pl-4.5 sm:pl-5 pr-7 sm:pr-8 flex flex-col justify-between flex-1 min-h-[380px] sm:min-h-[410px] md:min-h-[430px]"
          style={{ clipPath: CARD_CLIP_PATH }}
        >
          <div className="flex flex-col">
            {/* Top Media */}
            <CardMedia item={item} />

            {/* Card title — neon green, Sixsound font */}
            <h3
              className="mt-4 mb-2.5 break-words font-sixsound text-[clamp(1.1rem,2.8vw,1.32rem)] font-bold leading-snug tracking-wide text-[#8FFE09] sm:leading-tight"
            >
              {item.title}
            </h3>

            {/* Description — text-justify with generous internal margin and break-words */}
            <p className="font-mono text-[#9ca3af] leading-relaxed mb-5 font-normal text-justify break-words text-[0.78rem] sm:text-[0.85rem]">
              {item.description}
            </p>
          </div>

          {/* ── Action Button with identical vertical height for button and arrow box ── */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn mt-auto inline-flex cursor-pointer select-none items-center gap-2 self-start"
          >
            {/* Main button box */}
            <span className="flex h-[2.125rem] items-center justify-center bg-[#8FFE09] px-4 font-mono text-[0.74rem] font-bold uppercase leading-none tracking-wider text-black transition-all duration-140 group-hover/btn:brightness-110 group-hover/btn:shadow-[0_0_14px_rgba(143,254,9,0.6)] sm:h-9 sm:text-[0.8rem]">
              {item.buttonText}
            </span>

            {/* Separate arrow box with EXACT matching height and width */}
            <span className="flex h-[2.125rem] w-[2.125rem] shrink-0 items-center justify-center bg-[#8FFE09] text-black transition-all duration-140 group-hover/btn:brightness-110 group-hover/btn:shadow-[0_0_14px_rgba(143,254,9,0.6)] sm:h-9 sm:w-9">
              <svg
                className="w-4 h-4 stroke-[2.5] transition-transform duration-140 group-hover/btn:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
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
