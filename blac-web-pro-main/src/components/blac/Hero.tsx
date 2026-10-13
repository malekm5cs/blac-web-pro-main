import { lazy, Suspense, useEffect, useRef } from "react";
import { ClientGate } from "./ClientOnly";
import { RevealText } from "./RevealText";
import { Magnetic } from "./Magnetic";

const HeroScene = lazy(() => import("./three/HeroScene"));

export function Hero({ started }: { started: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = title.current;
    if (!el) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.11;
      cur.y += (target.y - cur.y) * 0.11;
      el.style.transform = `perspective(1200px) rotateY(${cur.x * 5}deg) rotateX(${-cur.y * 3.5}deg) translate3d(${cur.x * 14}px, ${cur.y * 8}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    if (finePointer && !reduceMotion) {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove, { passive: true });
    }

    const onScroll = () => {
      const s = window.scrollY;
      if (stage.current) {
        stage.current.style.opacity = String(
          Math.max(0, 1 - s / (window.innerHeight * 0.75)),
        );
        stage.current.style.transform = `translate3d(0, ${s * 0.22}px, 0) scale(${1 - Math.min(s / 6000, 0.08)})`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden grain">
      <div className="absolute inset-0">
        <ClientGate>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </ClientGate>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,#000_78%)] opacity-70" />

      <div
        ref={stage}
        className="relative z-10 flex h-full flex-col justify-center px-6 md:px-12"
      >
        <div className="mx-auto w-full max-w-[1600px]">
          <div ref={title} className="will-change-transform">
            {started ? (
              <>
                <RevealText
                  as="h1"
                  immediate
                  text="WEBSITES,"
                  className="display-xl block"
                  stagger={0.045}
                  delay={0.1}
                />
                <RevealText
                  as="h1"
                  immediate
                  text="but done"
                  className="display-xl serif-accent block pl-[0.08em] text-muted-foreground"
                  stagger={0.045}
                  delay={0.28}
                />
                <RevealText
                  as="h1"
                  immediate
                  text="PROPERLY."
                  className="display-xl block"
                  stagger={0.045}
                  delay={0.46}
                />
              </>
            ) : (
              <h1 className="display-xl block opacity-0">WEBSITES,</h1>
            )}
          </div>

          <div
            className="mt-12 flex flex-col gap-8 transition-all duration-500 ease-[var(--ease-expo)] md:flex-row md:items-end md:justify-between"
            style={{
              opacity: started ? 1 : 0,
              transform: started ? "none" : "translateY(28px)",
              transitionDelay: "0.9s",
            }}
          >
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              <span className="text-foreground">Full-stack. Clean. Fast.</span>
              <br />
              Because apparently "just make a website" is never just that.
            </p>

            <Magnetic strength={0.22}>
              <a
                href="#work"
                data-cursor="SCROLL"
                className="group flex items-center gap-4"
              >
                <span className="relative flex size-16 items-center justify-center rounded-full border border-border">
                  <span className="absolute inset-0 rounded-full bg-foreground/5 transition-transform duration-[380ms] ease-[var(--ease-expo)] group-hover:scale-125" />
                  <span className="block h-4 w-px bg-foreground" />
                </span>
                <span className="label-mono">SELECTED WORK</span>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
