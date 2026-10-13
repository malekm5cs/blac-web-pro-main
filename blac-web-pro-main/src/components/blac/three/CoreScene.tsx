import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vert = /* glsl */ `
uniform float uTime; uniform float uAmp; varying vec3 vN; varying float vD;
vec3 hash(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));return -1.0+2.0*fract(sin(p)*43758.5453);}
float noise(vec3 p){vec3 i=floor(p);vec3 f=fract(p);vec3 u=f*f*(3.0-2.0*f);
return mix(mix(mix(dot(hash(i),f),dot(hash(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),mix(dot(hash(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(hash(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
mix(mix(dot(hash(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(hash(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),mix(dot(hash(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(hash(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z);}
void main(){ float d = noise(normal*1.6+uTime*0.35)*uAmp + noise(normal*4.0-uTime*0.5)*uAmp*0.3;
vD=d; vec3 p = position + normal*d; vN = normalize(normalMatrix*normal);
gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0);}`;
const frag = /* glsl */ `
varying vec3 vN; varying float vD;
void main(){ float f = pow(1.0-abs(dot(vN,vec3(0,0,1))),2.2);
float band = smoothstep(0.0,0.02,abs(fract(vD*14.0)-0.5)-0.44);
vec3 c = vec3(0.04) + vec3(0.95)*f + vec3(0.35)*band*(0.3+f);
gl_FragColor = vec4(c,1.0);}`;

function Blob({ progress }: { progress: React.RefObject<number> }) {
  const m = useRef<THREE.Mesh>(null);
  const uni = useMemo(() => ({ uTime: { value: 0 }, uAmp: { value: 0.3 } }), []);
  useFrame((s, d) => {
    const dt = Math.min(d, 0.05);
    const p = progress.current ?? 0;
    uni.uTime.value += dt;
    uni.uAmp.value = THREE.MathUtils.damp(uni.uAmp.value, 0.15 + p * 0.75, 3, dt);
    if (m.current) {
      m.current.rotation.y += dt * 0.2;
      m.current.rotation.x = THREE.MathUtils.damp(m.current.rotation.x, s.pointer.y * 0.5 + p * 1.5, 3, dt);
      m.current.rotation.z = THREE.MathUtils.damp(m.current.rotation.z, s.pointer.x * 0.5, 3, dt);
    }
  });
  return (
    <mesh ref={m}>
      <icosahedronGeometry args={[1.6, 64]} />
      <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uni} />
    </mesh>
  );
}

function Rings({ progress }: { progress: React.RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    const p = progress.current ?? 0;
    g.current?.children.forEach((c, i) => {
      c.rotation.x += d * (0.1 + i * 0.05);
      c.rotation.y += d * (0.15 - i * 0.03);
      c.scale.setScalar(1 + p * (0.3 + i * 0.15));
    });
  });
  return (
    <group ref={g}>
      {[2.4, 2.9, 3.4].map((r) => (
        <mesh key={r}>
          <torusGeometry args={[r, 0.004, 8, 200]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

export default function CoreScene({ progress }: { progress: React.RefObject<number> }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <Blob progress={progress} />
      <Rings progress={progress} />
    </Canvas>
  );
}
