"use client";

import { useEffect, useRef, useState } from "react";
import { useExtracted } from "next-intl";

interface DragDropOverlayProps {
  onFileDrop: (file: File, handle?: FileSystemFileHandle) => void;
}

export function DragDropOverlay({ onFileDrop }: DragDropOverlayProps) {
  const t = useExtracted();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Check if dragging files
      if (e.dataTransfer?.types.includes("Files")) {
        dragCounter.current++;
        if (dragCounter.current === 1) {
          setIsDragging(true);
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounter.current = 0;
      setIsDragging(false);

      if (!e.dataTransfer) return;

      // 同步获取文件和项目，因为异步之后 dataTransfer 可能会被清除
      const files = Array.from(e.dataTransfer.files);
      const items = Array.from(e.dataTransfer.items);

      if (items.length > 0 && items[0].kind === "file") {
        const item = items[0];
        try {
          // 异步获取句柄
          // @ts-ignore
          const handle = await (item as any).getAsFileSystemHandle?.();
          const file = files[0]; // 使用同步获取的文件列表

          if (file) {
            onFileDrop(file, handle?.kind === "file" ? handle : undefined);
            return;
          }
        } catch (err) {
          console.error("Failed to get file handle on drop:", err);
        }
      }

      // 如果获取句柄失败或不支持，使用常规文件对象
      if (files.length > 0) {
        onFileDrop(files[0]);
      }
    };

    // Add event listeners to document
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);

      // Reset state on cleanup to prevent getting stuck
      dragCounter.current = 0;
      setIsDragging(false);
    };
  }, [onFileDrop]);

  if (!isDragging) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none animate-fadeIn">
        <div className="flex flex-col items-center gap-8 animate-scaleIn">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl animate-pulse"></div>
            <svg
              className="w-32 h-32 text-white relative z-10 drop-shadow-2xl animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {t("Drop to Open")}
            </h3>
            <p className="text-2xl text-white/90 drop-shadow">
              {t("Word, Excel, PowerPoint & more")}
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
