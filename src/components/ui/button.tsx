/**
 * Button — UI primitive (Cromática, Fase 3C)
 *
 * Solid / outline / ghost × sm / md / lg.
 * All colors use Cromática tokens. No legacy vars.
 * No external deps — pure Tailwind + CSS custom properties.
 */

import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT: Record<ButtonVariant, string> = {
  solid: [
    "bg-[var(--tinta)] text-[var(--papel)]",
    "hover:bg-[var(--tinta-suave)]",
    "active:bg-[var(--tinta)]",
  ].join(" "),

  outline: [
    "border border-[var(--tinta)] text-[var(--tinta)] bg-transparent",
    "hover:bg-[var(--gal)]",
  ].join(" "),

  ghost: [
    "text-[var(--tinta-suave)] bg-transparent",
    "hover:bg-[var(--gal)] hover:text-[var(--tinta)]",
  ].join(" "),
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-4 text-[0.68rem] tracking-[0.12em]",
  md: "h-10 px-6 text-[0.76rem] tracking-[0.10em]",
  lg: "h-12 px-8 text-[0.84rem] tracking-[0.08em]",
};

const BASE =
  "inline-flex cursor-pointer items-center justify-center font-semibold uppercase " +
  "rounded-[var(--r-chip)] transition-colors duration-150 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-[var(--tinta)] " +
  "disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  variant = "solid",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      className={[BASE, VARIANT[variant], SIZE[size], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
