import { Locale } from "@ziziyi/utils";
import { getRequestConfig } from "next-intl/server";
import { getTimeZone } from "./config";

const defaultLocale = Locale.EN;

export default getRequestConfig(async () => {
  // const locale = (await requestLocale) || defaultLocale;
  const locale = defaultLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: getTimeZone(locale),
  };
});
