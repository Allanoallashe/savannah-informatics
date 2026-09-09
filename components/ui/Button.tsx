import React from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingLabel?: string;
  block?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-white border border-accent hover:bg-accent-hover hover:border-accent-hover disabled:bg-accent/50 disabled:border-accent/50",
  secondary:
    "bg-surface text-primary border border-line-strong hover:bg-primary-subtle hover:border-primary disabled:text-muted",
  ghost:
    "bg-transparent text-primary border border-transparent hover:bg-primary-subtle disabled:text-muted",
  danger:
    "bg-danger text-white border border-danger hover:bg-[#8F1C13] hover:border-[#8F1C13] disabled:bg-danger/50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel,
  block = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors duration-150 ease-exit disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        block && "w-full",
        className
      )}
      {...rest}
    >
      {loading && <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin" />}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </button>
  );
}
