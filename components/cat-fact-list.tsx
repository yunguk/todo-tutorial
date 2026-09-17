"use client";

import { useState } from "react";
import type { CatFact } from "@/lib/cat-facts";
import { cn } from "@/lib/utils";

interface CatFactListProps {
  facts: CatFact[];
}

function preview(fact: string, maxLength = 40) {
  if (fact.length <= maxLength) return fact;
  return `${fact.slice(0, maxLength)}...`;
}

export function CatFactList({ facts }: CatFactListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (facts.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        불러올 고양이 상식이 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {facts.map((fact) => {
        const selected = fact.id === selectedId;
        return (
          <li key={fact.id} className="rounded-md border border-border">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm"
              aria-expanded={selected}
              onClick={() =>
                setSelectedId((current) =>
                  current === fact.id ? null : fact.id
                )
              }
            >
              {selected ? fact.fact : preview(fact.fact)}
            </button>
            {selected && (
              <p
                className={cn(
                  "px-3 pb-2 text-xs text-muted-foreground"
                )}
              >
                총 {fact.fact.length}자
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
