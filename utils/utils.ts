import { type OfficeTheme } from "@/utils/editor/types";

export function isDarkTheme(theme: OfficeTheme): boolean {
  return (
    theme === "theme-dark" ||
    theme === "theme-night" ||
    theme === "theme-contrast-dark"
  );
}
