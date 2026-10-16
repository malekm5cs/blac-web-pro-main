import { useEffect, useRef, useState } from "react";
import logo from "@/assets/blac-logo.png";

const WORD = "BLAC WEB".split("");
const ease = "cubic-bezier(0.76, 0, 0.24, 1)";
const expo = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Cinematic intro:
 * 1. logo is "drawn" bottom-up behind a mask, a light sheen sweeps across it
 * 2. wordmark rises letter by letter, counter runs to 100
 * 3. logo zooms toward the camera while the screen splits open vertically
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    const DUR = 2600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setCount(Math.round(e * 100));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    const ts = [
      setTimeout(() => setPhase(1), 100), // draw logo
      setTimeout(() => setPhase(2), 1500), // sheen + word
      setTimeout(() => setPhase(3), 2900), // zoom out
      setTimeout(() => setPhase(4), 3250), // split open
      setTimeout(() => {
        setPhase(5);
        document.documentElement.style.overflow = "";
        onDone();
      }, 4300),
    ];
    return () => {
      cancelAnimationFrame(raf.current);
      ts.forEach(clearTimeout);
      document.documentElement.style.overflow = "";
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[300] overflow-hidden ${phase >= 5 ? "pointer-events-none invisible" : ""}`}
      aria-hidden
    >
      {/* split panels */}
      {[0, 1].map((i) => (
        <div
          key={i}
          className="absolute inset-x-0 bg-background"
          style={{
            top: i === 0 ? 0 : "50%",
            height: "50.5%",
            transform:
              phase >= 4 ? `translateY(${i === 0 ? "-101%" : "101%"})` : "translateY(0)",
            transition: `transform 1.05s ${ease}`,
          }}
        />
      ))}
      {/* seam of light at the split */}
      <div
        className="absolute left-0 top-1/2 h-px w-full bg-foreground"
        style={{
          transform: `scaleX(${phase >= 3 ? 1 : 0})`,
          opacity: phase >= 4 ? 0 : 0.8,
          transition: `transform .5s ${expo}, opacity .6s ease .2s`,
          boxShadow: "0 0 24px 2px color-mix(in oklab, var(--foreground) 60%, transparent)",
        }}
      />

      {/* soft halo */}
      <div
        className="absolute left-1/2 top-1/2 size-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--foreground) 9%, transparent), transparent 65%)",
          opacity: phase >= 1 && phase < 3 ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: phase >= 3 ? 0 : 1,
          transform: phase >= 3 ? "scale(2.4)" : "scale(1)",
          filter: phase >= 3 ? "blur(14px)" : "blur(0)",
          transition: `transform .9s ${ease}, opacity .6s ease, filter .7s ease`,
        }}
      >
        <div className="relative flex flex-col items-center gap-9">
          {/* logo drawn with mask wipe */}
          <div
            className="relative size-28 md:size-36"
            style={{
              clipPath: phase >= 1 ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
              transform: phase >= 1 ? "translateY(0) rotateY(0)" : "translateY(20px) rotateY(-35deg)",
              transition: `clip-path 1.3s ${ease}, transform 1.6s ${expo}`,
            }}
          >
            <img src={logo} alt="" className="size-full object-contain" />
            {/* sheen, masked to the logo shape */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                WebkitMaskImage: `url(${logo})`,
                maskImage: `url(${logo})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            >
              {phase >= 2 && (
                <div
                  className="absolute inset-y-0 w-1/3"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, oklch(0.4 0 0), transparent)",
                    animation: `sheen 1.2s ${ease} forwards`,
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex overflow-hidden font-display text-sm font-semibold tracking-[0.7em]">
            {WORD.map((c, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  transform: phase >= 2 ? "translateY(0)" : "translateY(120%)",
                  opacity: phase >= 2 ? 1 : 0,
                  transition: `transform 1s ${expo} ${i * 0.05}s, opacity 1s ease ${i * 0.05}s`,
                }}
              >
                {c === " " ? "\u00A0" : c}
              </span>
            ))}
          </div>
          <span
            className="serif-accent text-base text-muted-foreground"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "none" : "translateY(8px)",
              transition: `all 1.2s ${expo} .45s`,
            }}
          >
            Websites, done properly.
          </span>
        </div>
      </div>

      {/* counter */}
      <div
        className="absolute inset-x-6 bottom-8 flex items-end justify-between md:inset-x-12"
        style={{ opacity: phase >= 3 ? 0 : 1, transition: "opacity .4s" }}
      >
        <span className="label-mono">EST. MMXXVI — CAIRO</span>
        <span className="font-display text-5xl font-bold tabular-nums tracking-tighter md:text-7xl">
          {String(count).padStart(3, "0")}
          <span className="serif-accent ml-1 text-2xl text-muted-foreground md:text-3xl">%</span>
        </span>
      </div>
      <div
        className="absolute bottom-0 left-0 h-px bg-foreground"
        style={{ width: `${count}%`, opacity: phase >= 3 ? 0 : 1, transition: "opacity .4s" }}
      />
    </div>
  );
}
