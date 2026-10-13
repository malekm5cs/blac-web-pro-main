import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROJECT_TYPES = ["Website", "Web product", "Brand system", "3D / Motion"];
const BUDGETS = ["$2k–5k", "$5k–10k", "$10k–25k", "$25k+"];

const OPEN_INQUIRY = "blac:open-inquiry";

export function openProjectInquiry() {
  window.dispatchEvent(new Event(OPEN_INQUIRY));
}

export function ProjectInquiry() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const onClose = () => setOpen(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_INQUIRY, show);
    return () => window.removeEventListener(OPEN_INQUIRY, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [open, onClose]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const brief = String(data.get("brief") ?? "");
    const subject = encodeURIComponent(`Project inquiry — ${name || "New project"}`);
    const body = encodeURIComponent(
      [`Name: ${name}`, `Email: ${email}`, `Project: ${type || "Not selected"}`, `Budget: ${budget || "Not selected"}`, "", brief].join("\n"),
    );
    window.location.href = `mailto:hello@blacweb.studio?subject=${subject}&body=${body}`;
  };

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[180] transition-[visibility] ${open ? "visible" : "invisible delay-700"}`}
    >
      <button aria-label="Close project inquiry" onClick={onClose} className={`absolute inset-0 bg-background/70 backdrop-blur-md transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
        className={`absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-border bg-background px-6 py-7 transition-transform duration-[380ms] ease-[var(--ease-expo)] md:px-12 md:py-10 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-border pb-7">
          <span className="label-mono">PROJECT INQUIRY — 01/01</span>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close inquiry" className="rounded-full border border-border">
            <X />
          </Button>
        </div>

        <form onSubmit={submit} className="py-10">
          <h2 id="inquiry-title" className="font-display text-5xl font-bold leading-[0.9] md:text-7xl">
            TELL US WHAT<br /><span className="serif-accent text-muted-foreground">we’re building.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            A few useful details are enough. We’ll reply with timing, fit, and a clear next step.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <label className="space-y-3">
              <span className="label-mono block">YOUR NAME</span>
              <input required name="name" autoComplete="name" className="inquiry-input" placeholder="Name or studio" />
            </label>
            <label className="space-y-3">
              <span className="label-mono block">EMAIL</span>
              <input required name="email" type="email" autoComplete="email" className="inquiry-input" placeholder="you@company.com" />
            </label>
          </div>

          <fieldset className="mt-10">
            <legend className="label-mono mb-4">WHAT ARE WE MAKING?</legend>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_TYPES.map((item) => (
                <Button key={item} type="button" variant="outline" onClick={() => setType(item)} aria-pressed={type === item} className="h-12 justify-between rounded-none px-4 font-mono text-[10px] tracking-[0.16em]">
                  {item.toUpperCase()} {type === item && <Check />}
                </Button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-10">
            <legend className="label-mono mb-4">WORKING BUDGET</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {BUDGETS.map((item) => (
                <Button key={item} type="button" variant="outline" onClick={() => setBudget(item)} aria-pressed={budget === item} className="h-11 rounded-none px-3 font-mono text-[10px] tracking-[0.12em]">
                  {item}
                </Button>
              ))}
            </div>
          </fieldset>

          <label className="mt-10 block space-y-3">
            <span className="label-mono block">THE SHORT VERSION</span>
            <textarea required name="brief" rows={4} className="inquiry-input resize-none" placeholder="Goals, timing, and what success looks like…" />
          </label>

          <Button type="submit" className="premium-action group mt-10 h-16 w-full rounded-none text-background">
            <span className="font-mono text-xs tracking-[0.25em]">PREPARE EMAIL</span>
            <ArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Button>
          <p className="mt-4 text-center font-mono text-[9px] tracking-[0.18em] text-muted-foreground">OPENS YOUR EMAIL APP · NO DATA STORED</p>
        </form>
      </aside>
    </div>
  );
}
