import React, { useState } from 'react';
import { MonsterConfig } from '../types';
import { sound } from '../utils/audio';
import { X, Copy, Check, Code, Terminal, Sparkles } from 'lucide-react';

interface CodeExporterModalProps {
  config: MonsterConfig;
  isOpen: boolean;
  onClose: () => void;
  customFileName?: string | null;
}

export const CodeExporterModal: React.FC<CodeExporterModalProps> = ({
  config,
  isOpen,
  onClose,
  customFileName,
}) => {
  const [tab, setTab] = useState<'r3f' | 'three' | 'gltf-loader'>('r3f');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateR3FCode = () => {
    if (customFileName) {
      return `import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function MonsterModel() {
  const { scene } = useGLTF('/models/${customFileName}');
  return <primitive object={scene} scale={${config.scale}} />;
}

export default function AntigravityMonsterViewer() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#07090e' }}>
      <Canvas camera={{ position: [0, 1.2, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="${config.glowColor}" />
        <Suspense fallback={null}>
          <MonsterModel />
        </Suspense>
        <OrbitControls autoRotate />
      </Canvas>
    </div>
  );
}`;
    }

    return `import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function ${config.name.replace(/\s+/g, '')}Model() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * ${config.animationSpeed * 0.5};
      meshRef.current.position.y = Math.sin(t * 2) * 0.15;
    }
  });

  return (
    <group scale={[${config.scale}, ${config.scale}, ${config.scale}]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color="${config.primaryColor}"
          emissive="${config.glowColor}"
          emissiveIntensity={${config.glowIntensity}}
          wireframe={${config.wireframe}}
          roughness={${config.roughness}}
          metalness={${config.metalness}}
        />
      </mesh>
    </group>
  );
}

export default function Antigravity3DApp() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#07090e' }}>
      <Canvas camera={{ position: [0, 1.2, 5] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="${config.glowColor}" />
        <${config.name.replace(/\s+/g, '')}Model />
        <ContactShadows opacity={0.6} scale={10} blur={2} color="${config.glowColor}" />
        <OrbitControls autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
}`;
  };

  const generateVanillaThreeCode = () => {
    return `import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Setup Scene, Camera & Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color('#07090e');

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight('${config.glowColor}', 1.8);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

// 3D Monster Mesh
const geometry = new THREE.SphereGeometry(1.2, 32, 32);
const material = new THREE.MeshStandardMaterial({
  color: '${config.primaryColor}',
  emissive: '${config.glowColor}',
  emissiveIntensity: ${config.glowIntensity},
  wireframe: ${config.wireframe},
  roughness: ${config.roughness},
  metalness: ${config.metalness}
});

const monsterMesh = new THREE.Mesh(geometry, material);
monsterMesh.scale.setScalar(${config.scale});
scene.add(monsterMesh);

// Animation Loop
function animate(time) {
  requestAnimationFrame(animate);
  monsterMesh.rotation.y = time * 0.001 * ${config.animationSpeed};
  monsterMesh.position.y = Math.sin(time * 0.002) * 0.15;
  controls.update();
  renderer.render(scene, camera);
}
animate(0);`;
  };

  const generateGltfGuide = () => {
    return `// GLTF/GLB Loading Guide for Antigravity Projects
// Step 1: Install @react-three/drei and @react-three/fiber
// npm install three @types/three @react-three/fiber @react-three/drei

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

function MonsterAsset({ glbPath }: { glbPath: string }) {
  const { scene } = useGLTF(glbPath);
  return <primitive object={scene} scale={1.2} />;
}

// Pre-load model for instantaneous rendering
useGLTF.preload('/models/monster.glb');

export default function AntigravityMonsterImport() {
  return (
    <Canvas camera={{ position: [0, 1, 4] }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} />
      <MonsterAsset glbPath="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Monster/glTF-Binary/Monster.glb" />
      <OrbitControls autoRotate />
    </Canvas>
  );
}`;
  };

  const getActiveCode = () => {
    if (tab === 'r3f') return generateR3FCode();
    if (tab === 'three') return generateVanillaThreeCode();
    return generateGltfGuide();
  };

  const copyToClipboard = () => {
    sound.playClick();
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl glass-panel rounded-2xl border border-cyan-500/30 p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading font-bold text-base text-slate-100 tracking-wider">
              IMPORT CODE FOR ANTIGRAVITY
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setTab('r3f');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading transition-all ${
                tab === 'r3f'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              React Three Fiber (R3F)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setTab('three');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading transition-all ${
                tab === 'three'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-[0_0_10px_rgba(112,0,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vanilla Three.js
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setTab('gltf-loader');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading transition-all ${
                tab === 'gltf-loader'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-400/40 shadow-[0_0_10px_rgba(255,0,127,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GLTF / GLB Importer Guide
            </button>
          </div>

          <button
            onClick={copyToClipboard}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Viewport */}
        <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[50vh] leading-relaxed">
          <pre>{getActiveCode()}</pre>
        </div>

        {/* Footer Note */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            Copy and paste this snippet directly into your Antigravity component file. It includes auto-rotation, standard PBR material parameters, and lighting!
          </span>
        </div>
      </div>
    </div>
  );
};
