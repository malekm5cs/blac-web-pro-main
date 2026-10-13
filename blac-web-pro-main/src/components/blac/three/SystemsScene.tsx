import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    return () => {
      tex.dispose();
      pm.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

function SystemCore() {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, t * 0.25 + state.pointer.x * 0.8, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.15 - state.pointer.y * 0.25, 3, delta);
    g.position.y = Math.sin(t * 0.8) * 0.08 - 0.3;
  });
  const mat = (
    <meshPhysicalMaterial color="#cfcfcf" metalness={1} roughness={0.15} clearcoat={1} flatShading />
  );
  return (
    <group ref={group}>
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.2, 2]} />
        {mat}
      </mesh>
      <mesh position={[1.9, -0.35, -0.8]}>
        <torusKnotGeometry args={[0.55, 0.16, 120, 20, 2, 3]} />
        {mat}
      </mesh>
      <mesh position={[-1.7, -0.5, 0.6]}>
        <octahedronGeometry args={[0.72, 1]} />
        {mat}
      </mesh>
      <mesh position={[0, -0.97, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[2.6, 2.62, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 900;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 2 + Math.random() * 4;
      const a = Math.random() * Math.PI * 2;
      p[i * 3] = Math.cos(a) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * 4;
      p[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y -= d * 0.05;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.02} color="#ffffff" transparent opacity={0.6} />
    </points>
  );
}

export default function SystemsScene() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.8, 6], fov: 40 }} gl={{ antialias: true, alpha: true }}>
      <Env />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 3]} intensity={2} />
      <SystemCore />
      <Dust />
    </Canvas>
  );
}
