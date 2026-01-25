"use client";

import { useAppStore } from "@/store";
import { Globe, Palette, Check } from "lucide-react";
import * as Illustration from "@/components/svg";
import { useExtracted } from "next-intl";
import { cn } from "@/lib/utils";
import { languages, LocaleName, LocaleExtend, Language } from "@ziziyi/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OfficeTheme } from "@/utils/editor/types";
import { isDarkTheme } from "@/utils/utils";

// Get display name for a language code
function getLanguageLabel(code: Language): string {
  if (code === LocaleExtend.Auto) {
    return "Auto (Detect browser language)";
  }
  return LocaleName[code as keyof typeof LocaleName] || code;
}

// Sort languages: Auto first, then alphabetically by display name
const sortedLanguages = [
  LocaleExtend.Auto,
  ...languages
    .filter((code) => code !== LocaleExtend.Auto)
    .sort((a, b) => getLanguageLabel(a).localeCompare(getLanguageLabel(b))),
];

export function SettingsView() {
  const t = useExtracted();
  const { language, theme, setLanguage, setTheme } = useAppStore();

  const themes: {
    id: OfficeTheme;
    label: string;
    Illustration: React.ComponentType<any>;
  }[] = [
    {
      id: "theme-white",
      label: t("Modern Light"),
      Illustration: Illustration.ModernLight,
    },
    {
      id: "theme-night",
      label: t("Modern Dark"),
      Illustration: Illustration.ModernDark,
    },
    {
      id: "theme-light",
      label: t("Light"),
      Illustration: Illustration.Light,
    },
    {
      id: "theme-dark",
      label: t("Dark"),
      Illustration: Illustration.Dark,
    },
    {
      id: "theme-classic-light",
      label: t("Classic Light"),
      Illustration: Illustration.ClassicLight,
    },
    {
      id: "theme-contrast-dark",
      label: t("High Contrast"),
      Illustration: Illustration.ContrastDark,
    },
  ];

  const handleThemeChange = (newTheme: OfficeTheme) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-theme");
      localStorage.removeItem("ui-theme-id");

      const themeValue = isDarkTheme(newTheme) ? "dark" : "light";
      document.cookie = `theme=${themeValue}; path=/`;
    }
    setTheme(newTheme);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("Settings")}</h1>
        <p className="text-text-secondary">
          {t("Configure your preferred language and editor theme.")}
        </p>
      </div>

      <div className="space-y-8">
        {/* Language Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Globe className="w-5 h-5 text-primary" />
            <h2>{t("Language")}</h2>
          </div>
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as Language)}
          >
            <SelectTrigger className="w-80">
              <SelectValue placeholder={t("Select language")}>
                {getLanguageLabel(language)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sortedLanguages.map((code) => (
                <SelectItem
                  key={code}
                  value={code}
                  textValue={`${code} ${getLanguageLabel(code)}`}
                >
                  <span className="flex flex-col">
                    <span className="font-semibold">
                      {getLanguageLabel(code)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {code === LocaleExtend.Auto ? "auto" : code}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Theme Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Palette className="w-5 h-5 text-primary" />
            <h2>{t("Editor Theme")}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={cn(
                  "flex flex-col gap-3 p-3 rounded-xl border transition-all text-left group",
                  theme === t.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-md"
                    : "border-border hover:border-primary/30 hover:bg-sidebar-hover",
                )}
              >
                <div
                  className={cn(
                    "w-full aspect-5/3 rounded-lg border border-border/50 shadow-inner overflow-hidden flex items-center justify-center p-0 bg-secondary/10",
                  )}
                >
                  <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                    <t.Illustration className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {t.label}
                  </span>
                  {theme === t.id && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="p-6 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl">
        <p className="text-sm text-yellow-800 dark:text-yellow-200/80 leading-relaxed">
          {t(
            "Changing these settings will affect the OnlyOffice editor interface. Some changes may require reloading the editor to take full effect.",
          )}
        </p>
      </div>
    </div>
  );
}
