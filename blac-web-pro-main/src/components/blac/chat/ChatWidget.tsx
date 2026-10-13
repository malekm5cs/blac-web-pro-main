import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from "ai";
import { History, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { openProjectInquiry } from "../ProjectInquiry";
import { setSoundEnabled } from "../Sound";
import { setTheme } from "../Theme";
import { loadThreads, newThread, saveThreads, titleFrom, type Thread } from "./threads";

const SUGGESTIONS = [
  "What services do you offer?",
  "Show me your work",
  "Help me draft a project brief",
  "Switch to light mode",
  "Turn on the ambience",
  "Start a project",
];

function SignalMark({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      <span className="absolute inset-0 rotate-45 border border-current" />
      <span className="size-1.5 rounded-full bg-current" />
    </span>
  );
}

function runClientTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "scroll_to_section": {
      const id = String(input["section"]);
      if (id === "top") window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      return `Scrolled to ${id}.`;
    }
    case "open_project_inquiry":
      openProjectInquiry();
      return "Inquiry panel opened.";
    case "set_ambience":
      setSoundEnabled(Boolean(input["on"]));
      return input["on"] ? "Ambience on." : "Ambience off.";
    case "set_theme":
      setTheme(input["theme"] === "light" ? "light" : "dark");
      return `Theme set to ${input["theme"]}.`;
    case "copy_to_clipboard":
      void navigator.clipboard?.writeText(String(input["text"] ?? ""));
      return "Copied to clipboard.";
    default:
      return "Unknown action.";
  }
}

