"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

const variants: Record<Variant, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "text-gray-600 hover:bg-gray-100",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm",
        className
      )}
    />
  );
}
