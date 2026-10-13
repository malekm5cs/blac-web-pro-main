import type { UIMessage } from "ai";

export type Thread = { id: string; title: string; updatedAt: number; messages: UIMessage[] };

const KEY = "blac-chat-threads";

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(threads.slice(0, 30)));
  } catch {
    /* storage full */
  }
}

export function newThread(): Thread {
  return { id: crypto.randomUUID().slice(0, 8), title: "New conversation", updatedAt: Date.now(), messages: [] };
}

export function titleFrom(messages: UIMessage[]) {
  const first = messages.find((m) => m.role === "user");
  const text = first?.parts.find((p) => p.type === "text");
  const t = text && "text" in text ? text.text : "";
  return t ? t.slice(0, 40) : "New conversation";
}
