/// <reference lib="webworker" />

import { AvsFileType, X2tConvertParams, X2tConvertResult } from "./types";

/**
 * X2T Converter Web Worker
 *
 * This worker handles CPU-intensive document conversion operations
 * off the main thread to prevent UI blocking.
 */

/* eslint-disable no-restricted-globals */

// Base URL for x2t files - hardcoded since blob URL workers can't determine origin
const BASE_URL = self.location.origin + "/x2t-1/";
// const BASE_URL = self.location.origin + "/wasm/x2t/";

let x2t: any = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize x2t module in Worker context
 */
async function initX2t(): Promise<void> {
  if (x2t) return;
  // self.wasmBinaryFile = BASE_URL + "x2t.wasm";

  const scriptUrl = BASE_URL + "x2t.js";

  // fix .wasm loading
  Object.assign(self, {
    __filename: BASE_URL,
  });

  // Load x2t script in Worker context
  importScripts(scriptUrl);

  x2t = (self as any).Module;

  // Wait for WASM runtime initialization
  await new Promise<void>((resolve) => {
    x2t.onRuntimeInitialized = () => resolve();
  });

  // Create working directories
  try {
    x2t.FS.mkdir("/working");
    x2t.FS.mkdir("/working/media");
    x2t.FS.mkdir("/working/fonts");
    x2t.FS.mkdir("/working/themes");
  } catch (err) {
    // Directories may already exist
    console.error("[x2t.worker] mkdir error:", err);
  }

  console.log("[x2t.worker] Initialized successfully");
}

/**
 * Ensure x2t is initialized before conversion
 */
async function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = initX2t();
  }
  return initPromise;
}

// Auto-initialize on worker creation
ensureInit().catch((err) => {
  console.error("[x2t.worker] Auto-init failed:", err);
});

/**
 * Clean up temporary files after conversion
 */
function cleanupFiles(files: string[]): void {
  for (const file of files) {
    try {
      x2t.FS.unlink(file);
    } catch (err) {
      console.error(err);
    }
  }
  cleanMedia();
}

function cleanMedia() {
  try {
    const mediaFiles = x2t.FS.readdir("/working/media/");
    for (const file of mediaFiles) {
      if (file !== "." && file !== "..") {
        x2t.FS.unlink("/working/media/" + file);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Read media files from the working directory
 */
function readMedia(): { [key: string]: Uint8Array<ArrayBuffer> } {
  const media: { [key: string]: Uint8Array<ArrayBuffer> } = {};
  try {
    const files = x2t.FS.readdir("/working/media/");
    for (const file of files) {
      if (file !== "." && file !== "..") {
        const fileData = x2t.FS.readFile("/working/media/" + file, {
          encoding: "binary",
        });
        media[file] = fileData;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return media;
}

const xmlPath = "/working/params.xml";

function writeInputs({
  fileFrom,
  fileTo,
  formatFrom,
  formatTo,
  data,
  media,
}: X2tConvertParams) {
  const params = {
    m_sFileFrom: fileFrom,
    m_sThemeDir: "/working/themes",
    m_sFileTo: fileTo,
    m_nFormatFrom: formatFrom,
    m_nFormatTo: formatTo,
    m_bIsPDFA: formatTo === AvsFileType.AVS_FILE_CROSSPLATFORM_PDFA,
    m_bIsNoBase64: false,
    m_sFontDir: "/working/fonts/",
  };

  const content = Object.entries(params)
    .filter(([k, v]) => v)
    .reduce((a, [k, v]) => a + `<${k}>${v}</${k}>\n`, "");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<TaskQueueDataConvert
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
>
${content}
</TaskQueueDataConvert>`;

  x2t.FS.writeFile(xmlPath, xml);
  if (data) {
    x2t.FS.writeFile(fileFrom, new Uint8Array(data));
  }

  if (media) {
    cleanMedia();
    for (const [key, value] of Object.entries(media)) {
      try {
        x2t.FS.writeFile("/working/" + key, value);
      } catch (err) {
        console.error(key, err);
      }
    }
  }
}

/**
 * Convert document from one format to another
 */
async function convert({
  data,
  fileFrom,
  fileTo,
  formatFrom,
  formatTo,
  media,
  fonts,
  themes,
}: X2tConvertParams): Promise<X2tConvertResult> {
  const fromPath = "/working/" + fileFrom;
  const toPath = "/working/" + fileTo;
  const files = [fromPath, toPath, xmlPath];

  writeInputs({
    fileFrom: fromPath,
    fileTo: toPath,
    formatFrom,
    formatTo,
    data,
    media,
  });

  if (
    fileFrom.endsWith(".doc") ||
    formatFrom == AvsFileType.AVS_FILE_DOCUMENT_DOC
  ) {
    const viaPath = fromPath + ".docx";
    writeInputs({
      fileFrom: fromPath,
      fileTo: viaPath,
      data: null as never,
    });
    x2t.ccall("main1", ["number"], ["string"], [xmlPath]);
    writeInputs({
      fileFrom: viaPath,
      fileTo: toPath,
      data: null as never,
    });
    files.push(viaPath);
  }

  try {
    const pathInfo = x2t.FS.analyzePath(toPath);
    if (pathInfo.exists) {
      x2t.FS.unlink(toPath);
    }
  } catch (err) {}

  try {
    x2t.ccall("main1", ["number"], ["string"], [xmlPath]);
  } catch (e) {
    console.error("ccall", e);
  }

  // Read output file
  let output: Uint8Array<ArrayBuffer> | null = null;
  try {
    output = x2t.FS.readFile(toPath);
  } catch (e) {
    console.error(e);
  }

  // Read media files
  const outputMedia = readMedia();

  // Cleanup temporary files
  setTimeout(() => {
    cleanupFiles(files);
  });

  return { output, media: outputMedia };
}

// Message types
interface WorkerMessage {
  id?: number;
  type: "convert";
  payload?: any;
}

/**
 * Handle incoming messages from main thread
 */
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;

  try {
    switch (type) {
      case "convert": {
        // Ensure x2t is initialized before conversion
        await ensureInit();
        const result = await convert(payload);

        // Use Transferable objects for zero-copy transfer
        const transferables: Transferable[] = [];
        if (result.output) {
          transferables.push(result.output.buffer);
        }
        Object.values(result.media).forEach((m) =>
          transferables.push(m.buffer),
        );

        self.postMessage(
          { id, type: "convert:done", payload: result },
          { transfer: transferables },
        );
        break;
      }

      default:
        self.postMessage({
          id,
          type: "error",
          error: `Unknown message type: ${type}`,
        });
    }
  } catch (error) {
    self.postMessage({
      id,
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Signal that worker is ready
self.postMessage({ type: "ready" });
