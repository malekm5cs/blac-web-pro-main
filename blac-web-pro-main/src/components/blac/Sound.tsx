import { useEffect, useSyncExternalStore } from "react";

// Synthesized UI sound engine (Web Audio, no files).
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;
let drone: { stop: () => void } | null = null;
let enabled = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  return enabled;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function ensure() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.22;
    const comp = ctx.createDynamicsCompressor();
    reverb = ctx.createConvolver();
    const seconds = 7;
    const impulse = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.8);
      }
    }
    reverb.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.58;
    master.connect(comp).connect(ctx.destination);
    master.connect(reverb).connect(wet).connect(comp);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, vol: number, type: OscillatorType = "sine", sweep = 1) {
  if (!enabled) return;
  const c = ensure();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(freq * sweep, c.currentTime + dur);
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  if (!master) return;
  o.connect(g).connect(master);
  o.start();
  o.stop(c.currentTime + dur + 0.02);
}

// PS4-style: soft glassy bell — fundamental + gentle inharmonic partials, long airy tail.
function bell(freq: number, vol: number, dur = 1.4) {
  tone(freq, dur, vol, "sine", 1);
  tone(freq * 2.004, dur * 0.72, vol * 0.28, "sine", 0.998);
  tone(freq * 3.012, dur * 0.42, vol * 0.09, "sine", 1.002);
}

export const sfx = {
  hover: () => {
    bell(1318.51, 0.009, 0.72);
  },
  click: () => {
    bell(659.25, 0.032, 1.5);
    window.setTimeout(() => bell(987.77, 0.022, 1.9), 85);
    window.setTimeout(() => bell(1318.51, 0.013, 2.5), 175);
  },
};

function startupChime() {
  const notes = [523.25, 659.25, 987.77, 1318.51];
  notes.forEach((note, index) => {
    window.setTimeout(() => enabled && bell(note, 0.018 - index * 0.002, 2.6 + index * 0.35), index * 145);
  });
}

function startDrone() {
  const c = ensure();
  if (!master) return null;
  const out = c.createGain();
  out.gain.value = 0;
  out.gain.linearRampToValueAtTime(0.012, c.currentTime + 7);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1450;
  filter.connect(out).connect(master);
  if (reverb) {
    const send = c.createGain();
    send.gain.value = 1.35;
    filter.connect(send).connect(reverb);
  }
  // Airy suspended harmony: each voicing overlaps so the ambience keeps evolving.
  const chords = [
    [110, 164.81, 220, 293.66, 329.63],
    [98, 146.83, 196, 246.94, 329.63],
    [123.47, 185, 246.94, 293.66, 369.99],
    [82.41, 164.81, 220, 277.18, 329.63],
    [92.5, 138.59, 207.65, 246.94, 311.13],
  ];
  const live = new Set<OscillatorNode>();
  let idx = 0;
  const playChord = () => {
    const chord = chords[idx % chords.length] ?? [110, 164.81, 220, 293.66, 329.63];
    idx += 1;
    const t = c.currentTime;
    const len = 14;
    chord.forEach((f, i) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.detune.value = (Math.random() - 0.5) * 7;
      const g = c.createGain();
      const peak = 0.42 / (1 + i * 0.55);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + 4 + i * 0.35);
      g.gain.linearRampToValueAtTime(peak * 0.62, t + len - 4);
      g.gain.linearRampToValueAtTime(0, t + len);
      o.connect(g).connect(filter);
      o.start(t);
      o.stop(t + len + 0.1);
      live.add(o);
      o.onended = () => live.delete(o);
    });
    // Sparse high notes keep the soundscape melodic without becoming repetitive.
    const upperNotes = [987.77, 1108.73, 1318.51, 1479.98, 1760];
    const top = upperNotes[Math.floor(Math.random() * upperNotes.length)] ?? 1318.51;
    window.setTimeout(() => enabled && bell(top, 0.0035, 4.2), 3200 + Math.random() * 4200);
  };
  playChord();
  const timer = window.setInterval(playChord, 10500);
  return {
    stop: () => {
      window.clearInterval(timer);
      out.gain.cancelScheduledValues(c.currentTime);
      out.gain.setValueAtTime(out.gain.value, c.currentTime);
      out.gain.linearRampToValueAtTime(0, c.currentTime + 1.2);
      setTimeout(() => live.forEach((o) => { try { o.stop(); } catch { /* already stopped */ } }), 1300);
    },
  };
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(next: boolean) {
  if (next === enabled) return;
  enabled = next;
  if (enabled) {
    ensure();
    drone = startDrone() ?? null;
    startupChime();
  } else {
    drone?.stop();
    drone = null;
  }
  notify();
}

export function SoundToggle() {
  const on = useSyncExternalStore(subscribe, snapshot, () => false);

  useEffect(() => {
    const key = "__blacSfxBound";
    const registry = window as unknown as Record<string, boolean>;
    if (registry[key]) return;
    registry[key] = true;
    let last: Element | null = null;
    const over = (e: PointerEvent) => {
      const t = (e.target as Element)?.closest?.("a,button,[data-cursor]");
      if (t && t !== last) sfx.hover();
      last = t;
    };
    const out = () => { last = null; };
    const down = (e: PointerEvent) => {
      if ((e.target as Element)?.closest?.("a,button,[data-cursor]")) sfx.click();
    };
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerout", out);
    window.addEventListener("pointerdown", down);
    const visibility = () => {
      if (!document.hidden && enabled && ctx?.state === "suspended") void ctx.resume();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerout", out);
      window.removeEventListener("pointerdown", down);
      document.removeEventListener("visibilitychange", visibility);
      registry[key] = false;
    };
  }, []);

  const toggle = () => setSoundEnabled(!enabled);

  return (
    <button
      onClick={toggle}
      aria-label={on ? "Mute sound" : "Enable sound"}
      data-cursor="hot"
      aria-pressed={on}
      className="flex h-9 items-center gap-2.5 rounded-full border border-border px-3.5 font-mono text-[10px] tracking-[0.25em] text-muted-foreground transition-[color,border-color,transform] duration-500 hover:border-foreground/50 hover:text-foreground active:scale-95"
    >
      <span className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-[2px] bg-foreground"
            style={{
              height: on ? "100%" : "25%",
              animation: on ? `eq 0.9s ${i * 0.15}s ease-in-out infinite alternate` : "none",
              transition: "height .4s",
            }}
          />
        ))}
      </span>
      <span className="hidden sm:inline">{on ? "AMBIENCE ON" : "AMBIENCE OFF"}</span>
    </button>
  );
}
