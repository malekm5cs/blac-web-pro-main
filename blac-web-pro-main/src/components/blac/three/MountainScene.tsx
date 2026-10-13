import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform vec2 uPointer;
  uniform float uSize;
  attribute float aSeed;
  varying float vAlpha;
  varying float vHeight;

  // cheap value noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x),
               mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main(){
    vec3 pos = position;
    float d = length(pos.xz) * 0.16;

    float ridge = fbm(pos.xz * 0.16 + 12.0);
    ridge = pow(ridge, 1.6);
    float peak = exp(-d * d * 1.5);
    float h = ridge * 9.5 * peak + peak * 4.5;
    // travelling waves across the terrain
    h += sin(pos.x * 0.35 + uTime * 1.2) * cos(pos.z * 0.3 - uTime * 0.9) * 0.55;
    h += sin(length(pos.xz) * 0.8 - uTime * 2.0) * 0.25 * (1.0 - peak);

    // breathing
    float breath = sin(uTime * 0.42 - d * 1.1) * 0.5 + 0.5;
    h *= 0.82 + breath * 0.3;
    h += sin(uTime * 0.9 + aSeed * 6.28) * 0.06;

    // pointer ripple
    float pd = distance(pos.xz, uPointer * 14.0);
    h += exp(-pd * pd * 0.015) * 2.2 * uReveal;

    pos.y = h;

    // dissolve: particles drift out when uReveal is low
    vec3 drift = vec3(
      sin(aSeed * 31.0) , cos(aSeed * 17.0), sin(aSeed * 47.0)
    ) * (1.0 - uReveal) * 14.0;
    pos.xz += vec2(sin(uTime*0.6+aSeed*20.0), cos(uTime*0.5+aSeed*14.0)) * 0.08;
    pos += drift;

    vHeight = h;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (1.0 + h * 0.12) * (300.0 / -mv.z);
    vAlpha = uReveal * (0.25 + clamp(h * 0.22, 0.0, 0.75));
  }
`;

const fragment = /* glsl */ `
  varying float vAlpha;
  varying float vHeight;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float m = smoothstep(0.5, 0.05, length(c));
    float shade = 0.55 + clamp(vHeight * 0.09, 0.0, 0.45);
    gl_FragColor = vec4(vec3(shade), m * vAlpha);
    if (gl_FragColor.a < 0.01) discard;
  }
`;

function Terrain({ progress }: { progress: React.RefObject<number> }) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const { positions, seeds, count } = useMemo(() => {
    const isSmall = typeof window !== "undefined" && window.innerWidth < 768;
    const grid = isSmall ? 150 : 300;
    const n = grid * grid;
    const pos = new Float32Array(n * 3);
    const sd = new Float32Array(n);
    let i = 0;
    for (let x = 0; x < grid; x++) {
      for (let z = 0; z < grid; z++) {
        const fx = (x / (grid - 1) - 0.5) * 48;
        const fz = (z / (grid - 1) - 0.5) * 48;
        pos[i * 3] = fx + (Math.random() - 0.5) * 0.1;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = fz + (Math.random() - 0.5) * 0.1;
        sd[i] = Math.random();
        i++;
      }
    }
    return { positions: pos, seeds: sd, count: n };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uSize: { value: 0.06 },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms as {
      uTime: { value: number };
      uReveal: { value: number };
      uPointer: { value: THREE.Vector2 };
    };
    u.uTime.value += delta;
    u.uReveal.value = THREE.MathUtils.damp(
      u.uReveal.value,
      progress.current ?? 0,
      3,
      delta,
    );
    u.uPointer.value.lerp(
      new THREE.Vector2(state.pointer.x, state.pointer.y * 0.6),
      0.04,
    );
    if (ref.current) ref.current.rotation.y += delta * 0.06;
    const r = progress.current ?? 0;
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 3, 2, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 3 + r * 4 + state.pointer.y * 1.5, 2, delta);
    cam.position.z = THREE.MathUtils.damp(cam.position.z, 22 - r * 7, 2, delta);
    cam.lookAt(0, 1.2, 0);
  });

  return (
    <points ref={ref} position={[0, -2.2, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        key={count}
      />
    </points>
  );
}

export default function MountainScene({
  progress,
}: {
  progress: React.RefObject<number>;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true }}
      camera={{ position: [0, 3, 22], fov: 50 }}
      style={{ pointerEvents: "none" }}
    >
      <Terrain progress={progress} />
    </Canvas>
  );
}
