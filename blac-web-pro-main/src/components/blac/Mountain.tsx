import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ClientGate } from "./ClientOnly";
import { RevealText } from "./RevealText";

const MountainScene = lazy(() => import("./three/MountainScene"));

export function Mountain() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [visible, setVisible] = useState(false);
  const caption = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(total, 1)));
      // ease in, hold, dissolve out
      const reveal =
        p < 0.2 ? p / 0.2 : p > 0.85 ? Math.max(0, (1 - p) / 0.15) : 1;
      progress.current = reveal;
      if (caption.current) {
        caption.current.style.transform = `translate3d(0, ${(0.5 - p) * 120}px, 0)`;
        caption.current.style.opacity = String(
          p < 0.12 ? p / 0.12 : p > 0.85 ? Math.max(0, (1 - p) / 0.15) : 1,
        );
      }
    };

    const io = new IntersectionObserver(
      (entries) => setVisible(entries.some((e) => e.isIntersecting)),
      { rootMargin: "200px" },
    );
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section ref={wrap} className="relative h-[400svh] w-full">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden grain">
        <div className="absolute inset-0">
          {visible ? (
            <ClientGate>
              <Suspense fallback={null}>
                <MountainScene progress={progress} />
              </Suspense>
            </ClientGate>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,var(--background),transparent)]" />

        <div className="relative z-10 flex h-full items-center justify-center px-6">
          <div ref={caption} className="max-w-4xl text-center will-change-transform">
            <span className="label-mono">02 — SIGNATURE</span>
            <RevealText
              as="h2"
              by="word"
              text="WE BUILD DIGITAL TERRAIN."
              className="display-lg mt-6 block"
              stagger={0.1}
            />
            <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
              Thousands of points, one living surface. Every product we ship is
              built the same way — structure first, then the atmosphere.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
