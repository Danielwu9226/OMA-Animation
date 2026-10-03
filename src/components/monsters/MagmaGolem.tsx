import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MonsterConfig } from '../../types';

interface MonsterProps {
  config: MonsterConfig;
}

export const MagmaGolem: React.FC<MonsterProps> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreGlowRef = useRef<THREE.Mesh>(null);
  const leftShoulderRef = useRef<THREE.Mesh>(null);
  const rightShoulderRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * config.pulseSpeed;

    if (groupRef.current) {
      if (config.animation === 'stomp' || config.animation === 'idle') {
        groupRef.current.position.y = Math.abs(Math.sin(t * 3)) * 0.2;
        groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.15;
      } else if (config.animation === 'roar') {
        groupRef.current.position.y = Math.abs(Math.sin(t * 6)) * 0.35;
        groupRef.current.rotation.x = Math.sin(t * 4) * 0.1;
      } else if (config.animation === 'spin') {
        groupRef.current.rotation.y = t * 2.5 * config.animationSpeed;
      } else if (config.animation === 'float') {
        groupRef.current.position.y = 0.5 + Math.sin(t * 2) * 0.25;
      }
    }

    if (coreGlowRef.current) {
      const pulse = 1 + Math.sin(t * 5) * 0.2 * config.glowIntensity;
      coreGlowRef.current.scale.set(pulse, pulse, pulse);
    }

    if (leftShoulderRef.current && rightShoulderRef.current) {
      leftShoulderRef.current.rotation.x = Math.sin(t * 2) * 0.2;
      rightShoulderRef.current.rotation.x = -Math.sin(t * 2) * 0.2;
    }
  });

  const rockMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.primaryColor),
    roughness: 0.9,
    metalness: 0.1,
    wireframe: config.wireframe,
  });

  const lavaMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.glowColor),
    emissive: new THREE.Color(config.glowColor),
    emissiveIntensity: config.glowIntensity * 1.8,
    wireframe: config.wireframe,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.accentColor),
    roughness: 0.5,
    metalness: 0.5,
  });

  return (
    <group ref={groupRef} scale={[config.scale, config.scale, config.scale]}>
      {/* Molten Lava Inner Core */}
      <mesh ref={coreGlowRef} material={lavaMaterial} position={[0, 0.2, 0]}>
        <dodecahedronGeometry args={[1.1, 1]} />
      </mesh>

      {/* Floating Rock Armor Plates */}
      {/* Torso Front Plate */}
      <mesh position={[0, 0.4, 0.8]} material={rockMaterial}>
        <dodecahedronGeometry args={[0.7, 0]} />
      </mesh>
      {/* Torso Back Plate */}
      <mesh position={[0, 0.3, -0.8]} material={rockMaterial}>
        <dodecahedronGeometry args={[0.75, 0]} />
      </mesh>

      {/* Heavy Golem Head */}
      <group position={[0, 1.5, 0.3]}>
        <mesh material={rockMaterial}>
          <boxGeometry args={[1.0, 0.7, 0.9]} />
        </mesh>
        {/* Glowing Lava Slit Eyes */}
        <mesh position={[0, 0.1, 0.46]} material={lavaMaterial}>
          <boxGeometry args={[0.7, 0.12, 0.1]} />
        </mesh>
      </group>

      {/* Giant Boulder Shoulders & Arms */}
      <mesh ref={leftShoulderRef} position={[-1.4, 0.8, 0]} material={rockMaterial}>
        <dodecahedronGeometry args={[0.65, 0]} />
      </mesh>
      <mesh ref={rightShoulderRef} position={[1.4, 0.8, 0]} material={rockMaterial}>
        <dodecahedronGeometry args={[0.65, 0]} />
      </mesh>

      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * 1.3, -0.2, 0]}>
          <mesh material={rockMaterial}>
            <cylinderGeometry args={[0.35, 0.45, 1.2, 6]} />
          </mesh>
          <mesh position={[0, -0.7, 0.2]} material={accentMaterial}>
            <dodecahedronGeometry args={[0.35, 0]} />
          </mesh>
        </group>
      ))}

      {/* Heavy Stomping Pillar Legs */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * 0.75, -1.2, 0]}>
          <mesh material={rockMaterial}>
            <boxGeometry args={[0.7, 1.1, 0.8]} />
          </mesh>
          <mesh position={[0, -0.5, 0.1]} material={lavaMaterial}>
            <boxGeometry args={[0.75, 0.2, 0.85]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
