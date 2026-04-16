import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/** Organic blob geometry using perturbed sphere */
function GlassBlob() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const mouseCurrent = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  // Create organic blob geometry
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.8, 64);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const offset = 0.2 * (
        Math.sin(v.x * 2.5 + v.y * 1.8) * 0.6 +
        Math.sin(v.y * 3.2 + v.z * 2.1) * 0.4 +
        Math.sin(v.z * 2.8 + v.x * 1.5) * 0.3
      );
      v.normalize().multiplyScalar(1.8 + offset);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseTarget.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Gentle continuous rotation
    meshRef.current.rotation.y += 0.3 * delta;
    meshRef.current.rotation.x += 0.05 * delta;

    // Lerp toward mouse
    mouseCurrent.current.lerp(mouseTarget.current, 0.03);
    meshRef.current.rotation.z = mouseCurrent.current.x * 0.15;
    meshRef.current.rotation.x += mouseCurrent.current.y * 0.08;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6} floatingRange={[-0.15, 0.15]}>
      <mesh ref={meshRef} geometry={geometry} scale={viewport.width > 6 ? 1 : 0.75}>
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.5}
          chromaticAberration={0.15}
          anisotropy={0.3}
          distortion={0.3}
          distortionScale={0.3}
          temporalDistortion={0.15}
          transmission={1}
          roughness={0.1}
          ior={1.5}
          color="#B8E8E0"
          attenuationColor="#E8A948"
          attenuationDistance={2.5}
        />
      </mesh>
    </Float>
  );
}

export default function HeroGlassBlob({ className = "" }: { className?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`w-full h-full ${className}`}
      style={{ opacity: loaded ? 1 : 0, transition: "opacity 1.2s ease-out" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => setTimeout(() => setLoaded(true), 200)}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#E8A948" />
        <Environment preset="city" />
        <GlassBlob />
      </Canvas>
    </div>
  );
}
