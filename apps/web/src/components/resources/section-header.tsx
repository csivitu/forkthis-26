import React from "react";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex w-full items-center justify-center select-none sm:mb-8 md:mb-10">
      <h2
        className="page-heading max-w-full text-center font-bold uppercase leading-snug tracking-[0.14em] text-white sm:tracking-[0.2em]"
      >
        {title.split(" ").map((word, index) => (
          <React.Fragment key={word}>
            {index > 0 && " "}
            <span className="block sm:inline">{word}</span>
          </React.Fragment>
        ))}
      </h2>
    </div>
  );
}

