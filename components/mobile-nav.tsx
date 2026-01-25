"use client";

import { useExtracted } from "next-intl";
import { FolderOpen, Layout, Settings, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "open" | "template" | "about" | "settings";

interface MobileNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  className?: string;
}

export function MobileNav({
  activeTab,
  setActiveTab,
  className,
}: MobileNavProps) {
  const t = useExtracted();

  const navItems = [
    { id: "open", label: t("Open"), icon: FolderOpen },
    { id: "template", label: t("Template"), icon: Layout },
    { id: "settings", label: t("Settings"), icon: Settings },
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-around bg-card border-t border-border p-2 pb-safe",
        className,
      )}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as Tab)}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-lg transition-colors min-w-[64px]",
            activeTab === item.id
              ? "text-primary bg-primary/10"
              : "text-text-secondary hover:text-foreground active:bg-muted",
          )}
        >
          <item.icon
            className={cn(
              "w-6 h-6",
              activeTab === item.id ? "text-primary" : "text-text-secondary",
            )}
            strokeWidth={2}
          />
          <span className="text-[10px] font-medium leading-none">
            {item.label}
          </span>
        </button>
      ))}
      <button
        onClick={() => setActiveTab("about")}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-lg transition-colors min-w-[64px]",
          activeTab === "about"
            ? "text-primary bg-primary/10"
            : "text-text-secondary hover:text-foreground active:bg-muted",
        )}
      >
        <Info
          className={cn(
            "w-6 h-6",
            activeTab === "about" ? "text-primary" : "text-text-secondary",
          )}
          strokeWidth={2}
        />
        <span className="text-[10px] font-medium leading-none">
          {t("About")}
        </span>
      </button>
    </div>
  );
}
