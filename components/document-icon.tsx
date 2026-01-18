"use client";

import { cn } from "@/lib/utils";
import { getDocConfig } from "@/lib/document-types";

interface DocumentIconProps {
  type: string;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "soft" | "bold";
}

export function DocumentIcon({
  type,
  className,
  iconClassName,
  size = "md",
  variant = "soft",
}: DocumentIconProps) {
  const config = getDocConfig(type);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center transition-all duration-300",
        sizeClasses[size],
        variant === "soft"
          ? config.bgColor
          : config.color.replace("text-", "bg-"),
        className
      )}
    >
      <Icon
        className={cn(
          iconSizes[size],
          variant === "soft" ? config.color : "text-white",
          iconClassName
        )}
      />
    </div>
  );
}
