import React from "react";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex w-full items-center justify-center pr-0 select-none sm:mb-8 md:mb-10 md:pr-28 lg:pr-36 xl:pr-40">
      <h2
        className="font-hail-mary text-center text-[clamp(1.25rem,2.4vw,2.25rem)] font-bold uppercase leading-snug tracking-[0.14em] text-white whitespace-nowrap sm:tracking-[0.2em]"
      >
        {title}
      </h2>
    </div>
  );
}

