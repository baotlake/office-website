"use client";

import { use, useLayoutEffect, useRef, useEffect } from "react";
import { useAppStore, useResolvedLanguage } from "@/store";
import { getDocumentType } from "@/utils/editor/utils";
import io, { MockSocket } from "@/utils/editor/socket";
import { createXHRProxy } from "@/utils/editor/xhr";
import { DocEditor } from "@/utils/editor/types";

const APP_ROOT = "/v9.3.0.24-1";

export default function Page({ params }: { params: Promise<{}> }) {
  const server = useAppStore((state) => state.server);
  const language = useResolvedLanguage();
  const theme = useAppStore((state) => state.theme);
  const isDirty = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useLayoutEffect(() => {
    const apiUrl = APP_ROOT + "/web-apps/apps/api/documents/api.js";
    const searchParams = new URLSearchParams(window.location.search);

    const fileId = searchParams.get("fileId");
    const newDoc = searchParams.get("new");

    if (!fileId && newDoc) {
      server.openNew(newDoc);
    }

    const doc = server.getDocument();
    const user = server.getUser();
    const documentType = getDocumentType(doc.fileType);
    console.log("editor: ", doc, user, documentType);

    let editor: DocEditor | null = null;

    MockSocket.on("connect", server.handleConnect);
    MockSocket.on("disconnect", server.handleDisconnect);

    const onAppReady = () => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[name="frameEditor"]',
      );
      const win = iframe?.contentWindow as typeof window;
      const doc = iframe?.contentDocument;
      if (!doc || !win) {
        throw new Error("Iframe not loaded");
      }

      const XHR = createXHRProxy(win.XMLHttpRequest);
      const _Worker = win.Worker;

      XHR.use((request: Request) => {
        return server.handleRequest(request);
      });
      Object.assign(win, {
        io: io,
        XMLHttpRequest: XHR,
        Worker: function (url: string, options?: WorkerOptions) {
          const u = new URL(url, location.origin);
          return new _Worker(
            u.href.replace(u.origin, location.origin),
            options,
          );
        },
      });

      const script = doc.createElement("script");
      script.src = apiUrl;
      doc.body.appendChild(script);
    };

    const createEditor = () => {
      editor = new window.DocsAPI.DocEditor("placeholder", {
        document: {
          fileType: doc.fileType,
          key: doc.key,
          title: doc.title,
          url: doc.url,

          permissions: {
            // TODO: fix PDF edit
            edit: doc.fileType != "pdf",
            chat: false,
            rename: true,
            protect: true,
            review: false,
            // TODO: fix export to PDF
            print: false,
          },
        },
        documentType: documentType,
        editorConfig: {
          lang: language,
          // canCoAuthoring: true,
          // type: "desktop",
          coEditing: {
            mode: "fast",
            change: false, // disable user switching to real-time mode
          },
          user: {
            ...user,
          },

          // callbackUrl: "https://example.com/url-to-callback.ashx",
          customization: {
            // help: false,
            // about: false,
            // hideRightMenu: true,
            uiTheme: theme,
            features: {
              spellcheck: {
                change: false,
              },
            },
            // anonymous: {
            //   request: false,
            //   label: "Guest",
            // },
            logo: {
              image: location.origin + "/logo-name_black.svg",
              imageDark: location.origin + "/logo-name_white.svg",
              url: location.origin,
              // visible: false,
            },
          },
        },
        events: {
          onAppReady: async (e: unknown) => {
            console.log("App ready", e, editor);
            onAppReady();
          },
          onDocumentReady: (e: unknown) => {
            console.log("Document ready", e);
          },
          onDocumentStateChange: (e: { data: boolean; target: unknown }) => {
            console.log("Document state change", e);
            if (e.data) {
              isDirty.current = true;
            }
          },
          onRequestOpen: (e: unknown) => {
            console.log("onRequestOpen", e);
          },
          onError: (e: unknown) => {
            console.log("Error", e);
          },
          onInfo: (e: unknown) => {
            console.log("Info", e);
          },
          onWarning: (e: unknown) => {
            console.log("onWarning", e);
          },
          onRequestSaveAs: (e: unknown) => {
            console.log("onRequestSaveAs", e);
          },
          onSaveDocument: (e: unknown) => {
            console.log("onSaveDocument", e);
            isDirty.current = false;
          },
          onDownloadAs: (e: unknown) => {
            console.log("onDownloadAs", e);
          },
          onSave: (e: unknown) => {
            console.log("onSave", e);
            isDirty.current = false;
          },
          writeFile: async (e: unknown) => {
            console.log("writeFile", e);
            isDirty.current = false;
          },
        },
        width: "100%",
        height: "100%",
      });
      Object.assign(window, {
        editor,
      });
      return editor;
    };

    const loadEditor = async () => {
      if (window.DocsAPI && window.DocsAPI.DocEditor) {
        createEditor();
      }
      let script = document.querySelector<HTMLScriptElement>(
        `script[src="${apiUrl}"]`,
      );
      if (!script) {
        script = document.createElement("script");
        script.src = apiUrl;
        document.head.appendChild(script);
      }
      script.onload = () => {
        createEditor();
      };
      script.onerror = (e) => {
        console.error("Failed to load DocsAPI script", e);
      };
    };

    loadEditor();

    return () => {
      MockSocket.off("connect", server.handleConnect);
      MockSocket.off("disconnect", server.handleDisconnect);
      editor?.destroyEditor?.();
    };
  }, []);

  return (
    <div>
      <div className="w-screen h-screen">
        <div id="placeholder">
          <iframe
            className="w-0 h-0 hidden"
            src={APP_ROOT + "/web-apps/apps/api/documents/preload.html"}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
