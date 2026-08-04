import type { HTMLAttributes } from "react";

export type BadgeTone = "navy" | "orange" | "success" | "warning" | "danger" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  navy: "bg-navy/10 text-navy",
  orange: "bg-orange/10 text-orange",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-black/10 text-black/60",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs whitespace-nowrap ${TONE_CLASSES[tone]} ${className}`}
      {...props}
    />
  );
}
