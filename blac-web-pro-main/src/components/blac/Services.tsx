import { useState } from "react";
import { RevealText } from "./RevealText";

const SERVICES = [
  {
    n: "01",
    detail: 'Marketing sites, landing pages and content platforms built mobile-first with clean, accessible markup.',
    tags: ['Responsive layouts', 'CMS integration', 'SEO foundations', 'Analytics'],
    title: "WEB DEVELOPMENT",
    body: "Modern, responsive, high-performance websites.",
  },
  {
    n: "02",
    detail: 'End-to-end products: data models, APIs, authentication and dashboards — one team, one codebase.',
    tags: ['APIs & databases', 'Auth & roles', 'Admin dashboards', 'Payments'],
    title: "FULL-STACK DEVELOPMENT",
    body: "Complete digital products from frontend to backend.",
  },
  {
    n: "03",
    detail: 'Research-led flows, wireframes and high-fidelity interfaces with a design system that scales.',
    tags: ['User flows', 'Prototypes', 'Design systems', 'Usability review'],
    title: "UI / UX",
    body: "Interfaces designed around clarity, usability, and visual precision.",
  },
  {
    n: "04",
    detail: 'Scroll-driven storytelling, WebGL scenes and micro-interactions that make a brand feel alive.',
    tags: ['3D & WebGL', 'Scroll motion', 'Micro-interactions', 'Sound design'],
    title: "INTERACTIVE EXPERIENCES",
    body: "Advanced animations, motion, 3D, and interactive web experiences.",
  },
  {
    n: "05",
    detail: 'Audits and rebuilds that cut load times, improve Core Web Vitals and keep things fast as you grow.',
    tags: ['Core Web Vitals', 'Image & code splitting', 'Caching', 'Monitoring'],
    title: "PERFORMANCE",
    body: "Fast loading, optimized rendering, responsive architecture.",
  },
];

export function Services() {
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section
      id="services"
      className="relative overflow-hidden grain py-32 md:py-48"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <span className="label-mono">03 — CAPABILITIES</span>
        <RevealText
          as="h2"
          by="word"
          text="WHAT WE DO, PRECISELY."
          className="display-lg mt-5 block max-w-3xl"
          stagger={0.08}
        />

        <div className="mt-20 border-t border-border">
          {SERVICES.map((s) => {
            const isOpen = open === s.n;
            const active = hover === s.n || isOpen;
            const dimmed = (hover ?? open) !== null && !active;
            return (
              <div
                key={s.n}
                onPointerEnter={() => setHover(s.n)}
                onPointerLeave={() => setHover(null)}
                onClick={() => setOpen(isOpen ? null : s.n)}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(isOpen ? null : s.n); } }}
                data-cursor="hot"
                className="group relative cursor-pointer border-b border-border"
                style={{
                  perspective: "1000px",
                }}
              >
                <div
                  className="grid items-center gap-4 py-8 transition-all duration-[450ms] ease-[var(--ease-expo)] md:grid-cols-12 md:py-10"
                  style={{
                    opacity: dimmed ? 0.32 : 1,
                    filter: dimmed ? "blur(2px)" : "blur(0px)",
                    transform: active
                      ? "translateX(18px) rotateX(-3deg)"
                      : "none",
                    transformOrigin: "left center",
                  }}
                >
                  <span
                    className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground transition-transform duration-[380ms] ease-[var(--ease-expo)] md:col-span-1"
                    style={{ transform: active ? "scale(1.9)" : "scale(1)", transformOrigin: "left center" }}
                  >
                    {s.n}
                  </span>
                  <h3 className="font-display text-3xl font-medium leading-[0.95] tracking-tight md:col-span-6 md:text-5xl">
                    {s.title}
                    <span className="ml-4 inline-block align-middle font-mono text-base text-muted-foreground transition-transform duration-300" style={{ transform: isOpen ? "rotate(45deg)" : "none" }}>+</span>
                  </h3>
                  <p
                    className="text-sm leading-relaxed text-muted-foreground transition-all duration-[450ms] ease-[var(--ease-expo)] md:col-span-5"
                    style={{
                      opacity: active ? 1 : 0.45,
                      transform: active ? "translateY(0)" : "translateY(8px)",
                      color: active ? "var(--foreground)" : undefined,
                    }}
                  >
                    {s.body}
                  </p>
                </div>
                <div
                  className="grid transition-[grid-template-rows,opacity] duration-[450ms] ease-[var(--ease-expo)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-6 pb-10 md:grid-cols-12">
                      <p className="text-base leading-relaxed md:col-span-6 md:col-start-2">{s.detail}</p>
                      <ul className="flex flex-wrap content-start gap-2 md:col-span-5">
                        {s.tags.map((t) => (
                          <li key={t} className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                            {t.toUpperCase()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <span
                  className="absolute bottom-0 left-0 h-px bg-foreground transition-all duration-[450ms] ease-[var(--ease-expo)]"
                  style={{ width: active ? "100%" : "0%" }}
                />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
