import { useEffect, useState } from "react";
import logo from "@/assets/BLAC White.png";
import { Magnetic } from "./Magnetic";
import { SoundToggle } from "./Sound";
import { ThemeToggle } from "./Theme";
import { openProjectInquiry } from "./ProjectInquiry";

const LINKS = [
  { label: "WORK", id: "work" },
  { label: "SERVICES", id: "services" },
  { label: "STACK", id: "stack" },
  { label: "ABOUT", id: "about" },
  { label: "STUDIO", id: "studio-profile" },
  { label: "CONTACT", id: "contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[120] transition-all duration-[380ms] ease-[var(--ease-expo)] ${
          scrolled
            ? "border-b border-border bg-background/55 py-4 backdrop-blur-xl"
            : "border-b border-transparent py-7"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 md:px-12">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-cursor="hot"
            className="flex items-center gap-3"
          >
            <img
              src={logo}
              alt="BLAC Web"
              className="size-7 object-contain"
            />
            <span className="font-display text-sm font-medium tracking-[0.42em]">
              BLAC
            </span>
          </button>

          <nav className="hidden items-center gap-6 lg:flex xl:gap-9">
            {LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                data-cursor="hot"
                className="group relative font-mono text-[11px] tracking-[0.28em] text-muted-foreground transition-colors duration-500 hover:text-foreground"
              >
                <span className="inline-block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-0.5">
                  {l.label}
                </span>
                <span
                  className={`absolute -bottom-2 left-0 h-px bg-foreground transition-all duration-[380ms] ease-[var(--ease-expo)] ${
                    active === l.id ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            ))}
            <SoundToggle />
            <ThemeToggle />
            <Magnetic>
              <button
                onClick={openProjectInquiry}
                data-cursor="hot"
                className="relative overflow-hidden border border-border px-5 py-2.5 font-mono text-[11px] tracking-[0.28em]"
              >
                <span className="relative z-10 mix-blend-difference">
                  START A PROJECT
                </span>
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-foreground transition-transform duration-600 ease-[var(--ease-expo)] hover:scale-y-100" />
              </button>
            </Magnetic>
          </nav>

          <div className="flex items-center gap-4 lg:hidden">
          <SoundToggle />
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="flex size-8 flex-col items-end justify-center gap-1.5 lg:hidden"
          >
            <span
              className={`h-px bg-foreground transition-all duration-500 ease-[var(--ease-expo)] ${open ? "w-6 translate-y-[3.5px] rotate-45" : "w-6"}`}
            />
            <span
              className={`h-px bg-foreground transition-all duration-500 ease-[var(--ease-expo)] ${open ? "w-6 -translate-y-[3.5px] -rotate-45" : "w-4"}`}
            />
          </button>
          </div>
        </div>
        <span
          id="scroll-progress"
          className="absolute bottom-[-1px] left-0 h-px w-full origin-left bg-foreground"
          style={{ transform: "scaleX(0)" }}
        />
      </header>

      <div
        className={`fixed inset-0 z-[110] grain bg-background transition-[clip-path] duration-[450ms] ease-[var(--ease-cine)] lg:hidden ${
          open
            ? "[clip-path:circle(140%_at_90%_5%)]"
            : "pointer-events-none [clip-path:circle(0%_at_90%_5%)]"
        }`}
      >
        <div className="flex h-full flex-col justify-center gap-2 px-8">
          {LINKS.map((l, i) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="group flex items-baseline gap-4 border-b border-border py-5 text-left"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(24px)",
                transition: `all 0.8s var(--ease-expo) ${0.18 + i * 0.07}s`,
              }}
            >
              <span className="font-mono text-[10px] text-muted-foreground">
                0{i + 1}
              </span>
              <span className="font-display text-4xl font-medium tracking-tight">
                {l.label}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openProjectInquiry();
            }}
            className="mt-8 border border-border px-6 py-5 text-left font-mono text-[11px] tracking-[0.25em]"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.8s var(--ease-expo) 0.5s",
            }}
          >
            START A PROJECT →
          </button>
        </div>
      </div>
    </>
  );
}
