import {
  WORKSHOP_STATUS_LABELS,
  WORKSHOP_STATUS_TONES,
  WORKSHOP_NEED_STATUS_LABELS,
  WORKSHOP_NEED_STATUS_TONES,
  WORKSHOP_PHOTO_STATUS_LABELS,
  WORKSHOP_PHOTO_STATUS_TONES,
  WORKSHOP_HELP_STATUS_LABELS,
  WORKSHOP_HELP_STATUS_TONES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const labelMaps: Record<string, Record<string, string>> = {
  workshop: WORKSHOP_STATUS_LABELS,
  need: WORKSHOP_NEED_STATUS_LABELS,
  photo: WORKSHOP_PHOTO_STATUS_LABELS,
  help: WORKSHOP_HELP_STATUS_LABELS,
};

const toneMaps: Record<string, Record<string, string>> = {
  workshop: WORKSHOP_STATUS_TONES,
  need: WORKSHOP_NEED_STATUS_TONES,
  photo: WORKSHOP_PHOTO_STATUS_TONES,
  help: WORKSHOP_HELP_STATUS_TONES,
};

export function WorkshopStatusBadge({ value, type = "workshop" }: { value: string; type?: string }) {
  const labels = labelMaps[type] ?? WORKSHOP_STATUS_LABELS;
  const tones = toneMaps[type] ?? WORKSHOP_STATUS_TONES;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide",
        tones[value] ?? "bg-stone-100 text-stone-700",
      )}
    >
      {labels[value] ?? value}
    </span>
  );
}
