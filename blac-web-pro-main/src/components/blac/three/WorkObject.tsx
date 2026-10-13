import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type Shape = "knot" | "ico" | "torus" | "octa";

function Obj({ shape, hover }: { shape: Shape; hover: React.RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const wire = useRef<THREE.Mesh>(null);
  useFrame((s, d) => {
    const dt = Math.min(d, 0.05);
    const h = hover.current ?? 0;
    if (!g.current) return;
    g.current.rotation.y += dt * (0.25 + h * 1.4);
    g.current.rotation.x += dt * (0.12 + h * 0.6);
    g.current.rotation.z = THREE.MathUtils.damp(g.current.rotation.z, s.pointer.x * 0.4, 3, dt);
    const sc = 1 + h * 0.12 + Math.sin(s.clock.elapsedTime * 1.3) * 0.02;
    g.current.scale.setScalar(THREE.MathUtils.damp(g.current.scale.x, sc, 5, dt));
    if (wire.current) wire.current.scale.setScalar(1.18 + h * 0.25);
  });
  const geo = () => {
    switch (shape) {
      case "knot": return <torusKnotGeometry args={[0.9, 0.28, 220, 32, 2, 3]} />;
      case "ico": return <icosahedronGeometry args={[1.2, 1]} />;
      case "torus": return <torusGeometry args={[1, 0.38, 64, 160]} />;
      default: return <octahedronGeometry args={[1.25, 0]} />;
    }
  };
  return (
    <group ref={g}>
      <mesh>
        {geo()}
        <meshPhysicalMaterial
          color="#d9d9d9"
          metalness={1}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.1}
          flatShading={shape === "ico" || shape === "octa"}
        />
      </mesh>
      <mesh ref={wire}>
        {geo()}
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

export default function WorkObject({ shape, hover }: { shape: Shape; hover: React.RefObject<number> }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.2], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={3} />
      <directionalLight position={[-4, -2, -3]} intensity={1.5} color="#9aa" />
      <pointLight position={[0, 0, 3]} intensity={6} distance={8} />
      <Obj shape={shape} hover={hover} />
    </Canvas>
  );
}
