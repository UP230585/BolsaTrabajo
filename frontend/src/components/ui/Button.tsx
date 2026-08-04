import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "neutral" | "danger" | "success" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "btn-gradient-primary text-white shadow-sm hover:shadow-md hover:brightness-110 active:brightness-95",
  secondary: "btn-gradient-secondary text-white shadow-sm hover:shadow-md hover:brightness-110 active:brightness-95",
  outline: "border-2 border-navy text-navy hover:bg-navy hover:text-white",
  neutral: "border border-black/20 text-black/70 hover:bg-surface hover:border-black/30",
  danger: "btn-gradient-danger text-white shadow-sm hover:shadow-md hover:brightness-110 active:brightness-95",
  success: "btn-gradient-success text-white shadow-sm hover:shadow-md hover:brightness-110 active:brightness-95",
  link: "text-orange hover:underline",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-lg",
};

// Centraliza variante+tamaño para poder usarse tanto en <button> (Button)
// como en <Link> estilizado como botón (p. ej. CTAs de navegación).
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = ""): string {
  const base =
    variant === "link"
      ? "font-medium transition-colors"
      : "font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  const sizePart = variant === "link" ? "" : SIZE_CLASSES[size];
  return [base, VARIANT_CLASSES[variant], sizePart, className].filter(Boolean).join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}
