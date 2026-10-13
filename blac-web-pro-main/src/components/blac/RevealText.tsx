import { useEffect, useRef } from "react";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  by?: "char" | "word";
  /** Animate on mount instead of on scroll. */
  immediate?: boolean;
};

export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  as = "span",
  by = "char",
  immediate = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as unknown as React.FC<{
    ref?: React.Ref<HTMLElement> | undefined;
    className?: string | undefined;
    "aria-label"?: string | undefined;
    children?: React.ReactNode;
  }>;

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const parts = Array.from(
      host.querySelectorAll<HTMLElement>("[data-part]"),
    );

    const run = () => {
      parts.forEach((p, i) => {
        p.style.transitionDelay = `${delay + i * stagger}s`;
        p.style.transform = "translate3d(0,0,0) rotateX(0deg)";
        p.style.opacity = "1";
        p.style.filter = "blur(0px)";
      });
    };

    if (immediate) {
      const id = requestAnimationFrame(run);
      return () => cancelAnimationFrame(id);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [delay, stagger, immediate, text]);

  const words = text.split(" ");

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span
          key={`${word}-${wi}`}
          className="inline-block overflow-hidden align-bottom"
          style={{ perspective: "600px" }}
        >
          {by === "word" ? (
            <span
              data-part
              className="inline-block will-change-transform"
              style={{
                opacity: 0,
                filter: "blur(10px)",
                transform: "translate3d(0, 0.9em, 0) rotateX(-65deg)",
                transformOrigin: "bottom center",
                transition:
                  "transform .85s var(--ease-expo), opacity .65s var(--ease-expo), filter .65s var(--ease-expo)",
              }}
            >
              {word}
            </span>
          ) : (
            Array.from(word).map((ch, ci) => (
              <span
                key={ci}
                data-part
                className="inline-block will-change-transform"
                style={{
                  opacity: 0,
                  filter: "blur(12px)",
                  transform: "translate3d(0, 1em, 0) rotateX(-80deg)",
                  transformOrigin: "bottom center",
                  transition:
                    "transform .8s var(--ease-expo), opacity .6s var(--ease-expo), filter .6s var(--ease-expo)",
                }}
              >
                {ch}
              </span>
            ))
          )}
          {wi < words.length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  );
}
