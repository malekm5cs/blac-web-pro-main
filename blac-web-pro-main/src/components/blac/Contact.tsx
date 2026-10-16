import { useEffect, useRef } from "react";
import logo from "@/assets/blac-logo.png";
import { RevealText } from "./RevealText";
import { Magnetic } from "./Magnetic";
import { openProjectInquiry } from "./ProjectInquiry";

const LINKS = [
  { label: "WORK", id: "work" },
  { label: "SERVICES", id: "services" },
  { label: "ABOUT", id: "about" },
  { label: "CONTACT", id: "contact" },
];

export function Contact() {
  const field = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = field.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const count = window.innerWidth < 768 ? 60 : 180;
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const parts = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 1.1 + 0.2,
      v: Math.random() * 0.00035 + 0.00008,
    }));

    let raf = 0;
    const draw = () => {
      const r = canvas.getBoundingClientRect();
      const exit = Math.max(
        0,
        Math.min(1, 1 - (r.bottom - window.innerHeight * 0.4) / (r.height * 0.7)),
      );
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.y -= p.v * 1000 * 0.016;
        if (p.y < -0.02) p.y = 1.02;
        ctx.globalAlpha = (0.15 + p.s * 0.35) * (1 - exit);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.s, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="contact" className="relative overflow-hidden grain">
      <canvas
        ref={field}
        className="pointer-events-none absolute inset-0 size-full"
      />

      <div className="relative mx-auto max-w-[1600px] px-6 pb-24 pt-32 md:px-12 md:pt-48">
        <span className="label-mono">06 — CONTACT</span>
        <RevealText
          as="h2"
          text="LET'S BUILD SOMETHING."
          className="display-xl mt-6 block"
          stagger={0.025}
        />

        <div className="mt-20 flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <Magnetic strength={0.18}>
            <button
              type="button"
              onClick={openProjectInquiry}
              data-cursor="SEND"
              className="group relative inline-flex items-center gap-6 overflow-hidden border border-border px-8 py-6 md:px-12 md:py-8"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-foreground transition-transform duration-[450ms] ease-[var(--ease-cine)] group-hover:scale-x-100" />
              <span className="relative z-10 font-display text-2xl font-medium tracking-tight mix-blend-difference md:text-4xl">
                START A PROJECT
              </span>
              <span className="relative z-10 text-2xl mix-blend-difference transition-transform duration-[380ms] ease-[var(--ease-expo)] group-hover:translate-x-3 md:text-4xl">
                →
              </span>
            </button>
          </Magnetic>

          <div className="space-y-3">
            <a
              href="mailto:hello@blacweb.studio"
              data-cursor="hot"
              className="block font-mono text-xs tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              HELLO.BLAC.WEB@GMAIL.COM
            </a>
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
              REMOTE · WORLDWIDE
            </p>
          </div>
        </div>
      </div>

      <footer className="relative border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-12">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="size-6 object-contain" />
            <span className="font-display text-xs tracking-[0.4em]">
              BLAC WEB
            </span>
          </div>

          <nav className="flex flex-wrap gap-8">
            {LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                data-cursor="hot"
                className="group relative font-mono text-[10px] tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-foreground transition-all duration-[380ms] ease-[var(--ease-expo)] group-hover:w-full" />
              </button>
            ))}
          </nav>

          <span className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground">
            © {new Date().getFullYear()} BLAC WEB
          </span>
        </div>
        <div className="hairline" />
      </footer>
    </section>
  );
}
