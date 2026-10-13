import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ClientGate } from "./ClientOnly";

const CoreScene = lazy(() => import("./three/CoreScene"));

const STATS = [
  { k: "60", u: "FPS", l: "Motion budget" },
  { k: "<1s", u: "LCP", l: "First paint" },
  { k: "100", u: "/100", l: "Lighthouse" },
];

export function Core() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [visible, setVisible] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(r.height - window.innerHeight, 1)));
      progress.current = p;
      if (title.current) {
        title.current.style.letterSpacing = `${-0.04 + p * 0.12}em`;
        title.current.style.opacity = String(1 - Math.max(0, p - 0.75) * 4);
      }
    };
    const io = new IntersectionObserver((e) => setVisible(e.some((x) => x.isIntersecting)), { rootMargin: "200px" });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section id="core" ref={wrap} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ClientGate>
            {visible && (
              <Suspense fallback={null}>
                <CoreScene progress={progress} />
              </Suspense>
            )}
          </ClientGate>
        </div>
        <div className="pointer-events-none relative z-10 flex flex-col items-center px-6 text-center mix-blend-difference">
          <span className="label-mono">— THE CORE</span>
          <h2 ref={title} className="display-lg mt-6 max-w-4xl will-change-transform">
            ENGINEERED TO MOVE.
          </h2>
        </div>
        <div className="absolute inset-x-0 bottom-10 z-10 mx-auto grid max-w-[1600px] grid-cols-3 gap-6 px-6 md:px-12">
          {STATS.map((s) => (
            <div key={s.l} className="border-t border-border pt-4">
              <div className="font-display text-3xl font-medium md:text-5xl">
                {s.k}
                <span className="ml-1 font-mono text-xs text-muted-foreground">{s.u}</span>
              </div>
              <div className="mt-2 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
                {s.l.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