function ChatWindow({ thread, onChange }: { thread: Thread; onChange: (m: UIMessage[]) => void }) {
  const { messages, sendMessage, status, stop, addToolOutput } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      if (toolCall.dynamic) return;
      const output = runClientTool(toolCall.toolName, (toolCall.input ?? {}) as Record<string, unknown>);
      void addToolOutput({ tool: toolCall.toolName as never, toolCallId: toolCall.toolCallId, output: output as never });
    },
    onError: (e) => toast.error(e.message || "Network error — please try again."),
  });
  const [text, setText] = useState("");
  const busy = status === "submitted" || status === "streaming";
  const changeRef = useRef(onChange);
  changeRef.current = onChange;

  useEffect(() => {
    if (status === "ready" || status === "error") changeRef.current(messages);
  }, [messages, status]);

  useEffect(() => {
    if (!busy) document.querySelector<HTMLTextAreaElement>("#signal-input")?.focus();
  }, [busy]);

  const send = (value: string) => {
    if (!value.trim() || busy) return;
    void sendMessage({ text: value });
    setText("");
  };

  const last = messages[messages.length - 1];
  const waiting = busy && (last?.role !== "assistant" || !last.parts.some((p) => p.type === "text" && p.text));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-5 px-4 py-5">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<SignalMark className="size-8 text-foreground" />}
              title="Ask SIGNAL anything"
              description="Services, timelines, briefs — or ask me to navigate, switch theme, or play the ambience."
            />
          ) : (
            messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent
                  className={
                    m.role === "user"
                      ? "group-[.is-user]:rounded-none group-[.is-user]:bg-foreground group-[.is-user]:text-background"
                      : "bg-transparent text-foreground"
                  }
                >
                  {m.parts.map((p, i) => {
                    if (p.type === "text")
                      return m.role === "assistant" ? (
                        <MessageResponse key={i}>{p.text}</MessageResponse>
                      ) : (
                        <p key={i} className="whitespace-pre-wrap text-sm">{p.text}</p>
                      );
                    if (p.type.startsWith("tool-") && "state" in p) {
                      const tp = p as Extract<typeof p, { toolCallId: string }> & { type: `tool-${string}` };
                      return (
                        <Tool key={i} defaultOpen={false} className="mb-0">
                          <ToolHeader type={tp.type as never} state={tp.state} title={tp.type.slice(5).replace(/_/g, " ")} />
                          <ToolContent>
                            <ToolInput input={tp.input} />
                            <ToolOutput output={"output" in tp ? (tp.output as never) : undefined} errorText={"errorText" in tp ? tp.errorText : undefined} />
                          </ToolContent>
                        </Tool>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}
          {waiting && <Shimmer className="font-mono text-[11px] tracking-[0.2em]">THINKING…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {messages.length === 0 && (
        <Suggestions className="px-4 pb-2">
          {SUGGESTIONS.map((s) => (
            <Suggestion key={s} suggestion={s} onClick={send} className="rounded-none font-mono text-[10px] tracking-[0.1em]" />
          ))}
        </Suggestions>
      )}

      <div className="border-t border-border p-3">
        <PromptInput onSubmit={(m) => send(m.text ?? "")} className="rounded-none">
          <PromptInputBody>
            <PromptInputTextarea
              id="signal-input"
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about services, or say “show me the work”…"
              className="min-h-12 text-sm"
            />
          </PromptInputBody>
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

export function ChatWidget() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showList, setShowList] = useState(false);
  const activeId = search.chat;
  const open = Boolean(activeId);

  useEffect(() => setThreads(loadThreads()), []);

  const update = (fn: (t: Thread[]) => Thread[]) =>
    setThreads((prev) => {
      const next = fn(prev);
      saveThreads(next);
      return next;
    });

  const go = (id?: string) => navigate({ search: id ? { chat: id } : {}, replace: true, resetScroll: false });

  const create = () => {
    const t = newThread();
    update((prev) => [t, ...prev]);
    setShowList(false);
    go(t.id);
  };

  const launch = () => {
    const stored = loadThreads();
    if (stored[0]) go(stored[0].id);
    else create();
  };

  // A thread URL that doesn't exist locally yet (e.g. shared link) becomes a fresh thread with that id.
  useEffect(() => {
    if (!activeId) return;
    const stored = loadThreads();
    if (!stored.some((t) => t.id === activeId)) {
      const t = { ...newThread(), id: activeId };
      saveThreads([t, ...stored]);
      setThreads([t, ...stored]);
    }
  }, [activeId]);

  const active = threads.find((t) => t.id === activeId);

  return (
    <>
      <button
        type="button"
        onClick={() => (open ? go(undefined) : launch())}
        data-cursor="hot"
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed bottom-6 right-6 z-[170] flex h-14 items-center gap-3 border border-border bg-background/80 px-5 font-mono text-[10px] tracking-[0.28em] text-foreground backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5"
      >
        {open ? <X className="size-4" /> : <SignalMark className="size-4" />}
        <span className="hidden sm:inline">{open ? "CLOSE" : "ASK SIGNAL"}</span>
      </button>

      <div
        className={`fixed bottom-24 right-4 z-[170] flex h-[min(640px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-[420px] origin-bottom-right flex-col border border-border bg-background shadow-2xl transition-all duration-300 ease-[var(--ease-expo)] sm:right-6 ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
        role="dialog"
        aria-label="SIGNAL assistant"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <SignalMark className="size-5 text-foreground" />
            <div>
              <p className="font-display text-sm font-medium tracking-[0.3em]">SIGNAL</p>
              <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">BLAC WEB CONCIERGE · AI</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setShowList((v) => !v)} aria-label="Conversations" className="p-2 text-muted-foreground hover:text-foreground">
              <History className="size-4" />
            </button>
            <button type="button" onClick={create} aria-label="New conversation" className="p-2 text-muted-foreground hover:text-foreground">
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {showList ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <p className="label-mono px-2 py-2">CONVERSATIONS</p>
            {threads.map((t) => (
              <div key={t.id} className={`flex items-center border-b border-border ${t.id === activeId ? "bg-muted" : ""}`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowList(false);
                    go(t.id);
                  }}
                  className="flex-1 truncate px-3 py-3 text-left text-sm"
                >
                  {t.title}
                  <span className="block font-mono text-[9px] tracking-[0.15em] text-muted-foreground">
                    {new Date(t.updatedAt).toLocaleString()}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Delete conversation"
                  onClick={() => {
                    update((prev) => prev.filter((x) => x.id !== t.id));
                    if (t.id === activeId) go(undefined);
                  }}
                  className="p-3 text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : active ? (
          <ChatWindow
            key={active.id}
            thread={active}
            onChange={(messages) =>
              update((prev) =>
                prev.map((t) => (t.id === active.id ? { ...t, messages, title: titleFrom(messages), updatedAt: Date.now() } : t)),
              )
            }
          />
        ) : null}
      </div>
    </>
  );
}
