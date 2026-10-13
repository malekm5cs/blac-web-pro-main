import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Preloader } from "@/components/blac/Preloader";
import { SmoothScroll } from "@/components/blac/SmoothScroll";
import { Cursor } from "@/components/blac/Cursor";
import { Nav } from "@/components/blac/Nav";
import { Hero } from "@/components/blac/Hero";
import { Work } from "@/components/blac/Work";
import { Mountain } from "@/components/blac/Mountain";
import { Services } from "@/components/blac/Services";
import { Tech } from "@/components/blac/Tech";
import { About } from "@/components/blac/About";
import { Core } from "@/components/blac/Core";
import { Contact } from "@/components/blac/Contact";
import { StudioProfile } from "@/components/blac/StudioProfile";
import { LightField } from "@/components/blac/LightField";
import { VelocityMarquee, Process3D } from "@/components/blac/Sideways";
import { ScrollProgress } from "@/components/blac/ScrollProgress";
import { MorphShape } from "@/components/blac/MorphShape";
import { ProjectInquiry } from "@/components/blac/ProjectInquiry";
import { ChatWidget } from "@/components/blac/chat/ChatWidget";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { chat?: string } =>
    typeof s["chat"] === "string" && s["chat"] ? { chat: s["chat"] } : {},
  head: () => ({
    meta: [
      { title: "BLAC WEB — Digital Experiences" },
      {
        name: "description",
        content:
          "BLAC WEB is an independent full-stack studio creating high-performance digital products, immersive websites, and motion-led experiences.",
      },
      { property: "og:title", content: "BLAC WEB — Digital Experiences" },
      {
        property: "og:description",
        content:
          "Independent digital studio for full-stack products, art-directed websites, 3D, and motion — engineered with precision.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "BLAC WEB" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "BLAC WEB — Digital Experiences" },
      {
        name: "twitter:description",
        content:
          "Independent digital studio for full-stack products, art-directed websites, 3D, and motion — engineered with precision.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [started, setStarted] = useState(false);
  const onDone = useCallback(() => setStarted(true), []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader onDone={onDone} />
      <SmoothScroll />
      <LightField />
      <Cursor />
      <ScrollProgress />
      <Nav />
      <ProjectInquiry />
      <ChatWidget />
      <Toaster />
      <main className="relative z-[2]">
        <Hero started={started} />
        <VelocityMarquee />
        <Mountain />
        <Work />
        <Core />
        <Process3D />
        <Services />
        <Tech />
        <About />
        <MorphShape />
        <StudioProfile />
        <Contact />
      </main>
    </div>
  );
}
