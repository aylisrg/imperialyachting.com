"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FAQItem } from "@/types/common";

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ items, className }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className={cn("divide-y divide-white/10", className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={index} className="group">
            <button
              type="button"
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-gold-400 cursor-pointer"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "font-heading text-lg font-semibold transition-colors",
                  isOpen ? "text-gold-400" : "text-white"
                )}
              >
                {item.question}
              </span>
              <span className="flex-shrink-0 text-gold-500">
                {isOpen ? (
                  <Minus className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </span>
            </button>
            {/* CSS grid-template-rows animation instead of framer-motion */}
            <div className={cn("accordion-body", isOpen && "open")}>
              <div>
                <p className="pb-5 text-white/60 leading-relaxed font-body">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
