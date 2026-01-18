/**
 * X2T Converter with Web Worker Support
 *
 * This module provides a main-thread proxy that delegates heavy conversion
 * operations to a Web Worker, preventing UI blocking.
 */

import { X2tConvertParams, X2tConvertResult } from "./types";

interface PendingMessage {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

interface WorkerResponse {
  id: number;
  type: string;
  payload?: any;
  error?: string;
}

export class X2tConverter {
  private worker: Worker | null = null;
  private initPromise: Promise<void> | null = null;
  private messageId = 0;
  private pendingMessages = new Map<number, PendingMessage>();

  constructor() {
    // Auto-initialize worker on construction
    if (globalThis.Worker) {
      this.init();
    }
  }

  /**
   * Get next unique message ID
   */
  private getNextId(): number {
    return ++this.messageId;
  }

  /**
   * Send message to worker and wait for response
   */
  private sendMessage<T>(type: string, payload?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error("Worker not initialized"));
        return;
      }

      const id = this.getNextId();
      this.pendingMessages.set(id, { resolve, reject });

      // For convert messages, use Transferable if payload contains ArrayBuffer
      if (type === "convert" && payload?.data instanceof ArrayBuffer) {
        this.worker.postMessage({ id, type, payload }, [payload.data]);
      } else {
        this.worker.postMessage({ id, type, payload });
      }
    });
  }

  /**
   * Handle worker response messages
   */
  private handleWorkerMessage = (event: MessageEvent<WorkerResponse>) => {
    const { id, type, payload, error } = event.data;

    // Skip ready message
    if (type === "ready") {
      console.log("[X2tConverter] Worker ready");
      return;
    }

    const pending = this.pendingMessages.get(id);
    if (!pending) return;

    this.pendingMessages.delete(id);

    if (type === "error") {
      pending.reject(new Error(error || "Unknown worker error"));
    } else {
      pending.resolve(payload);
    }
  };

  /**
   * Handle worker errors
   */
  private handleWorkerError = (error: ErrorEvent) => {
    console.error("[X2tConverter] Worker error:", error);

    // Reject all pending messages
    for (const [id, pending] of this.pendingMessages) {
      pending.reject(new Error(`Worker error: ${error.message}`));
      this.pendingMessages.delete(id);
    }
  };

  /**
   * Initialize the worker (automatically called on construction)
   */
  public init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise<void>((resolve, reject) => {
      try {
        // Create worker using Next.js compatible syntax
        // Worker auto-initializes x2t internally
        this.worker = new Worker(new URL("./x2t.worker.ts", import.meta.url));

        // Set up message handlers
        this.worker.onmessage = this.handleWorkerMessage;
        this.worker.onerror = this.handleWorkerError;

        console.log("[X2tConverter] Worker created");
        resolve();
      } catch (err) {
        this.initPromise = null;
        reject(err);
      }
    });

    return this.initPromise;
  }

  /**
   * Convert document from one format to another
   */
  public async convert({
    data,
    fileFrom,
    fileTo,
    media,
    fonts,
    themes,
  }: X2tConvertParams): Promise<X2tConvertResult> {
    await this.init();

    const cloneMap = (map?: { [key: string]: Uint8Array }) => {
      if (!map) return undefined;
      return Object.fromEntries(
        Object.entries(map).map(([key, value]) => [key, value.slice(0)])
      );
    };

    // Clone ArrayBuffer since it will be transferred
    const dataClone = data.slice(0);

    const payload = {
      data: dataClone,
      fileFrom,
      fileTo,
      media: cloneMap(media),
      fonts: cloneMap(fonts),
      themes: cloneMap(themes),
    };
    return this.sendMessage<X2tConvertResult>("convert", payload);
  }

  /**
   * Terminate the worker and release resources
   */
  public terminate(): void {
    if (this.worker) {
      // Reject all pending messages
      for (const [id, pending] of this.pendingMessages) {
        pending.reject(new Error("Worker terminated"));
        this.pendingMessages.delete(id);
      }

      this.worker.terminate();
      this.worker = null;
      this.initPromise = null;
      console.log("[X2tConverter] Worker terminated");
    }
  }

  /**
   * Check if worker is initialized
   */
  public get isInitialized(): boolean {
    return this.worker !== null && this.initPromise !== null;
  }
}

// Default converter instance
export const converter = new X2tConverter();
