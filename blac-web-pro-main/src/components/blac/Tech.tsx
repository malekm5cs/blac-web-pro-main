import { useEffect, useRef } from "react";
import { RevealText } from "./RevealText";

const TECH = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Supabase",
  "Tailwind",
  "Three.js",
];

export function Tech() {
  const orbit = useRef<HTMLDivElement>(null);
  const marquee = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      const el = orbit.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = 1 - (r.top + r.height / 2) / window.innerHeight;
      el.style.setProperty("--spin", `${p * 120}deg`);
      if (marquee.current)
        marquee.current.style.transform = `translate3d(${-p * 220}px,0,0)`;
    };
    const loop = () => {
      onScroll();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section id="stack" className="relative overflow-hidden grain py-32 md:py-48">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <span className="label-mono">04 — STACK</span>
        <RevealText
          as="h2"
          by="word"
          text="ENGINEERED FOR THE WEB."
          className="display-lg mt-5 block max-w-3xl"
          stagger={0.08}
        />
      </div>

      <div
        ref={orbit}
        className="relative mx-auto mt-24 flex h-[62vh] min-h-[420px] max-w-[1600px] items-center justify-center px-6"
        style={{ perspective: "900px" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: "rotateX(68deg) rotateZ(var(--spin, 0deg))",
            transformStyle: "preserve-3d",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-border"
              style={{
                width: `${40 + i * 22}vmin`,
                height: `${40 + i * 22}vmin`,
              }}
            />
          ))}
          {TECH.map((t, i) => {
            const angle = (i / TECH.length) * Math.PI * 2;
            const radius = 26 + (i % 3) * 11;
            return (
              <span
                key={t}
                className="absolute font-mono text-[10px] tracking-[0.3em] text-muted-foreground md:text-xs"
                style={{
                  transform: `translate(${Math.cos(angle) * radius}vmin, ${Math.sin(angle) * radius}vmin) rotateZ(calc(-1 * var(--spin, 0deg))) rotateX(-68deg)`,
                }}
              >
                {t.toUpperCase()}
              </span>
            );
          })}
        </div>

        <div className="relative z-10 text-center">
          <span className="font-display text-[18vw] font-medium leading-none tracking-[-0.06em] text-foreground/10 md:text-[10vw]">
            STACK
          </span>
        </div>
      </div>

      <div className="edge-fade-x mt-10 overflow-hidden border-y border-border py-6">
        <div ref={marquee} className="flex gap-12 whitespace-nowrap will-change-transform">
          {[...TECH, ...TECH, ...TECH].map((t, i) => (
            <span
              key={i}
              className="font-display text-3xl font-medium tracking-tight text-foreground/35 md:text-5xl"
            >
              {t}
              <span className="px-6 text-foreground/15">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
