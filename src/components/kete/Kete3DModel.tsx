import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface Kete3DModelProps {
  accentColor: string;
  accentLight: string;
  size?: number;
  className?: string;
}

/** Procedural woven kete basket in Three.js */
const KeteBasketMesh = ({ accentColor, accentLight }: { accentColor: string; accentLight: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.08;
      glowRef.current.scale.set(s, s, s);
    }
  });

  const weaveLines = useMemo(() => {
    const lines: JSX.Element[] = [];
    const color = new THREE.Color(accentColor);
    const lightColor = new THREE.Color(accentLight);

    // Horizontal weave rings
    for (let i = 0; i < 8; i++) {
      const y = -0.6 + i * 0.17;
      const radius = 0.5 + Math.sin((i / 7) * Math.PI) * 0.3;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(
        <line key={`h-${i}`} geometry={geometry}>
          <lineBasicMaterial color={i % 2 === 0 ? color : lightColor} transparent opacity={0.7} />
        </line>
      );
    }

    // Vertical weave strands
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= 32; j++) {
        const t = j / 32;
        const y = -0.6 + t * 1.36;
        const baseRadius = 0.5 + Math.sin(t * Math.PI) * 0.3;
        const wobble = Math.sin(t * Math.PI * 4 + i) * 0.03;
        points.push(new THREE.Vector3(
          Math.cos(angle) * (baseRadius + wobble),
          y,
          Math.sin(angle) * (baseRadius + wobble)
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(
        <line key={`v-${i}`} geometry={geometry}>
          <lineBasicMaterial color={i % 3 === 0 ? lightColor : color} transparent opacity={0.5} />
        </line>
      );
    }

    // Handle arc
    const handlePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const angle = -Math.PI * 0.3 + t * Math.PI * 0.6;
      handlePoints.push(new THREE.Vector3(
        Math.sin(angle) * 0.45,
        0.76 + Math.cos(angle) * 0.35,
        0
      ));
    }
    const handleGeo = new THREE.BufferGeometry().setFromPoints(handlePoints);
    lines.push(
      <line key="handle" geometry={handleGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.9} linewidth={2} />
      </line>
    );

    return lines;
  }, [accentColor, accentLight]);

  // Intersection glow nodes
  const glowNodes = useMemo(() => {
    const nodes: JSX.Element[] = [];
    const color = new THREE.Color(accentLight);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const y = -0.3 + Math.random() * 0.9;
      const radius = 0.5 + Math.sin(((y + 0.6) / 1.36) * Math.PI) * 0.3;
      nodes.push(
        <mesh key={`node-${i}`} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      );
    }
    return nodes;
  }, [accentLight]);

  return (
    <group ref={groupRef}>
      {/* Ambient glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.1, 16, 16]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {weaveLines}
      {glowNodes}
    </group>
  );
};

const Kete3DModel: React.FC<Kete3DModelProps> = ({
  accentColor,
  accentLight,
  size = 140,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
          filter: "blur(12px)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0.2, 2.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 3, 2]} intensity={0.8} color={accentLight} />
        <pointLight position={[-2, -1, 2]} intensity={0.3} color={accentColor} />
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
          <KeteBasketMesh accentColor={accentColor} accentLight={accentLight} />
        </Float>
      </Canvas>
    </div>
  );
};

export default Kete3DModel;
