import { Locale } from "@ziziyi/utils";

export const timeZones: Record<string, string> = {
  [Locale.ZH_CN]: "Asia/Shanghai",
  [Locale.ZH_TW]: "Asia/Taipei",
  [Locale.JA]: "Asia/Tokyo",
  [Locale.KO]: "Asia/Seoul",
  [Locale.EN]: "America/Los_Angeles",
};

export function getTimeZone(locale: string): string {
  return timeZones[locale] || "UTC";
}
