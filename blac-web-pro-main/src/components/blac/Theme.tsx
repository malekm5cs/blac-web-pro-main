import { useEffect, useSyncExternalStore } from "react";
import { Magnetic } from "./Magnetic";

type Theme = "dark" | "light";
const listeners = new Set<() => void>();
let current: Theme = "dark";

function read(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function apply(next: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", next === "light");
  root.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem("blac-theme", next);
  } catch {
    /* ignore */
  }
  current = next;
  listeners.forEach((l) => l());
}

export function setTheme(next: Theme, origin?: { x: number; y: number }) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> };
  };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduce) return apply(next);
  const x = origin?.x ?? window.innerWidth - 80;
  const y = origin?.y ?? 40;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const vt = doc.startViewTransition(() => apply(next));
  vt.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 1100, easing: "cubic-bezier(0.77, 0, 0.175, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => "dark",
  );
}

export function ThemeToggle() {
  const theme = useTheme();
  useEffect(() => {
    current = read();
    listeners.forEach((l) => l());
  }, []);
  const light = theme === "light";
  return (
    <Magnetic>
      <button
        type="button"
        aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
        data-cursor="hot"
        onClick={(e) => setTheme(light ? "dark" : "light", { x: e.clientX, y: e.clientY })}
        className="group relative flex size-9 items-center justify-center overflow-hidden rounded-full border border-border"
      >
        <span
          className="absolute size-3.5 rounded-full bg-foreground transition-transform duration-[380ms] ease-[var(--ease-expo)]"
          style={{ transform: light ? "scale(1)" : "scale(1)" }}
        />
        <span
          className="absolute size-3.5 rounded-full bg-background transition-transform duration-[380ms] ease-[var(--ease-expo)]"
          style={{ transform: light ? "translate(14px,-14px)" : "translate(5px,-4px)" }}
        />
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-[3px] w-px bg-foreground transition-all duration-[380ms] ease-[var(--ease-expo)]"
            style={{
              transform: `rotate(${i * 45}deg) translateY(${light ? -11 : -6}px)`,
              opacity: light ? 1 : 0,
            }}
          />
        ))}
      </button>
    </Magnetic>
  );
}

export const themeInitScript = `try{var t=localStorage.getItem('blac-theme');var r=document.documentElement;if(t==='light'){r.classList.add('light')}else{r.classList.add('dark')}}catch(e){}`;
