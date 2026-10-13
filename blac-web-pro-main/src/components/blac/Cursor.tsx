import { useEffect, useRef, useState } from "react";

const TRAIL = 10;

export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const ringInner = useRef<HTMLDivElement>(null);
  const labelEl = useRef<HTMLSpanElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const pulse = useRef<HTMLDivElement>(null);
  const trail = useRef<(HTMLSpanElement | null)[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("custom-cursor");

    const target = { x: -100, y: -100 };
    const pos = { ...target };
    const glowPos = { ...target };
    const pts = Array.from({ length: TRAIL }, () => ({ ...target }));
    let size = 30;
    let sizeTarget = 30;
    let velocity = 0;
    let visible = false;
    let lastKey = "";
    let frame = 0;

    const setState = (label: string | null, hot: boolean) => {
      const key = `${label}|${hot}`;
      if (key === lastKey) return;
      lastKey = key;
      sizeTarget = label ? 96 : hot ? 58 : 30;
      const r = ringInner.current;
      if (r) {
        r.dataset["mode"] = label ? "label" : hot ? "hot" : "idle";
      }
      if (labelEl.current) labelEl.current.textContent = label ?? "";
      if (dot.current) dot.current.style.opacity = label ? "0" : "1";
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        pos.x = glowPos.x = target.x;
        pos.y = glowPos.y = target.y;
        pts.forEach((p) => ((p.x = target.x), (p.y = target.y)));
        root.current?.style.setProperty("opacity", "1");
      }
      const el = (e.target as HTMLElement | null)?.closest?.(
        "[data-cursor], a, button, [role=button], input, textarea, select, label",
      ) as HTMLElement | null;
      if (el) {
        const l = el.dataset["cursor"];
        setState(l && l !== "hot" ? l : null, true);
      } else setState(null, false);
    };

    const onLeave = () => {
      visible = false;
      root.current?.style.setProperty("opacity", "0");
    };

    const onDown = () => {
      sizeTarget *= 0.8;
      const el = pulse.current;
      if (!el) return;
      el.classList.remove("cursor-pulse-active");
      void el.offsetWidth;
      el.classList.add("cursor-pulse-active");
    };
    const onUp = () => {
      lastKey = "";
      const r = ringInner.current?.dataset["mode"];
      sizeTarget = r === "label" ? 96 : r === "hot" ? 58 : 30;
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.2;
      pos.y += (target.y - pos.y) * 0.2;
      glowPos.x += (target.x - glowPos.x) * 0.07;
      glowPos.y += (target.y - glowPos.y) * 0.07;
      size += (sizeTarget - size) * 0.18;
      const dist = Math.hypot(target.x - pos.x, target.y - pos.y);
      velocity += (dist - velocity) * 0.2;

      if (dot.current)
        dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      if (ring.current && ringInner.current) {
        const isLabel = ringInner.current.dataset["mode"] === "label";
        const stretch = isLabel ? 1 : Math.min(1.35, 1 + velocity / 120);
        const angle = Math.atan2(target.y - pos.y, target.x - pos.x) * (180 / Math.PI);
        ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${stretch}, ${1 / stretch})`;
        ring.current.style.width = `${size}px`;
        ring.current.style.height = `${size}px`;
        // keep label upright
        if (labelEl.current)
          labelEl.current.style.transform = `rotate(${-angle}deg)`;
      }
      if (glow.current)
        glow.current.style.transform = `translate3d(${glowPos.x}px, ${glowPos.y}px, 0) translate(-50%, -50%)`;
      if (pulse.current)
        pulse.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;

      let px = target.x;
      let py = target.y;
      pts.forEach((p, i) => {
        p.x += (px - p.x) * 0.45;
        p.y += (py - p.y) * 0.45;
        px = p.x;
        py = p.y;
        const s = trail.current[i];
        if (s) {
          const k = 1 - i / TRAIL;
          s.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${k})`;
          s.style.opacity = String(Math.min(1, velocity / 25) * k * 0.5);
        }
      });

      html.style.setProperty("--cx", `${glowPos.x}px`);
      html.style.setProperty("--cy", `${glowPos.y}px`);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      html.classList.remove("custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={root}
      className="custom-cursor-root pointer-events-none fixed inset-0 z-[200] opacity-0 transition-opacity duration-300"
      aria-hidden
    >
      <div ref={glow} className="cursor-glow absolute left-0 top-0 size-[420px] rounded-full" />
      {Array.from({ length: TRAIL }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            trail.current[i] = el;
          }}
          className="absolute left-0 top-0 size-1.5 rounded-full bg-foreground opacity-0"
        />
      ))}
      <div ref={pulse} className="cursor-pulse absolute left-0 top-0 size-8 rounded-full border border-foreground/70 opacity-0" />
      <div ref={dot} className="absolute left-0 top-0 size-1.5 rounded-full bg-foreground transition-opacity duration-300" />
      <div ref={ring} className="absolute left-0 top-0 will-change-transform" style={{ width: 30, height: 30 }}>
        <div ref={ringInner} data-mode="idle" className="cursor-ring flex size-full items-center justify-center rounded-full">
          <span ref={labelEl} className="font-mono text-[10px] tracking-[0.3em] text-background" />
        </div>
      </div>
    </div>
  );
}
