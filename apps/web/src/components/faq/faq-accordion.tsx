"use client";

import { useState } from "react";
import { FAQ_ITEMS, FAQItemData } from "./faq-data";
import { FAQItem } from "./faq-item";

interface FAQAccordionProps {
  items?: FAQItemData[];
  defaultOpenId?: string | null;
}

export function FAQAccordion({
  items = FAQ_ITEMS,
  defaultOpenId = null,
}: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full flex flex-col space-y-0 relative z-10">
      {items.map((item, index) => (
        <FAQItem
          key={item.id}
          item={item}
          isFirst={index === 0}
          isOpen={openId === item.id}
          onToggle={() => handleToggle(item.id)}
        />
      ))}
    </div>
  );
}
