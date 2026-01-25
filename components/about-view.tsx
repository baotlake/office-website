"use client";

import { Github, Info, ShieldCheck, Heart } from "lucide-react";
import { useExtracted } from "next-intl";
import { useAppStore } from "@/store";
import { isDarkTheme } from "@/utils/utils";

export function AboutView() {
  const t = useExtracted();
  const { theme } = useAppStore();
  const isDark = isDarkTheme(theme);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-4">
          <Info className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          {t("About Web Office")}
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          {t(
            "A modern, high-performance web-based office suite designed for the future of productivity.",
          )}
        </p>

        <div className="pt-6 flex justify-center">
          <a
            href="https://www.producthunt.com/products/serverless-web-office-by-ziziyi?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-serverless-web-office-by-ziziyi"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="Serverless Web Office by ZIZIYI - Serverless Web Office: Private, In-Browser editing via WASM. | Product Hunt"
              width="250"
              height="54"
              src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1067951&theme=${
                isDark ? "dark" : "light"
              }&t=1769359248898`}
            />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="p-8 bg-white/5 dark:bg-white/5 border border-border dark:border-white/10 rounded-3xl hover:border-primary/50 dark:hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group">
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
            <Github className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">{t("Open Source")}</h3>
          <p className="text-text-secondary dark:text-slate-400 text-sm leading-relaxed mb-6">
            {t(
              "We believe in the power of community. The source code for this project is available on GitHub for everyone to view, contribute, and improve.",
            )}
          </p>
          <a
            href="https://github.com/nicepkg/nice-web-office"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
          >
            {t("View on GitHub")}
          </a>
        </div>

        <div className="p-8 bg-white/5 dark:bg-white/5 border border-border dark:border-white/10 rounded-3xl hover:border-primary/50 dark:hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group">
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">
            {t("Powered by OnlyOffice")}
          </h3>
          <p className="text-text-secondary dark:text-slate-400 text-sm leading-relaxed">
            {t(
              "This project is built upon the robust foundation of OnlyOffice open-source code. We strictly adhere to and support OnlyOffice's open-source license, ensuring a sustainable ecosystem for document processing.",
            )}
          </p>
        </div>
      </div>

      <div className="p-10 bg-linear-to-br from-primary/10 to-orange-500/10 dark:from-primary/15 dark:to-orange-500/5 border border-primary/20 dark:border-primary/30 rounded-3xl text-center space-y-6 shadow-lg shadow-primary/5">
        <Heart className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto fill-red-500 dark:fill-red-400 animate-pulse" />
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{t("Our Commitment")}</h3>
          <p className="text-text-secondary dark:text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            {t(
              "Our goal is to provide a seamless, local-first office experience while maintaining the highest standards of compatibility and open-source compliance.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
