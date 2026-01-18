"use client";

import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { useEffect, useState, ReactNode } from "react";
import { useResolvedLanguage } from "@/store";
import { Locale } from "@ziziyi/utils";

// Cache for loaded messages
const messagesCache: Partial<Record<Locale, AbstractIntlMessages>> = {};

// Load messages for a locale (with fallback to English)
async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  if (messagesCache[locale]) {
    return messagesCache[locale]!;
  }

  try {
    const messages = (await import(`@/messages/${locale}.json`)).default;
    messagesCache[locale] = messages;
    return messages;
  } catch {
    // Fallback to English if locale file doesn't exist
    if (locale !== Locale.EN) {
      console.warn(
        `Messages for locale "${locale}" not found, falling back to English`,
      );
      return loadMessages(Locale.EN);
    }
    // Return empty object if even English fails
    return {};
  }
}

interface I18nProviderProps {
  children: ReactNode;
  initialMessages: AbstractIntlMessages;
}

/**
 * Client-side i18n provider that switches language based on store setting.
 * Dynamically loads message files when language changes.
 */
export function I18nProvider({ children, initialMessages }: I18nProviderProps) {
  const locale = useResolvedLanguage();
  const [messages, setMessages] =
    useState<AbstractIntlMessages>(initialMessages);
  const [currentLocale, setCurrentLocale] = useState<Locale>(Locale.EN);

  useEffect(() => {
    // Load messages when locale changes
    loadMessages(locale).then((loadedMessages) => {
      setMessages(loadedMessages);
      setCurrentLocale(locale);
    });
  }, [locale]);

  return (
    <NextIntlClientProvider locale={currentLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
