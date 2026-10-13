import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ROWS = [
  "DESIGN — ENGINEER — ANIMATE — SHIP —",
  "WEBGL · MOTION · FULL-STACK · 3D ·",
  "STRATEGY — DESIGN — ENGINEERING — DELIVERY —",
];

const PANELS = [
  { n: "I", t: "DISCOVER", d: "We dig into the problem, the people and the numbers before a single pixel." },
  { n: "II", t: "DIRECT", d: "An art direction with one strong idea — type, motion and light as a system." },
  { n: "III", t: "BUILD", d: "Typed, tested, fast. Interfaces engineered to feel instant on every device." },
  { n: "IV", t: "MOVE", d: "Scroll, cursor and 3D choreography that guides attention, never distracts." },
  { n: "V", t: "LAUNCH", d: "Ship, measure, iterate. A partner after go-live, not just before it." },
];

/** Velocity-reactive marquee rows that slide sideways with scroll. */
export function VelocityMarquee() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = wrap.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-row]"));
    const ctx = gsap.context(() => {
      rows.forEach((row, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.fromTo(
          row,
          { xPercent: dir < 0 ? 0 : -30 },
          {
            xPercent: dir < 0 ? -30 : 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.45 },
          },
        );
      });
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-14, 14, self.getVelocity() / -250);
          gsap.to(rows, { skewX: v, rotateX: v * 1.5, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrap} className="relative overflow-hidden py-20 md:py-28" style={{ perspective: 900 }}>
      {ROWS.map((r, i) => (
        <div
          key={r}
          data-row
          className={`flex whitespace-nowrap font-display font-bold leading-none tracking-[-0.05em] will-change-transform ${
            i === 1 ? "text-stroke py-2 text-[clamp(3rem,10vw,10rem)]" : "text-[clamp(3rem,10vw,10rem)]"
          }`}
        >
          {Array.from({ length: 4 }).map((_, k) => (
            <span key={k} className="pr-8">
              {i === 1 ? <span className="serif-accent font-normal">{r}</span> : r}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}

/** Pinned horizontal 3D carousel: panels swing on Y as they cross the viewport. */
export function Process3D() {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const s = section.current;
    const t = track.current;
    if (!s || !t) return;
    const panels = Array.from(t.querySelectorAll<HTMLElement>("[data-panel]"));

    const ctx = gsap.context(() => {
      const distance = () => t.scrollWidth - window.innerWidth;
      const update = () => {
        const cx = window.innerWidth / 2;
        panels.forEach((p) => {
          const r = p.getBoundingClientRect();
          const off = (r.left + r.width / 2 - cx) / window.innerWidth; // -1..1
          const rot = gsap.utils.clamp(-55, 55, off * -70);
          const z = -Math.abs(off) * 380;
          p.style.transform = `translateZ(${z}px) rotateY(${rot}deg)`;
          p.style.setProperty("--lit", String(Math.max(0, 1 - Math.abs(off) * 1.6)));
        });
      };
      gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: s,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.55,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: update,
          onRefresh: update,
        },
      });
      update();
    }, s);
    return () => ctx.revert();
  }, []);

  return (
    <section id="process" ref={section} className="relative overflow-hidden">
      <div className="flex h-[100svh] flex-col justify-center">
        <div className="mx-auto mb-10 w-full max-w-[1600px] px-6 md:px-12">
          <span className="label-mono">PROCESS — IN FIVE MOVES</span>
          <h2 className="display-lg mt-5">
            SIDEWAYS, <span className="serif-accent text-muted-foreground">in depth.</span>
          </h2>
        </div>
        <div style={{ perspective: 1400 }}>
          <div
            ref={track}
            className="flex gap-10 pl-[10vw] pr-[30vw] will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            {PANELS.map((p) => (
              <article
                key={p.n}
                data-panel
                data-cursor="hot"
                className="process-panel relative flex h-[52svh] w-[78vw] shrink-0 flex-col justify-between border border-border bg-card/60 p-8 backdrop-blur-md sm:w-[46vw] lg:w-[30vw]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <span className="font-serif text-7xl italic text-muted-foreground" style={{ transform: "translateZ(60px)" }}>
                  {p.n}
                </span>
                <div style={{ transform: "translateZ(40px)" }}>
                  <h3 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{p.t}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{p.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
