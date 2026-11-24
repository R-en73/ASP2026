import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

function FloatingForms() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.18;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.08;
  });

  return (
    <group ref={group}>
      <mesh position={[-1.5, 0.7, 0]} rotation={[0.4, 0.6, 0]}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#56d8ff" metalness={0.45} roughness={0.2} />
      </mesh>
      <mesh position={[1.45, -0.55, 0.2]} rotation={[0.2, 0.4, 0.7]}>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
        <meshStandardMaterial color="#79ff8a" metalness={0.35} roughness={0.25} />
      </mesh>
      <mesh position={[0.2, 1.45, -0.4]} rotation={[0.5, 0.2, 0]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#3569ff" metalness={0.5} roughness={0.15} />
      </mesh>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div
      className="absolute inset-0"
      role="img"
      aria-label="青と緑の3Dクリスタルによる空間表現"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[4, 5, 6]} intensity={2} color="#ffffff" />
        <pointLight position={[-3, -2, 4]} intensity={1.2} color="#36d9ff" />
        <FloatingForms />
      </Canvas>
    </div>
  );
}
