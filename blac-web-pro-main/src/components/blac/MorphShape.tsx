import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ClientGate } from "./ClientOnly";

const MorphScene = lazy(() => import("./three/MorphScene"));
const STAGES = ["FOUNDATION", "SYSTEM", "FACET", "SIGNAL"];

export function MorphShape() {
  const wrap = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = wrap.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(1, Math.max(0, (vh * 0.5 - r.top) / (r.height - vh * 0.5)));
        progress.current = p;
        const s = Math.min(3, Math.round(p * 3));
        setStage((prev) => (prev === s ? prev : s));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={wrap} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="absolute inset-0">
          <ClientGate>
            <Suspense fallback={null}>
              <MorphScene progress={progress} />
            </Suspense>
          </ClientGate>
        </div>
        <div className="pointer-events-none relative mx-auto flex w-full max-w-[1600px] items-end justify-between self-end px-6 pb-16 md:px-12">
          <div>
            <span className="label-mono">3D FORM STUDY / {String(stage + 1).padStart(2, "0")}</span>
            <p className="mt-3 font-display text-3xl tracking-tight md:text-5xl">{STAGES[stage]}</p>
          </div>
          <div className="flex gap-2">
            {STAGES.map((s, i) => (
              <span key={s} className="h-px w-8 bg-foreground transition-opacity duration-300" style={{ opacity: i === stage ? 1 : 0.25 }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
