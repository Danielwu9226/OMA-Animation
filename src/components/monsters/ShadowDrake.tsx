import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MonsterConfig } from '../../types';

interface MonsterProps {
  config: MonsterConfig;
}

export const ShadowDrake: React.FC<MonsterProps> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * config.pulseSpeed;

    if (groupRef.current) {
      if (config.animation === 'float' || config.animation === 'idle') {
        groupRef.current.position.y = Math.sin(t * 2) * 0.3;
        groupRef.current.rotation.x = Math.sin(t * 1.5) * 0.05;
      } else if (config.animation === 'roar') {
        groupRef.current.rotation.x = -Math.PI * 0.1 + Math.sin(t * 6) * 0.1;
        groupRef.current.position.y = 0.2 + Math.sin(t * 5) * 0.15;
      } else if (config.animation === 'spin') {
        groupRef.current.rotation.y = t * 3 * config.animationSpeed;
      } else if (config.animation === 'stomp') {
        groupRef.current.position.y = Math.abs(Math.sin(t * 4)) * 0.3;
      }
    }

    // Wing Flapping Animation
    const wingFlap = Math.sin(t * 4 * config.animationSpeed) * 0.45;
    if (leftWingRef.current && rightWingRef.current) {
      leftWingRef.current.rotation.z = wingFlap;
      rightWingRef.current.rotation.z = -wingFlap;
    }

    // Tail Wagging Animation
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 3) * 0.4;
    }
  });

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.primaryColor),
    roughness: config.roughness,
    metalness: config.metalness,
    wireframe: config.wireframe,
  });

  const glowMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.glowColor),
    emissive: new THREE.Color(config.glowColor),
    emissiveIntensity: config.glowIntensity * 1.4,
    wireframe: config.wireframe,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.accentColor),
    roughness: 0.3,
    metalness: 0.7,
  });

  return (
    <group ref={groupRef} scale={[config.scale, config.scale, config.scale]}>
      {/* Drake Body Torso */}
      <mesh material={bodyMaterial} position={[0, 0, 0]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.4, 2.2, 16]} />
      </mesh>

      {/* Dragon Head */}
      <group position={[0, 1.3, 0.4]} rotation={[-0.2, 0, 0]}>
        <mesh material={bodyMaterial}>
          <coneGeometry args={[0.5, 1.2, 12]} rotation={[-Math.PI / 2, 0, 0]} />
        </mesh>
        {/* Glowing Eyes */}
        {[-1, 1].map((side, i) => (
          <mesh key={i} position={[side * 0.25, 0.2, 0.2]} material={glowMaterial}>
            <sphereGeometry args={[0.12, 12, 12]} />
          </mesh>
        ))}
        {/* Horn Spikes */}
        {[-1, 1].map((side, i) => (
          <mesh key={i} position={[side * 0.35, 0.4, -0.4]} rotation={[-0.5, 0, side * -0.3]} material={accentMaterial}>
            <coneGeometry args={[0.12, 0.9, 8]} />
          </mesh>
        ))}
      </group>

      {/* Flapping Wings */}
      {/* Left Wing */}
      <group position={[-0.6, 0.5, -0.2]} ref={leftWingRef}>
        <mesh position={[-1.2, 0, 0]} rotation={[0, 0, 0.3]} material={accentMaterial}>
          <boxGeometry args={[2.2, 0.08, 1.4]} />
        </mesh>
        <mesh position={[-1.6, 0, 0.2]} material={glowMaterial}>
          <coneGeometry args={[0.4, 1.8, 3]} rotation={[0, 0, Math.PI / 2]} />
        </mesh>
      </group>

      {/* Right Wing */}
      <group position={[0.6, 0.5, -0.2]} ref={rightWingRef}>
        <mesh position={[1.2, 0, 0]} rotation={[0, 0, -0.3]} material={accentMaterial}>
          <boxGeometry args={[2.2, 0.08, 1.4]} />
        </mesh>
        <mesh position={[1.6, 0, 0.2]} material={glowMaterial}>
          <coneGeometry args={[0.4, 1.8, 3]} rotation={[0, 0, -Math.PI / 2]} />
        </mesh>
      </group>

      {/* Spiked Back Ridge */}
      {[0.8, 0.4, 0, -0.4, -0.8].map((yPos, i) => (
        <mesh key={i} position={[0, yPos, -0.5]} rotation={[0.4, 0, 0]} material={glowMaterial}>
          <coneGeometry args={[0.15, 0.5, 6]} />
        </mesh>
      ))}

      {/* Serpent Tail */}
      <group position={[0, -1.1, -0.6]} ref={tailRef}>
        <mesh material={bodyMaterial} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.1, 1.8, 12]} />
        </mesh>
        <mesh position={[0, -0.9, -0.4]} material={glowMaterial}>
          <octahedronGeometry args={[0.3, 0]} />
        </mesh>
      </group>
    </group>
  );
};
