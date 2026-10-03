import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MonsterConfig } from '../../types';

interface MonsterProps {
  config: MonsterConfig;
}

export const CrystalSlime: React.FC<MonsterProps> = ({ config }) => {
  const slimeMeshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const shardsGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * config.pulseSpeed;

    // Soft squash & stretch physics simulation
    if (slimeMeshRef.current) {
      const squashY = 1 + Math.sin(t * 3.5) * 0.15;
      const stretchXZ = 1 - Math.sin(t * 3.5) * 0.1;

      if (config.animation === 'stomp') {
        const bounce = Math.abs(Math.sin(t * 5));
        slimeMeshRef.current.position.y = bounce * 0.5;
        slimeMeshRef.current.scale.set(stretchXZ * (1 + bounce * 0.2), squashY * (1 - bounce * 0.3), stretchXZ * (1 + bounce * 0.2));
      } else {
        slimeMeshRef.current.position.y = Math.sin(t * 2) * 0.1;
        slimeMeshRef.current.scale.set(stretchXZ, squashY, stretchXZ);
      }
    }

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 2;
      coreRef.current.rotation.z = t * 1.5;
    }

    if (shardsGroupRef.current) {
      shardsGroupRef.current.rotation.y = -t * 1.2;
    }
  });

  const slimeMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.primaryColor),
    transmission: 0.85,
    opacity: 0.9,
    transparent: true,
    roughness: 0.1,
    ior: 1.4,
    thickness: 1.5,
    wireframe: config.wireframe,
  });

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.glowColor),
    emissive: new THREE.Color(config.glowColor),
    emissiveIntensity: config.glowIntensity * 2.0,
    wireframe: config.wireframe,
  });

  const crystalMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.accentColor),
    roughness: 0.1,
    metalness: 0.9,
  });

  return (
    <group scale={[config.scale, config.scale, config.scale]}>
      {/* Translucent Jelly Blob Body */}
      <mesh ref={slimeMeshRef} material={slimeMaterial} position={[0, 0, 0]}>
        <sphereGeometry args={[1.4, 32, 32]} />
      </mesh>

      {/* Internal Glowing Crystal Core */}
      <mesh ref={coreRef} material={coreMaterial} position={[0, 0.2, 0]}>
        <octahedronGeometry args={[0.5, 0]} />
      </mesh>

      {/* Cute/Creepy Eyes floating inside slime */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * 0.45, 0.35, 1.1]}>
          <mesh material={coreMaterial}>
            <sphereGeometry args={[0.22, 16, 16]} />
          </mesh>
          <mesh position={[0, 0, 0.15]} material={crystalMaterial}>
            <sphereGeometry args={[0.08, 12, 12]} />
          </mesh>
        </group>
      ))}

      {/* Orbiting Crystal Shards */}
      <group ref={shardsGroupRef}>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.sin(angle) * 2.2, Math.cos(angle * 2) * 0.6, Math.cos(angle) * 2.2]}
              rotation={[angle, angle * 2, 0]}
              material={crystalMaterial}
            >
              <coneGeometry args={[0.2, 0.7, 5]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};
