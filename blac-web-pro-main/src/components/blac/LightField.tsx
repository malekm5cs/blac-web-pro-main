/** Ambient light layer: cursor spotlight, drifting aurora orbs, sweeping beams. */
export function LightField() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      <div className="light-orb light-orb-a" />
      <div className="light-orb light-orb-b" />
      <div className="light-orb light-orb-c" />
      <div className="light-beam" />
      <div className="light-beam light-beam-2" />
      <div className="light-spot" />
    </div>
  );
}
