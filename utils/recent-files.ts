"use client";

import { openDB, DBSchema, IDBPDatabase } from "idb";

// Recent file record structure for UI display
export interface RecentFileRecord {
  path: string; // File path as the unique key
  name: string;
  type: string;
  handle: FileSystemFileHandle;
  updatedAt: number;
}

// Stored structure in IndexedDB
interface StoredFileHandle {
  handle: FileSystemFileHandle;
  updatedAt: number;
}

interface FileHandlesDB extends DBSchema {
  "filehandles-store": {
    key: string; // file path
    value: StoredFileHandle;
  };
}

const DB_NAME = "office-db";
const DB_VERSION = 2; // Incremented version for schema update
const STORE_NAME = "filehandles-store";
const MAX_RECENT_FILES = 20;

let dbInstance: IDBPDatabase<FileHandlesDB> | null = null;

async function getDB(): Promise<IDBPDatabase<FileHandlesDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<FileHandlesDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(STORE_NAME);
      }
      // In version 2, we added updatedAt.
      // Existing data will have undefined updatedAt, which we handle during retrieval.
    },
  });

  return dbInstance;
}

// Get file path from FileSystemFileHandle
async function getFilePath(handle: FileSystemFileHandle): Promise<string> {
  return handle.name;
}

// Add or update a recent file with FileHandle
export async function addRecentFile(
  handle: FileSystemFileHandle
): Promise<RecentFileRecord> {
  const db = await getDB();
  const path = await getFilePath(handle);
  const updatedAt = Date.now();

  // Store handle and timestamp
  await db.put(STORE_NAME, { handle, updatedAt }, path);

  // Clean up old records if exceeding limit
  const allRecords = await getRecentFiles();
  if (allRecords.length > MAX_RECENT_FILES) {
    // getRecentFiles is already sorted by updatedAt desc
    // So we remove the ones at the end
    const toDelete = allRecords.slice(MAX_RECENT_FILES);
    for (const rec of toDelete) {
      await db.delete(STORE_NAME, rec.path);
    }
  }

  const file = await handle.getFile();
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  return {
    path,
    name: file.name,
    type: ext,
    handle,
    updatedAt,
  };
}

// Get all recent files, sorted by updatedAt desc
export async function getRecentFiles(): Promise<RecentFileRecord[]> {
  const db = await getDB();
  const keys = await db.getAllKeys(STORE_NAME);
  const records: RecentFileRecord[] = [];

  for (const key of keys) {
    const stored = await db.get(STORE_NAME, key);
    if (stored && stored.handle) {
      const name = stored.handle.name;
      const ext = name.split(".").pop()?.toLowerCase() || "";
      records.push({
        path: key as string,
        name,
        type: ext,
        handle: stored.handle,
        updatedAt: stored.updatedAt || 0, // Fallback for old records
      });
    }
  }

  // Sort by updatedAt descending (newest first)
  return records.sort((a, b) => b.updatedAt - a.updatedAt);
}

// Remove a recent file by path
export async function removeRecentFile(path: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, path);
}

// Clear all recent files
export async function clearRecentFiles(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

// Request permission and get file from handle
export async function openRecentFile(
  record: RecentFileRecord
): Promise<File | null> {
  if (!record.handle) {
    return null;
  }

  try {
    const handle = record.handle as any;
    if (handle.queryPermission) {
      const permission = await handle.queryPermission({ mode: "read" });
      if (permission === "prompt") {
        const newPermission = await handle.requestPermission({ mode: "read" });
        if (newPermission !== "granted") {
          return null;
        }
      } else if (permission !== "granted") {
        return null;
      }
    }

    // Update updatedAt timestamp in DB
    const db = await getDB();
    const updatedAt = Date.now();
    await db.put(STORE_NAME, { handle: record.handle, updatedAt }, record.path);

    // Get the file
    return await record.handle.getFile();
  } catch (error) {
    console.error("Failed to open recent file:", error);
    await removeRecentFile(record.path);
    return null;
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Format relative time for display
export function formatRelativeTime(timestamp: number): string {
  if (timestamp === 0) return "Unknown";

  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

  return new Date(timestamp).toLocaleDateString();
}
