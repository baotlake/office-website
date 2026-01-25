import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { I18nProvider } from "@/components/i18n-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office by ZIZIYI - Preview & Edit Office Documents",
  description:
    "A local Office file preview and editing application. Open, view, and edit Word, Excel, and PowerPoint documents directly in your browser.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  const preload = () => {
    const theme = document.cookie.match(/theme=([^;]+)/)?.[1] || "";
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = dark && theme != "light";
    document.documentElement.classList.toggle("dark", isDark);
  };

  return (
    <html suppressHydrationWarning>
      <head>
        <script>{`(${preload.toString()})()`}</script>
      </head>
      <body>
        <I18nProvider initialMessages={messages}>{children}</I18nProvider>
      </body>
    </html>
  );
}
