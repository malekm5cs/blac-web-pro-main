import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lazy, Suspense } from "react";
import { ClientGate } from "./ClientOnly";
import type { Shape } from "./three/WorkObject";
const WorkObject = lazy(() => import("./three/WorkObject"));

const PROJECTS = [
  {
    n: "01",
    title: "NEXUS PLATFORM",
    meta: "Digital flagship · WebGL · Product strategy",
    shape: "knot" as Shape,
  },
  { n: "02", title: "ATLAS SYSTEMS", meta: "Enterprise platform · Product design · Engineering", shape: "ico" as Shape },
  { n: "03", title: "VECTOR INTELLIGENCE", meta: "Data experience · Real-time systems · TypeScript", shape: "torus" as Shape },
  { n: "04", title: "MERIDIAN COMMERCE", meta: "Digital commerce · Full-stack · Motion", shape: "octa" as Shape },
];

function Card({ p }: { p: (typeof PROJECTS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const hover = useRef(0);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    const box = inner.current;
    if (!el || !box) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width;
    const y = (e.clientY - (r.top + r.height / 2)) / r.height;
    gsap.to(hover, { current: 1, duration: 0.3 });
    gsap.to(box, {
      rotateY: x * 14,
      rotateX: -y * 12,
      x: x * 22,
      y: y * 16,
      scale: 1.03,
      duration: 0.25,
      ease: "expo.out",
      transformPerspective: 1100,
    });
  };

  const leave = () => {
    gsap.to(hover, { current: 0, duration: 0.6 });
    if (inner.current)
      gsap.to(inner.current, {
        rotateY: 0,
        rotateX: 0,
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "expo.out",
      });
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      data-cursor="VIEW"
      data-skew
      className="group relative w-[78vw] shrink-0 sm:w-[40vw] lg:w-[min(26vw,46svh)]"
    >
      <div
        ref={inner}
        className="relative will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-card">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--foreground) 10%, transparent), transparent 65%)" }}
          />
          <div data-par className="absolute inset-[-10%] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-105">
            <ClientGate>
              <Suspense fallback={null}>
                <WorkObject shape={p.shape} hover={hover} />
              </Suspense>
            </ClientGate>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-background/0" />
          <div className="pointer-events-none absolute inset-0 border border-border" />
          <span className="pointer-events-none absolute left-5 top-5 font-mono text-[10px] tracking-[0.3em] text-foreground/70">
            {p.n}
          </span>
        </div>
        <div className="mt-5 flex items-baseline justify-between gap-6">
          <h3 className="font-display text-2xl font-medium tracking-tight transition-transform duration-[380ms] ease-[var(--ease-expo)] group-hover:translate-x-2">
            {p.title}
          </h3>
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
            {p.meta}
          </span>
        </div>
      </div>
      <div
        className="pointer-events-none absolute -inset-x-6 bottom-[-40px] h-16 opacity-25 blur-2xl"
        style={{ background: "radial-gradient(ellipse, var(--foreground), transparent 70%)" }}
      />
    </div>
  );
}

export function Work() {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const t = track.current;
    const s = section.current;
    if (!t || !s) return;

    const ctx = gsap.context(() => {
      const distance = () => t.scrollWidth - window.innerWidth + 96;
      const skewTargets = t.querySelectorAll("[data-skew]");
      t.querySelectorAll("[data-par]").forEach((el) => {
        gsap.fromTo(el, { xPercent: -8 }, {
          xPercent: 8, ease: "none",
          scrollTrigger: { trigger: s, start: "top top", end: () => `+=${distance() + window.innerHeight * 0.6}`, scrub: true, invalidateOnRefresh: true },
        });
      });
      gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: s,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight * 0.6}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            if (counter.current)
              counter.current.textContent = String(
                Math.min(PROJECTS.length, Math.floor(self.progress * PROJECTS.length) + 1),
              ).padStart(2, "0");
            const v = gsap.utils.clamp(-8, 8, self.getVelocity() / -300);
            gsap.to(skewTargets, { skewX: v, rotateY: v * 0.8, duration: 0.6, ease: "power3.out", overwrite: true, transformPerspective: 1200 });
          },
        },
      });
    }, s);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={section} className="relative overflow-hidden grain">
      <div className="flex h-[100svh] flex-col justify-center pt-16">
        <div style={{ order: 1 }} className="mx-auto mb-8 flex w-full max-w-[1600px] items-end justify-between px-6 md:px-12">
          <div>
            <span className="label-mono">01 — SELECTED PROJECTS</span>
            <h2 className="display-lg mt-5 max-w-xl">STRATEGIC WORK, <span className="serif-accent text-muted-foreground">built to perform.</span></h2>
          </div>
          <span className="hidden font-mono text-[10px] tracking-[0.3em] text-muted-foreground md:block">
            SCROLL →
          </span>
        </div>
        <div className="mx-auto mt-8 flex w-full max-w-[1600px] items-center gap-6 px-6 md:px-12" style={{ order: 3 }}>
          <span className="font-mono text-[10px] tracking-[0.3em]"><span ref={counter}>01</span> / {String(PROJECTS.length).padStart(2, "0")}</span>
          <div className="relative h-px flex-1 bg-border">
            <div ref={bar} className="absolute inset-0 origin-left bg-foreground" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>

        <div
          ref={track}
          style={{ order: 2 }}
          className="flex gap-8 pl-6 pr-24 will-change-transform md:gap-16 md:pl-12"
        >
          {PROJECTS.map((p) => (
            <Card key={p.n} p={p} />
          ))}
          <div className="flex w-[70vw] shrink-0 items-center lg:w-[40vw]">
            <div>
              <h3 className="display-lg">NEXT ENGAGEMENT.</h3>
              <p className="mt-6 max-w-xs text-sm text-muted-foreground">
                Selected case studies and project outcomes available on request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
