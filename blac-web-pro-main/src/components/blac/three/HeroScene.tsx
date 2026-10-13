import { useMemo, useRef } from "react";
import { useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const p = ref.current;
    if (!p) return;
    const t = state.clock.elapsedTime;
    p.rotation.y = t * 0.02;
    p.position.x = state.pointer.x * 0.6;
    p.position.y = state.pointer.y * 0.35;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#ffffff"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Forms() {
  const group = useRef<THREE.Group>(null);
  const shard = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        state.pointer.x * 0.4,
        2,
        delta,
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        -state.pointer.y * 0.28,
        2,
        delta,
      );
    }
    if (shard.current) {
      shard.current.rotation.x = t * 0.1;
      shard.current.rotation.z = t * 0.07;
      shard.current.position.y = Math.sin(t * 0.5) * 0.25;
    }
    if (ringA.current) {
      ringA.current.rotation.z = -t * 0.14;
      ringA.current.rotation.x = Math.sin(t * 0.3) * 0.4;
    }
  });

  const scale = Math.min(1, viewport.width / 10);

  return (
    <group ref={group} scale={scale}>
      <mesh ref={shard} position={[0, 0, -3]}>
        <icosahedronGeometry args={[2.6, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.16} />
      </mesh>
      <mesh ref={ringA} position={[0, 0, -2]}>
        <torusGeometry args={[4.2, 0.004, 3, 160]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      <mesh position={[-3.8, 1.5, -1.5]} rotation={[-0.4, -0.6, 0.1]}>
        <planeGeometry args={[2.4, 3.6]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  const count =
    typeof window !== "undefined" && window.innerWidth < 768 ? 700 : 2400;

  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      camera={{ position: [0, 0, 7], fov: 45 }}
      style={{ pointerEvents: "none" }}
    >
      <fog attach="fog" args={["#000000", 6, 20]} />
      <directionalLight position={[4, 5, 3]} intensity={1.2} />
      <Particles count={count} />
      <Forms />
    </Canvas>
  );
}
