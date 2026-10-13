import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px]">
      <div
        ref={bar}
        className="h-full origin-left bg-foreground"
        style={{ transform: "scaleX(0)", boxShadow: "0 0 12px 1px var(--foreground), 0 0 28px 2px color-mix(in oklab, var(--foreground) 40%, transparent)" }}
      />
    </div>
  );
}
