"use client";

import Link from "next/link";
import {
  Home as HomeIcon,
  Files,
  Layout,
  Plus,
  FolderOpen,
  Info,
  Settings,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileType2,
} from "lucide-react";
import { useExtracted } from "next-intl";
import { cn } from "@/lib/utils";
import { getDocConfig } from "@/lib/document-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SidebarProps {
  pathname: string;
  getNewUrl?: (type: string) => string;
}

export function Sidebar({ pathname, getNewUrl }: SidebarProps) {
  const t = useExtracted();

  const newDocTypes = [
    {
      type: "docx",
      label: t({ id: "Document", message: "Document" }),
    },
    {
      type: "xlsx",
      label: t({ id: "Spreadsheet", message: "Spreadsheet" }),
    },
    {
      type: "pptx",
      label: t({ id: "Presentation", message: "Presentation" }),
    },
    { type: "pdf", label: t({ id: "PDF", message: "PDF" }) },
  ];

  const sidebarItems = [
    { id: "open", label: t("Open"), icon: FolderOpen, href: "/" },
    { id: "template", label: t("Template"), icon: Layout, href: "/template" },
  ];

  return (
    <aside className="w-56 flex flex-col shrink-0">
      <div className="h-4" />

      {/* New Document Button with Popover */}
      <div className="px-4 mb-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm shadow-md hover:bg-primary/90 hover:shadow-lg transition-all active:scale-[0.98]">
              <Plus className="w-5 h-5" />
              {t("New")}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={8}
            className="w-56 p-2 bg-popover border-border"
          >
            <div className="space-y-2">
              {newDocTypes.map(({ type, label }) => {
                const doc = getDocConfig(type);
                const Icon = doc.icon;
                return (
                  <Link
                    key={type}
                    href={getNewUrl ? getNewUrl(type) : "#"}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      // Light mode: use doc colors; Dark mode: use custom dark styles
                      doc.bgColor,
                      "dark:bg-white/5 dark:hover:bg-white/10 dark:border dark:border-white/5",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        doc.color,
                        // Ensure icons are vibrant in dark mode
                        "dark:text-primary dark:filter dark:brightness-125",
                      )}
                    />
                    <span className="text-sm font-medium text-foreground dark:text-slate-200">
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-sidebar-hover hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-primary" : "text-text-secondary",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-1">
        <Link
          href="/about"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-md",
            pathname === "/about"
              ? "bg-primary/10 text-primary"
              : "text-text-secondary hover:text-foreground hover:bg-sidebar-hover",
          )}
        >
          <Info
            className={cn(
              "w-5 h-5",
              pathname === "/about" ? "text-primary" : "text-text-secondary",
            )}
          />
          {t("About")}
        </Link>

        <Link
          href="/settings"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-md",
            pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "text-text-secondary hover:text-foreground hover:bg-sidebar-hover",
          )}
        >
          <Settings
            className={cn(
              "w-5 h-5",
              pathname === "/settings" ? "text-primary" : "text-text-secondary",
            )}
          />
          {t("Settings")}
        </Link>
      </div>
    </aside>
  );
}
