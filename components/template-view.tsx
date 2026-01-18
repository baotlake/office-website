"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Files,
  FileText,
  Table,
  Presentation,
  Loader2,
} from "lucide-react";
import { useExtracted } from "next-intl";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";

interface Template {
  name: string;
  filename: string;
  preview: string;
  type: "pptx" | "docx" | "xlsx";
  category: string;
}

export function TemplateView() {
  const t = useExtracted();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  const router = useRouter();
  const server = useAppStore((state) => state.server);

  useEffect(() => {
    fetch("/files/templates.json")
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch((err) => console.error("Failed to load templates:", err));
  }, []);

  const handleTemplateClick = async (tpl: Template) => {
    if (loadingTemplate) return;
    setLoadingTemplate(tpl.name);
    try {
      const url = `/files/${encodeURIComponent(tpl.filename)}`;
      await server.openUrl(url, { fileType: tpl.type, fileName: tpl.filename });
      router.push("/editor");
    } catch (err) {
      console.error("Failed to open template:", err);
    } finally {
      setLoadingTemplate(null);
    }
  };

  const types = [
    { name: t("All"), icon: Files, key: "All" },
    { name: t("Word"), icon: FileText, key: "Word" },
    { name: t("Excel"), icon: Table, key: "Excel" },
    { name: t("PowerPoint"), icon: Presentation, key: "PowerPoint" },
  ];

  const categories = [
    "All",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pptx":
        return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-400";
      case "docx":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-400";
      case "xlsx":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-400";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400";
    }
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch = tpl.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      activeType === "All" ||
      (activeType === "Word" && tpl.type === "docx") ||
      (activeType === "Excel" && tpl.type === "xlsx") ||
      (activeType === "PowerPoint" && tpl.type === "pptx");
    const matchesCategory =
      activeCategory === "All" || tpl.category === activeCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col items-center">
        <div className="flex flex-col gap-2 mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">
            {t("Template Library")}
          </h2>
          <p className="text-text-secondary">
            {t("Professional designs tailored for your productivity needs.")}
          </p>
        </div>

        {/* Template Search */}
        <div className="relative w-full max-w-xl mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder={t(
              "Search for templates (e.g. 'Resume', 'Report', 'Pitch')...",
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base"
          />
        </div>

        {/* Level 1: File Types */}
        <div className="w-full space-y-4 mb-10">
          <div className="flex flex-wrap gap-4 justify-center">
            {types.map((type) => (
              <button
                key={type.key}
                onClick={() => setActiveType(type.key)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl border transition-all font-semibold",
                  activeType === type.key
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-sidebar-hover",
                )}
              >
                <type.icon className="w-5 h-5" />
                {type.name}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full space-y-4 mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full border text-sm font-medium transition-all focus:outline-none",
                  activeCategory === cat
                    ? "bg-foreground border-foreground text-background shadow-md"
                    : "bg-card border-border text-text-secondary hover:border-foreground hover:text-foreground",
                )}
              >
                {cat === "All" ? t("All") : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => handleTemplateClick(tpl)}
                disabled={!!loadingTemplate}
                className="flex flex-col gap-4 group text-left focus:outline-none"
              >
                <div className="aspect-video rounded-2xl border border-border bg-card group-hover:border-primary/50 group-hover:shadow-xl transition-all relative overflow-hidden flex flex-col items-center justify-center">
                  <img
                    src={`/files/${encodeURIComponent(tpl.preview)}`}
                    alt={tpl.name}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {loadingTemplate === tpl.name && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 z-10">
                    <div
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm",
                        getTypeColor(tpl.type),
                      )}
                    >
                      {tpl.type}
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-white text-xs font-bold px-3 py-1.5 bg-primary rounded-lg shadow-lg">
                      {t("Use Template")}
                    </span>
                  </div>
                </div>

                <div className="px-1">
                  <p className="font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {tpl.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-tight",
                        getTypeColor(tpl.type).split(" ")[0],
                      )}
                    >
                      {tpl.type}
                    </span>
                    <span className="text-[10px] text-text-secondary">•</span>
                    <span className="text-[10px] text-text-secondary font-medium">
                      {tpl.category}
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-sidebar-hover rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-text-secondary" />
              </div>
              <p className="text-text-secondary font-medium">
                {t("No templates found matching your criteria.")}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveType("All");
                  setActiveCategory("All");
                }}
                className="text-primary text-sm font-bold hover:underline"
              >
                {t("Clear all filters")}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
