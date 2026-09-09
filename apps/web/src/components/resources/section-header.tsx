import React from "react";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="w-full flex justify-center items-center mb-6 sm:mb-8 md:mb-10 select-none">
      <h2
        className="font-hail-mary text-center font-bold tracking-[0.14em] sm:tracking-[0.2em] text-white uppercase leading-snug whitespace-nowrap"
        style={{ fontSize: "clamp(1.25rem, 2.4vw, 2.25rem)" }}
      >
        {title}
      </h2>
    </div>
  );
}

