"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useExtracted } from "next-intl";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { OpenView } from "@/components/open-view";
import { TemplateView } from "@/components/template-view";
import { AboutView } from "@/components/about-view";
import { SettingsView } from "@/components/settings-view";
import { DragDropOverlay } from "@/components/drag-drop-overlay";
import { useAppStore } from "@/store";
import { addRecentFile } from "@/utils/recent-files";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import { isDarkTheme } from "@/utils/utils";

type Tab = "open" | "template" | "about" | "settings";

function HomeContent() {
  const router = useRouter();
  const t = useExtracted();
  const [activeTab, setActiveTabState] = useState<Tab>("open");
  const { server, theme } = useAppStore();

  useEffect(() => {
    const isDark = isDarkTheme(theme);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab") as Tab;
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    const u = new URL(location.href);
    u.searchParams.set("tab", tab);
    router.replace(u.toString());
  };

  const handleFileSelect = useCallback(
    async (file: File, handle?: FileSystemFileHandle) => {
      if (handle) {
        try {
          await addRecentFile(handle);
        } catch (err) {
          console.error("Failed to save dropped file to recent:", err);
        }
      }
      const { id } = await server.open(file);
      router.push(`/editor`);
    },
    [router, server],
  );

  const getNewUrl = (type: string) => `/editor?new=${type}`;

  return (
    <div
      className={cn(
        "flex flex-col h-screen overflow-hidden font-sans transition-colors duration-500 relative",
        "bg-muted text-slate-900 dark:bg-[#0b0b0b] dark:text-white",
      )}
    >
      {/* Background Decorative Elements for Dark Mode */}
      <div className="hidden dark:block absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/6 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/3 rounded-full blur-[100px]"></div>
      </div>

      <Header></Header>
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row relative z-10">
        <div className="hidden md:flex">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab: Tab) => setActiveTab(tab)}
            getNewUrl={getNewUrl}
          />
        </div>

        {/* Main Content Area as a Card */}
        <main
          className={cn(
            "flex-1 md:mb-3 rounded-none md:rounded-2xl overflow-hidden flex flex-col transition-colors duration-500 shadow-none md:shadow-xl relative",
            "backdrop-blur-3xl bg-white dark:bg-[#141414]/60  dark:md:border dark:md:border-white/10",
          )}
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pb-24 md:pb-8">
              {activeTab === "open" && (
                <OpenView
                  setActiveTab={(tab) => setActiveTab(tab as Tab)}
                  onFileSelect={handleFileSelect}
                  getNewUrl={getNewUrl}
                />
              )}
              {activeTab === "template" && <TemplateView />}
              {activeTab === "about" && <AboutView />}
              {activeTab === "settings" && <SettingsView />}
            </div>
          </div>
        </main>
        <div className="hidden md:block w-3"></div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileNav
          activeTab={activeTab}
          setActiveTab={(tab: Tab) => setActiveTab(tab)}
        />
      </div>

      {/* Global Drag and Drop Overlay */}
      <DragDropOverlay onFileDrop={handleFileSelect} />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
