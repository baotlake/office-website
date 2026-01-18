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
import { useAppStore, isDarkTheme } from "@/store";
import { addRecentFile } from "@/utils/recent-files";
import { cn } from "@/lib/utils";

type Tab = "open" | "template" | "about" | "settings";

function HomeContent() {
  const router = useRouter();
  const t = useExtracted();
  const [activeTab, setActiveTabState] = useState<Tab>("open");
  const { server, theme } = useAppStore();
  const isDark = isDarkTheme(theme);

  // Sync dark mode class to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

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
        "flex flex-col h-screen overflow-hidden font-sans transition-colors duration-500",
        isDark ? "bg-[#0b0b0b] text-white" : "bg-muted text-slate-900",
      )}
    >
      <Header></Header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab: Tab) => setActiveTab(tab)}
          getNewUrl={getNewUrl}
        />

        {/* Main Content Area as a Card */}
        <main
          className={cn(
            "flex-1 mb-3 rounded-2xl overflow-hidden flex flex-col transition-colors duration-500 shadow-xl",
            isDark ? "bg-[#141414] border border-white/5" : "bg-white",
          )}
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-6xl mx-auto w-full">
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
        <div className="w-3"></div>
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
