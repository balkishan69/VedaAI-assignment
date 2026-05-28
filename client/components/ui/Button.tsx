"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary:
    "bg-gradient-to-r from-brand to-brand-dark text-white shadow-sm hover:shadow-md hover:from-brand-dark hover:to-brand active:scale-[0.98]",
  secondary:
    "border border-ink/10 bg-white text-ink shadow-sm hover:bg-porcelain hover:border-ink/20 active:scale-[0.98]",
  ghost:
    "text-ink/70 hover:bg-ink/5 hover:text-ink active:bg-ink/8",
  danger:
    "bg-gradient-to-r from-coral to-red-500 text-white shadow-sm hover:shadow-md active:scale-[0.98]",
};

const sizeStyles = {
  sm: "min-h-8 px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "min-h-10 px-4 py-2 text-sm gap-2 rounded-lg",
  lg: "min-h-12 px-6 py-3 text-sm gap-2.5 rounded-xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
