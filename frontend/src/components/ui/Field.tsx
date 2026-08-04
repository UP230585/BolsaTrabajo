import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export type FieldSize = "sm" | "md";

const FIELD_BASE =
  "w-full rounded-md border border-black/20 focus:outline-none focus:ring-2 focus:ring-navy transition-colors disabled:bg-surface disabled:text-black/50";

const SIZE_CLASSES: Record<FieldSize, string> = {
  sm: "px-2 py-1.5 text-sm",
  md: "px-3 py-2",
};

export function Label({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`block text-sm font-medium mb-1 ${className}`} {...props} />;
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: FieldSize;
}

export function Input({ size = "md", className = "", ...props }: InputProps) {
  return <input className={`${FIELD_BASE} ${SIZE_CLASSES[size]} ${className}`} {...props} />;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: FieldSize;
}

export function Select({ size = "md", className = "", ...props }: SelectProps) {
  return <select className={`${FIELD_BASE} ${SIZE_CLASSES[size]} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${FIELD_BASE} ${SIZE_CLASSES.md} ${className}`} {...props} />;
}
