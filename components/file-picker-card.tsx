"use client";

import { Upload, FileText, FolderOpen, Download } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useExtracted } from "next-intl";

interface FilePickerCardProps {
  onFileSelect?: (file: File) => void;
  onFileSelectWithHandle?: (file: File, handle?: FileSystemFileHandle) => void;
  accept?: string;
}

export function FilePickerCard({
  onFileSelect,
  onFileSelectWithHandle,
  accept = ".docx,.doc,.xlsx,.xls,.pptx,.ppt,.pdf",
}: FilePickerCardProps) {
  const t = useExtracted();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [supportsFileSystemAPI, setSupportsFileSystemAPI] = useState(false);

  // Check if File System Access API is supported
  useEffect(() => {
    if (typeof window !== "undefined" && "showOpenFilePicker" in window) {
      setSupportsFileSystemAPI(true);
    }
  }, []);

  const handleClick = async () => {
    // Prefer File System Access API if available
    if (supportsFileSystemAPI) {
      try {
        // @ts-ignore - File System Access API types
        const [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: "Office Documents",
              accept: {
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
                "application/msword": [".doc"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  [".xlsx"],
                "application/vnd.ms-excel": [".xls"],
                "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                  [".pptx"],
                "application/vnd.ms-powerpoint": [".ppt"],
                "application/pdf": [".pdf"],
              },
            },
          ],
          multiple: false,
        });

        const file = await fileHandle.getFile();
        if (file) {
          if (onFileSelectWithHandle) {
            onFileSelectWithHandle(file, fileHandle);
          } else if (onFileSelect) {
            onFileSelect(file);
          }
        }
        return;
      } catch (err: any) {
        // If the user cancelled the picker, don't fallback to the regular input
        if (err.name === "AbortError") return;
        console.warn("File System Access API error, falling back:", err);
      }
    }

    // Fallback to regular file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Regular file input doesn't provide handle
      if (onFileSelectWithHandle) {
        onFileSelectWithHandle(file, undefined);
      } else if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!e.dataTransfer) return;

    // 同步获取文件和项目，防止异步后 DataTransfer 被浏览器清除
    const files = Array.from(e.dataTransfer.files);
    const items = Array.from(e.dataTransfer.items);

    if (items.length > 0 && items[0].kind === "file") {
      const item = items[0];
      try {
        // @ts-ignore
        const handle = await (item as any).getAsFileSystemHandle?.();
        if (handle && handle.kind === "file") {
          const file = files[0];
          if (file) {
            if (onFileSelectWithHandle) {
              onFileSelectWithHandle(file, handle);
            } else if (onFileSelect) {
              onFileSelect(file);
            }
            return;
          }
        }
      } catch (err) {
        console.log("Could not get FileSystemHandle from drag:", err);
      }
    }

    // 回退到常规文件对象
    const fallbackFile = files[0];
    if (fallbackFile) {
      if (onFileSelectWithHandle) {
        onFileSelectWithHandle(fallbackFile, undefined);
      } else if (onFileSelect) {
        onFileSelect(fallbackFile);
      }
    }
  };

  // Handle File System Access API folder picker
  const handleFolderPick = async (
    startIn: "documents" | "desktop" | "downloads",
  ) => {
    if (!supportsFileSystemAPI) return;

    try {
      // @ts-ignore - File System Access API types
      const [fileHandle] = await window.showOpenFilePicker({
        startIn,
        types: [
          {
            description: "Office Documents",
            accept: {
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
              "application/msword": [".doc"],
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
              "application/vnd.ms-excel": [".xls"],
              "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                [".pptx"],
              "application/vnd.ms-powerpoint": [".ppt"],
              "application/pdf": [".pdf"],
            },
          },
        ],
        multiple: false,
      });

      const file = await fileHandle.getFile();
      if (file) {
        // Prefer the new callback with handle, fallback to old one
        if (onFileSelectWithHandle) {
          onFileSelectWithHandle(file, fileHandle);
        } else if (onFileSelect) {
          onFileSelect(file);
        }
      }
    } catch (err) {
      // User cancelled or error occurred
      console.log("File picker cancelled or error:", err);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          w-full flex flex-col items-center justify-center p-6 
          bg-linear-to-br from-primary/5 to-primary/10
          border-[3px] border-dashed rounded-2xl 
          transition-all duration-300 group cursor-pointer
          hover:shadow-lg hover:shadow-primary/10
          ${
            isDragOver
              ? "border-primary bg-primary/20 scale-[1.02]"
              : "border-primary/30 hover:border-primary/60"
          }
        `}
      >
        <div
          className={`
          w-20 h-20 rounded-2xl flex items-center justify-center 
          transition-all duration-300 mb-4
          ${
            isDragOver
              ? "bg-primary scale-110 rotate-12"
              : "bg-primary/10 group-hover:bg-primary group-hover:scale-110"
          }
        `}
        >
          <Upload
            className={`
            w-9 h-9 transition-colors duration-300
            ${isDragOver ? "text-white" : "text-primary group-hover:text-white"}
          `}
          />
        </div>

        <div className="text-center w-full">
          <h3 className="text-lg font-bold mb-1.5 text-foreground">
            {isDragOver ? t("Drop your file here") : t("Choose a file")}
          </h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto mb-1 leading-relaxed">
            {t(
              "Drag and drop your Office document here, or click to browse from your computer",
            )}
          </p>
          <p className="text-[10px] text-text-secondary/70 mb-4">
            {t("Supports: DOCX, DOC, XLSX, XLS, PPTX, PPT, PDF")}
          </p>

          {/* Quick access buttons for File System Access API */}
          {supportsFileSystemAPI && false && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFolderPick("documents");
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/80 border border-border/50 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium group shadow-sm"
              >
                <FileText className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                <span className="text-gray-700 group-hover:text-blue-700">
                  {t("Docs")}
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFolderPick("desktop");
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/80 border border-border/50 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-sm font-medium group shadow-sm"
              >
                <FolderOpen className="w-4 h-4 text-green-600 group-hover:text-green-700" />
                <span className="text-gray-700 group-hover:text-green-700">
                  {t("Desktop")}
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFolderPick("downloads");
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/80 border border-border/50 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all text-sm font-medium group shadow-sm"
              >
                <Download className="w-4 h-4 text-orange-600 group-hover:text-orange-700" />
                <span className="text-gray-700 group-hover:text-orange-700">
                  {t("Downloads")}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
