import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vert = /* glsl */ `
uniform float uMorph; uniform float uTime; varying vec3 vN; varying float vF;
vec3 shape(vec3 d, float i){
  if(i<0.5) return d;
  if(i<1.5){ vec3 a=abs(d); return d/max(a.x,max(a.y,a.z))*0.85; }
  if(i<2.5){ vec3 a=abs(d); return d/(a.x+a.y+a.z)*1.35; }
  float s = 0.75 + 0.55*pow(abs(sin(d.x*5.0)*sin(d.y*5.0)*sin(d.z*5.0)),0.6);
  return d*s;
}
void main(){
  vec3 d = normalize(position);
  float m = clamp(uMorph,0.0,3.0);
  float i = floor(m); float f = smoothstep(0.0,1.0,fract(m));
  vec3 p = mix(shape(d,i), shape(d,min(i+1.0,3.0)), f) * 1.5;
  p += d*sin(uTime*1.2 + d.y*6.0)*0.02;
  vN = normalize(normalMatrix*d);
  vF = pow(1.0-abs(dot(vN,vec3(0,0,1))),2.0);
  gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`;
const frag = /* glsl */ `
varying vec3 vN; varying float vF;
void main(){ vec3 c = vec3(0.05) + vec3(0.9)*vF + vec3(0.12)*max(dot(vN,normalize(vec3(0.5,0.8,0.6))),0.0);
gl_FragColor = vec4(c,1.0);}`;

function Morph({ progress }: { progress: React.RefObject<number> }) {
  const m = useRef<THREE.Mesh>(null);
  const w = useRef<THREE.Mesh>(null);
  const uni = useMemo(() => ({ uMorph: { value: 0 }, uTime: { value: 0 } }), []);
  const mats = useRef<THREE.ShaderMaterial[]>([]);
  useFrame((s, d) => {
    const dt = Math.min(d, 0.05);
    const p = progress.current ?? 0;
    uni.uTime.value += dt;
    uni.uMorph.value = THREE.MathUtils.damp(uni.uMorph.value, p * 3, 8, dt);
    mats.current.forEach((mt) => {
      if (!mt?.uniforms?.['uMorph']) return;
      mt.uniforms['uMorph'].value = uni.uMorph.value;
      mt.uniforms['uTime']!.value = uni.uTime.value;
    });
    for (const mesh of [m.current, w.current]) {
      if (!mesh) continue;
      mesh.rotation.y = THREE.MathUtils.damp(mesh.rotation.y, p * Math.PI * 3 + s.pointer.x * 0.4, 6, dt);
      mesh.rotation.x = THREE.MathUtils.damp(mesh.rotation.x, p * Math.PI + -s.pointer.y * 0.3, 6, dt);
    }
  });
  return (
    <>
      <mesh ref={m}>
        <icosahedronGeometry args={[1, 48]} />
        <shaderMaterial ref={(r: THREE.ShaderMaterial | null) => { if (r) mats.current[0] = r; }} vertexShader={vert} fragmentShader={frag} uniforms={{ uMorph: { value: 0 }, uTime: { value: 0 } }} />
      </mesh>
      <mesh ref={w} scale={1.08}>
        <icosahedronGeometry args={[1, 12]} />
        <shaderMaterial ref={(r: THREE.ShaderMaterial | null) => { if (r) mats.current[1] = r; }} vertexShader={vert} fragmentShader={frag} uniforms={{ uMorph: { value: 0 }, uTime: { value: 0 } }} wireframe transparent opacity={0.15} />
      </mesh>
    </>
  );
}

export default function MorphScene({ progress }: { progress: React.RefObject<number> }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <Morph progress={progress} />
    </Canvas>
  );
}
