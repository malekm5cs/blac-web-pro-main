import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { ClientGate } from "./ClientOnly";
import { RevealText } from "./RevealText";

const SystemsScene = lazy(() => import("./three/SystemsScene"));

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setSeen(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

function Tilt({ children, i }: { children: ReactNode; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [wrap, seen] = useInView<HTMLDivElement>();
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) translateZ(20px)`;
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
  };
  return (
    <div
      ref={wrap}
      className="transition-all duration-500 ease-[var(--ease-expo)]"
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : "perspective(900px) rotateX(40deg) translateY(80px)",
        transitionDelay: `${i * 0.12}s`,
      }}
    >
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        className="tilt-card relative h-full border border-border bg-card/40 p-8 backdrop-blur-md transition-transform duration-300 ease-out [transform-style:preserve-3d]"
      >
        {children}
      </div>
    </div>
  );
}

const pillars = [
  ["01", "Strategic clarity", "Every engagement begins with the audience, the objective, and a focused path to measurable impact."],
  ["02", "Technical depth", "Full-stack engineering from data architecture to pixel-perfect interfaces and production delivery."],
  ["03", "Motion systems", "Purposeful 3D, WebGL, and interaction design that strengthens hierarchy and guides attention."],
  ["04", "Global delivery", "A distributed studio practice built for ambitious teams, complex products, and international launches."],
];

export function StudioProfile() {
  return (
    <section id="studio-profile" className="relative overflow-hidden grain py-32 md:py-44">
      <div className="mx-auto grid max-w-[1600px] gap-16 px-6 md:grid-cols-2 md:items-center md:px-12">
        <div>
          <span className="label-mono">STUDIO PROFILE — INDEPENDENT · GLOBAL</span>
          <div className="mt-8">
            <RevealText as="h2" by="word" text="BUILT FOR" className="display-lg block" stagger={0.08} />
            <RevealText as="h2" by="word" text="ambitious teams," className="display-lg serif-accent block text-muted-foreground" stagger={0.08} delay={0.1} />
            <RevealText as="h2" by="word" text="WORLDWIDE." className="display-lg text-chrome block" stagger={0.08} delay={0.2} />
          </div>
          <p className="mt-10 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            BLAC WEB combines strategy, art direction, and full-stack engineering to create
            digital products with a distinct point of view. Every system is designed for clarity,
            performance, and long-term value.
          </p>
          <dl className="mt-14 grid grid-cols-3 gap-6">
            {[
              [1, "", "INTEGRATED TEAM"],
              [100, "%", "CUSTOM BUILT"],
              [24, "/7", "GLOBAL DELIVERY"],
            ].map(([n, s, l]) => (
              <div key={l as string} className="border-t border-border pt-4">
                <dd className="font-display text-3xl tracking-tight md:text-5xl">
                  {n}{s}
                </dd>
                <dt className="label-mono mt-2">{l}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative aspect-square w-full">
          <div className="absolute inset-0 animate-[spin-slow_40s_linear_infinite] rounded-full border border-border/60" />
          <div className="absolute inset-[12%] animate-[spin-slow_28s_linear_infinite_reverse] rounded-full border border-dashed border-border/40" />
          <ClientGate>
            <Suspense fallback={null}>
              <SystemsScene />
            </Suspense>
          </ClientGate>
          <span className="label-mono absolute bottom-4 left-1/2 -translate-x-1/2">STRATEGY · DESIGN · ENGINEERING</span>
        </div>
      </div>

      <div className="mx-auto mt-28 grid max-w-[1600px] gap-6 px-6 sm:grid-cols-2 md:px-12 lg:grid-cols-4">
        {pillars.map(([n, t, d], i) => (
          <Tilt key={n} i={i}>
            <span className="label-mono [transform:translateZ(30px)] block">{n}</span>
            <h3 className="mt-10 font-display text-2xl tracking-tight [transform:translateZ(50px)]">{t}</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground [transform:translateZ(25px)]">{d}</p>
          </Tilt>
        ))}
      </div>

      <div className="mt-28 overflow-hidden border-y border-border py-6 edge-fade-x">
        <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-12 whitespace-nowrap font-display text-4xl tracking-tight md:text-6xl">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["DIGITAL STRATEGY", "PRODUCT DESIGN", "FULL-STACK", "3D & MOTION", "BUILT TO PERFORM"].map((w, j) => (
              <span key={`${k}-${j}`} className={j % 2 ? "serif-accent text-muted-foreground" : ""}>
                {w} <span className="text-muted-foreground">✦</span>
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
