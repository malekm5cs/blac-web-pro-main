import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = { active?: boolean; size?: "sm" | "lg" };

function Core({ active, color, dense }: { active: boolean; color: string; dense: boolean }) {
  const group = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const dust = useRef<THREE.Points>(null);
  const energy = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  const dustGeo = useMemo(() => {
    const n = dense ? 260 : 90;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 1.6 + Math.random() * 1.1;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos.set([r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [dense]);

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const t = state.clock.elapsedTime;
    energy.current += ((active ? 1 : 0) - energy.current) * (1 - Math.exp(-3 * dt));
    const e = energy.current;
    pointer.current.x += (state.pointer.x - pointer.current.x) * (1 - Math.exp(-4 * dt));
    pointer.current.y += (state.pointer.y - pointer.current.y) * (1 - Math.exp(-4 * dt));
    if (group.current) {
      group.current.rotation.y = pointer.current.x * 0.5;
      group.current.rotation.x = -pointer.current.y * 0.4;
      group.current.position.y = Math.sin(t * 0.9) * 0.08;
    }
    if (outer.current) {
      outer.current.rotation.y += dt * (0.25 + e * 1.4);
      outer.current.rotation.z += dt * (0.12 + e * 0.6);
      outer.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.03 + e * 0.08);
    }
    if (inner.current) {
      inner.current.rotation.y -= dt * (0.5 + e * 2);
      inner.current.rotation.x += dt * 0.3;
      inner.current.scale.setScalar(0.55 + Math.sin(t * 2.2) * 0.06 + e * Math.sin(t * 9) * 0.06);
    }
    if (ring.current) ring.current.rotation.z += dt * (0.4 + e * 2);
    if (ring2.current) ring2.current.rotation.z -= dt * (0.3 + e * 1.5);
    if (dust.current) {
      dust.current.rotation.y += dt * (0.08 + e * 0.5);
      dust.current.rotation.x = Math.sin(t * 0.2) * 0.3;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
      </mesh>
      <mesh ref={inner}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} flatShading metalness={0.3} roughness={0.35} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.55, 0.008, 6, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 1.7, 0.6, 0]}>
        <torusGeometry args={[1.8, 0.006, 6, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <points ref={dust} geometry={dustGeo}>
        <pointsMaterial color={color} size={dense ? 0.035 : 0.06} transparent opacity={0.7} sizeAttenuation />
      </points>
    </group>
  );
}

export default function StellaOrb({ active = false, size = "sm" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState("#e9ecf5");

  useEffect(() => {
    const read = () => ref.current && setColor(getComputedStyle(ref.current).color);
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  return (
    <div ref={ref} className="size-full text-foreground">
      <Canvas dpr={[1, 1.75]} gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, size === "lg" ? 5.2 : 4.6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 4]} intensity={30} />
        <pointLight position={[-3, -2, 2]} intensity={12} />
        <Core active={active} color={color} dense={size === "lg"} />
      </Canvas>
    </div>
  );
}
