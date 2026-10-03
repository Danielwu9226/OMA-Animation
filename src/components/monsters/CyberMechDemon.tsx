import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MonsterConfig } from '../../types';

interface MonsterProps {
  config: MonsterConfig;
}

export const CyberMechDemon: React.FC<MonsterProps> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringLeftRef = useRef<THREE.Mesh>(null);
  const ringRightRef = useRef<THREE.Mesh>(null);
  const chestCoreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * config.pulseSpeed;

    if (groupRef.current) {
      if (config.animation === 'idle') {
        groupRef.current.position.y = Math.sin(t * 2) * 0.1;
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
      } else if (config.animation === 'roar') {
        groupRef.current.rotation.x = Math.sin(t * 5) * 0.15;
        groupRef.current.position.y = Math.sin(t * 6) * 0.2;
      } else if (config.animation === 'spin') {
        groupRef.current.rotation.y = t * 3 * config.animationSpeed;
      } else if (config.animation === 'float') {
        groupRef.current.position.y = Math.sin(t * 2.5) * 0.35;
      } else if (config.animation === 'stomp') {
        groupRef.current.position.y = Math.max(0, Math.sin(t * 5) * 0.3);
      }
    }

    if (ringLeftRef.current && ringRightRef.current) {
      ringLeftRef.current.rotation.z = t * 4;
      ringRightRef.current.rotation.z = -t * 4;
    }

    if (chestCoreRef.current) {
      const pulse = 1 + Math.sin(t * 6) * 0.15 * config.glowIntensity;
      chestCoreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const armorMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.primaryColor),
    roughness: config.roughness,
    metalness: config.metalness,
    wireframe: config.wireframe,
  });

  const glowMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.glowColor),
    emissive: new THREE.Color(config.glowColor),
    emissiveIntensity: config.glowIntensity * 1.5,
    wireframe: config.wireframe,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.accentColor),
    roughness: 0.1,
    metalness: 0.9,
  });

  return (
    <group ref={groupRef} scale={[config.scale, config.scale, config.scale]}>
      {/* Mech Torso */}
      <mesh position={[0, 0, 0]} material={armorMaterial}>
        <boxGeometry args={[1.6, 2.0, 1.2]} />
      </mesh>

      {/* Pulsing Energy Core */}
      <mesh ref={chestCoreRef} position={[0, 0.3, 0.65]} material={glowMaterial}>
        <octahedronGeometry args={[0.35, 0]} />
      </mesh>

      {/* Head / Helmet */}
      <group position={[0, 1.4, 0.1]}>
        <mesh material={armorMaterial}>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
        </mesh>

        {/* Visor */}
        <mesh position={[0, 0.1, 0.48]} material={glowMaterial}>
          <boxGeometry args={[0.75, 0.25, 0.1]} />
        </mesh>

        {/* Horns */}
        {[-1, 1].map((side, i) => (
          <group key={i} position={[side * 0.55, 0.45, 0]} rotation={[0.2, 0, side * -0.5]}>
            <mesh material={accentMaterial}>
              <coneGeometry args={[0.18, 1.2, 8]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Shoulder Thrusters & Plasma Cannons */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * 1.3, 0.8, 0]}>
          <mesh material={accentMaterial}>
            <boxGeometry args={[0.7, 0.7, 0.9]} />
          </mesh>

          {/* Plasma Barrel */}
          <mesh position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]} material={armorMaterial}>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
          </mesh>

          {/* Spinning Energy Rings */}
          <mesh
            ref={side === -1 ? ringLeftRef : ringRightRef}
            position={[0, 0, 1.1]}
            material={glowMaterial}
          >
            <torusGeometry args={[0.25, 0.05, 12, 24]} />
          </mesh>
        </group>
      ))}

      {/* Mechanical Arms */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * 1.1, -0.2, 0]}>
          <mesh material={armorMaterial}>
            <boxGeometry args={[0.45, 1.2, 0.5]} />
          </mesh>
          {/* Claws */}
          <mesh position={[0, -0.7, 0.2]} material={accentMaterial}>
            <coneGeometry args={[0.15, 0.6, 4]} rotation={[Math.PI / 4, 0, 0]} />
          </mesh>
        </group>
      ))}

      {/* Legs & Base Thruster */}
      <group position={[0, -1.3, 0]}>
        <mesh material={accentMaterial}>
          <cylinderGeometry args={[0.5, 0.2, 0.8, 8]} />
        </mesh>
        <mesh position={[0, -0.5, 0]} material={glowMaterial}>
          <coneGeometry args={[0.35, 0.6, 16]} rotation={[Math.PI, 0, 0]} />
        </mesh>
      </group>
    </group>
  );
};
