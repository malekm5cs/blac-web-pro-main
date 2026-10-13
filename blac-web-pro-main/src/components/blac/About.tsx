import { useEffect, useRef } from "react";
import { RevealText } from "./RevealText";

export function About() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const layers = Array.from(
      el.querySelectorAll<HTMLElement>("[data-speed]"),
    );
    let raf = 0;
    const loop = () => {
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight;
      layers.forEach((l) => {
        const sp = Number(l.dataset["speed"] ?? 0);
        l.style.transform = `translate3d(${p * sp * 100}px, 0, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      id="about"
      ref={wrap}
      className="relative overflow-hidden grain py-32 md:py-48"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        {Array.from({ length: 36 }).map((_, i) => (
          <span
            key={i}
            className="absolute size-px rounded-full bg-foreground"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animation: `pulse ${4 + (i % 5)}s ease-in-out ${i * 0.17}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 md:px-12">
        <span className="label-mono">05 — STUDIO</span>

        <div className="mt-8 space-y-1">
          <div data-speed="-0.14">
            <RevealText
              as="h2"
              by="word"
              text="WE DON'T JUST"
              className="display-lg block"
              stagger={0.1}
            />
          </div>
          <div data-speed="0.2">
            <RevealText
              as="h2"
              by="word"
              text="BUILD WEBSITES."
              className="display-lg block text-muted-foreground"
              stagger={0.1}
              delay={0.1}
            />
          </div>
          <div data-speed="-0.08">
            <RevealText
              as="h2"
              by="word"
              text="WE BUILD DIGITAL EXPERIENCES."
              className="display-lg block"
              stagger={0.06}
              delay={0.2}
            />
          </div>
        </div>

        <div className="mt-24 grid gap-14 md:grid-cols-3">
          <p className="text-sm leading-relaxed text-muted-foreground md:col-span-2 md:text-base">
            BLAC Web is a full-stack studio working at the intersection of
            engineering and motion design. We ship products that load fast,
            scale cleanly, and feel considered in every frame — from the first
            paint to the last micro-interaction.
          </p>
          <dl className="space-y-6">
            {[
              ["PRACTICE", "Independent · Global"],
              ["DISCIPLINE", "Strategy · Design · Engineering"],
              ["ENGAGEMENTS", "Projects · Partnerships · Retainers"],
            ].map(([k, v]) => (
              <div key={k} className="border-t border-border pt-4">
                <dt className="label-mono">{k}</dt>
                <dd className="mt-2 font-display text-lg tracking-tight">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
