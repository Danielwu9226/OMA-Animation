import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MonsterConfig } from '../../types';

interface MonsterProps {
  config: MonsterConfig;
}

export const HydraSerpent: React.FC<MonsterProps> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * config.pulseSpeed;

    if (groupRef.current) {
      if (config.animation === 'float' || config.animation === 'idle') {
        groupRef.current.position.y = Math.sin(t * 1.8) * 0.2;
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
      } else if (config.animation === 'spin') {
        groupRef.current.rotation.y = t * 2.5 * config.animationSpeed;
      }
    }

    // Dynamic S-curve serpentine sway for each head
    headRefs.current.forEach((head, idx) => {
      if (head) {
        const offset = idx * 1.5;
        head.rotation.y = Math.sin(t * 2 + offset) * 0.3;
        head.rotation.x = Math.cos(t * 1.5 + offset) * 0.15;
      }
    });
  });

  const skinMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.primaryColor),
    roughness: config.roughness,
    metalness: config.metalness,
    wireframe: config.wireframe,
  });

  const glowMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.glowColor),
    emissive: new THREE.Color(config.glowColor),
    emissiveIntensity: config.glowIntensity * 1.6,
    wireframe: config.wireframe,
  });

  const fangMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.accentColor),
    roughness: 0.1,
    metalness: 0.8,
  });

  return (
    <group ref={groupRef} scale={[config.scale, config.scale, config.scale]}>
      {/* Central Serpent Body Base */}
      <mesh material={skinMaterial} position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.8, 1.2, 1.2, 16]} />
      </mesh>

      {/* 3 Serpent Necks & Heads */}
      {[-0.8, 0, 0.8].map((xOffset, idx) => {
        const height = idx === 1 ? 1.6 : 1.3;
        const zPos = idx === 1 ? 0.3 : -0.1;

        return (
          <group
            key={idx}
            position={[xOffset, 0, zPos]}
            ref={(el) => {
              if (el) headRefs.current[idx] = el;
            }}
          >
            {/* Curved Neck Segments */}
            {[0, 1, 2].map((seg) => (
              <mesh
                key={seg}
                position={[0, seg * 0.4, seg * 0.1]}
                rotation={[seg * 0.15, 0, 0]}
                material={seg % 2 === 0 ? skinMaterial : glowMaterial}
              >
                <cylinderGeometry args={[0.3 - seg * 0.04, 0.35 - seg * 0.04, 0.45, 12]} />
              </mesh>
            ))}

            {/* Serpent Head */}
            <group position={[0, height, 0.4]} rotation={[0.2, 0, 0]}>
              <mesh material={skinMaterial}>
                <coneGeometry args={[0.38, 0.9, 10]} rotation={[-Math.PI / 2, 0, 0]} />
              </mesh>
              {/* Glowing Eyes */}
              {[-1, 1].map((side, i) => (
                <mesh key={i} position={[side * 0.2, 0.15, 0.1]} material={glowMaterial}>
                  <sphereGeometry args={[0.09, 10, 10]} />
                </mesh>
              ))}
              {/* Venom Fangs */}
              {[-1, 1].map((side, i) => (
                <mesh key={i} position={[side * 0.12, -0.15, 0.35]} material={fangMaterial}>
                  <coneGeometry args={[0.04, 0.25, 6]} rotation={[Math.PI, 0, 0]} />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}
    </group>
  );
};
