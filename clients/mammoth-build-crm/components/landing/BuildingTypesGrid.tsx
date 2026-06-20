"use client";

import { BUILDING_TYPES } from "@/lib/content";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Reveal } from "../Reveal";

export function BuildingTypesGrid() {
  const [interests, setInterests] = useLocalStorage<string[]>("mammoth:interests", []);

  const toggle = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {BUILDING_TYPES.map((b, i) => {
        const saved = interests.includes(b.id);
        return (
          <Reveal as="article" key={b.id} delayMs={(i % 4) * 60}>
            <div className="group h-full rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary hover:bg-elevated">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                <button
                  type="button"
                  onClick={() => toggle(b.id)}
                  aria-pressed={saved}
                  aria-label={saved ? `Remove ${b.title} from interests` : `Save ${b.title}`}
                  className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                    saved
                      ? "animate-pop border-primary bg-primary text-bg"
                      : "border-border text-muted hover:text-ink"
                  }`}
                >
                  {saved ? "★ Saved" : "☆ Save"}
                </button>
              </div>
              <p className="mt-2 text-sm text-muted">{b.blurb}</p>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
