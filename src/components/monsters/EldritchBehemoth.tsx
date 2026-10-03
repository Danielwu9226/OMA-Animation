import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MonsterConfig } from '../../types';

interface MonsterProps {
  config: MonsterConfig;
}

export const EldritchBehemoth: React.FC<MonsterProps> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tentaclesRef = useRef<THREE.Group[]>([]);
  const coreRef = useRef<THREE.Mesh>(null);
  const eyeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * config.pulseSpeed;

    // Idle / Float rotation
    if (groupRef.current) {
      if (config.animation === 'float' || config.animation === 'idle') {
        groupRef.current.position.y = Math.sin(t * 1.5) * 0.25;
        groupRef.current.rotation.y = t * 0.2 * config.animationSpeed;
      } else if (config.animation === 'roar') {
        groupRef.current.position.y = Math.sin(t * 8) * 0.1;
        groupRef.current.rotation.y = Math.sin(t * 4) * 0.2;
      } else if (config.animation === 'spin') {
        groupRef.current.rotation.y = t * 2 * config.animationSpeed;
      } else if (config.animation === 'stomp') {
        groupRef.current.position.y = Math.abs(Math.sin(t * 4)) * 0.4;
      }
    }

    // Core pulsating scale
    if (coreRef.current) {
      const scalePulse = 1 + Math.sin(t * 3) * 0.08 * config.glowIntensity;
      coreRef.current.scale.set(scalePulse, scalePulse, scalePulse);
    }

    // Eye tracking effect
    if (eyeRef.current) {
      eyeRef.current.rotation.x = Math.sin(t * 2) * 0.15;
      eyeRef.current.rotation.y = Math.cos(t * 1.5) * 0.25;
    }

    // Undulating tentacles animation
    tentaclesRef.current.forEach((tentacle, idx) => {
      if (tentacle) {
        const offset = idx * (Math.PI / 4);
        tentacle.children.forEach((segment, segIdx) => {
          segment.rotation.z = Math.sin(t * 3 + offset + segIdx * 0.5) * 0.25;
          segment.rotation.x = Math.cos(t * 2 + offset + segIdx * 0.4) * 0.2;
        });
      }
    });
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
    emissiveIntensity: config.xray ? 2.5 : config.glowIntensity * 1.2,
    wireframe: config.wireframe,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.accentColor),
    roughness: 0.2,
    metalness: 0.8,
  });

  return (
    <group ref={groupRef} scale={[config.scale, config.scale, config.scale]}>
      {/* Central Eldritch Core */}
      <mesh ref={coreRef} material={bodyMaterial}>
        <sphereGeometry args={[1.2, 32, 32]} />
      </mesh>

      {/* Main Glowing Eye */}
      <group position={[0, 0.2, 1.1]}>
        <mesh material={glowMaterial}>
          <sphereGeometry args={[0.45, 24, 24]} />
        </mesh>
        {/* Pupil */}
        <mesh ref={eyeRef} position={[0, 0, 0.35]} material={accentMaterial}>
          <coneGeometry args={[0.15, 0.3, 16]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
      </group>

      {/* Horn Spikes */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * 0.9, 1.1, 0]} rotation={[0, 0, side * -0.4]}>
          <mesh material={accentMaterial}>
            <coneGeometry args={[0.25, 1.5, 12]} />
          </mesh>
          <mesh position={[0, 0.8, 0]} material={glowMaterial}>
            <coneGeometry args={[0.12, 0.8, 12]} />
          </mesh>
        </group>
      ))}

      {/* Undulating Tentacles */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 1.0;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius - 0.4;
        const z = (i % 2 === 0 ? 0.3 : -0.3);

        return (
          <group
            key={i}
            position={[x, y, z]}
            rotation={[0, angle, Math.PI / 2]}
            ref={(el) => {
              if (el) tentaclesRef.current[i] = el;
            }}
          >
            {/* Tentacle Segments */}
            {[0, 1, 2, 3].map((seg) => (
              <group key={seg} position={[seg * 0.5, -seg * 0.15, 0]}>
                <mesh material={seg % 2 === 0 ? bodyMaterial : glowMaterial}>
                  <cylinderGeometry args={[0.22 - seg * 0.04, 0.18 - seg * 0.04, 0.55, 12]} />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* Orbiting Rune Orbs */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(angle) * 2.2, Math.cos(angle) * 1.5, Math.sin(angle * 2) * 1.2]} material={glowMaterial}>
            <octahedronGeometry args={[0.2, 0]} />
          </mesh>
        );
      })}
    </group>
  );
};
