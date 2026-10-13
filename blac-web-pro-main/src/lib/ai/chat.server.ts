import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool, type ToolSet, type UIMessage } from "ai";
import { z } from "zod";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id";

const MODEL = "openai/gpt-6-astra";

const SECTIONS = ["top", "work", "services", "stack", "about", "studio-profile", "contact"] as const;

// Browser-executed tools: no `execute`, the client fulfils them and replies with the output.
const tools = {
  scroll_to_section: tool({
    description: "Scroll the visitor's page to a section of the BLAC WEB site.",
    inputSchema: z.object({ section: z.enum(SECTIONS) }),
  }),
  open_project_inquiry: tool({
    description: "Open the 'Start a project' inquiry panel so the visitor can send a brief.",
    inputSchema: z.object({}),
  }),
  set_ambience: tool({
    description: "Turn the site's ambient soundscape and interface sounds on or off.",
    inputSchema: z.object({ on: z.boolean() }),
  }),
  set_theme: tool({
    description: "Switch the site between dark and light theme.",
    inputSchema: z.object({ theme: z.enum(["dark", "light"]) }),
  }),
  copy_to_clipboard: tool({
    description: "Copy text (e.g. a drafted project brief or the studio email) to the visitor's clipboard.",
    inputSchema: z.object({ text: z.string() }),
  }),
};

const INSTRUCTIONS = `You are SIGNAL, the concise concierge for BLAC WEB — an independent, globally remote full-stack digital studio.
Studio facts:
- Services: full-stack web products, art-directed websites, brand systems, 3D & motion (WebGL/Three.js), performance engineering.
- Selected work: NEXUS PLATFORM, ATLAS SYSTEMS, VECTOR INTELLIGENCE, MERIDIAN COMMERCE.
- Stack: React, TypeScript, TanStack, Node, Three.js/WebGL, GSAP-style motion, edge deployment.
- Typical budgets: $2k–5k, $5k–10k, $10k–25k, $25k+. Email: hello@blacweb.studio. Remote, worldwide.
You can: answer questions, help scope projects and draft briefs, estimate rough timelines, give web/design advice, and control the site with tools (scroll to sections, open the inquiry panel, toggle ambience sound, switch theme, copy text).
Use tools proactively when the visitor asks to see, go to, start, or change something. Keep replies short (under 120 words), polished and professional. Never reference any specific city or country as the studio's location. Use markdown sparingly.`;

export async function handleChat(request: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });

  let messages: UIMessage[];
  try {
    const body = (await request.json()) as { messages?: UIMessage[] };
    if (!Array.isArray(body.messages)) throw new Error();
    messages = body.messages.slice(-40);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    tools: tools as unknown as ToolSet,
    stopWhen: stepCountIs(4),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: true,
      onError: (error) => {
        const status = (error as { statusCode?: number })?.statusCode;
        if (status === 429) return "The assistant is busy right now — please try again in a moment.";
        if (status === 402) return "AI credits are used up for this workspace. Please add credits to continue.";
        return "Something went wrong. Please try again.";
      },
    }),
    runIdFetch,
  );
}
