import { getStage } from "@/lib/stages";
import type { StageId } from "@/lib/types";

export function StageBadge({ stage }: { stage: StageId }) {
  const s = getStage(stage);
  const tone =
    stage === "complete"
      ? "border-primary bg-primary text-bg"
      : stage === "lost"
        ? "border-border bg-surface text-muted line-through"
        : "border-primary/40 bg-elevated text-primary-hover";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}
      title={s.gate}
    >
      {s.label}
    </span>
  );
}
