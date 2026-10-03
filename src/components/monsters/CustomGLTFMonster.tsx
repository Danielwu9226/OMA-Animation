import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { MonsterConfig } from '../../types';

interface CustomGLTFProps {
  url: string;
  config: MonsterConfig;
}

export const CustomGLTFMonster: React.FC<CustomGLTFProps> = ({ url, config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, url);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (gltf.animations && gltf.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(gltf.scene);
      const action = mixerRef.current.clipAction(gltf.animations[0]);
      action.play();
    }
  }, [gltf]);

  useEffect(() => {
    // Traverse materials to apply user overrides
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.wireframe = config.wireframe;
                mat.roughness = config.roughness;
                mat.metalness = config.metalness;
              }
            });
          } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.wireframe = config.wireframe;
            mesh.material.roughness = config.roughness;
            mesh.material.metalness = config.metalness;
          }
        }
      }
    });
  }, [gltf, config.wireframe, config.roughness, config.metalness]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime() * config.pulseSpeed;

    if (mixerRef.current) {
      mixerRef.current.update(delta * config.animationSpeed);
    }

    if (groupRef.current) {
      if (config.animation === 'idle' || config.animation === 'float') {
        groupRef.current.position.y = Math.sin(t * 2) * 0.15;
      } else if (config.animation === 'spin') {
        groupRef.current.rotation.y = t * 2 * config.animationSpeed;
      }
    }
  });

  return (
    <group ref={groupRef} scale={[config.scale, config.scale, config.scale]}>
      <primitive object={gltf.scene} />
    </group>
  );
};
