import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Stars, Float } from '@react-three/drei';
import { MonsterConfig, EnvironmentPreset } from '../types';
import { MonsterViewer } from './MonsterViewer';
import { Camera, RefreshCw, Sun, Moon, Sparkles, Layers } from 'lucide-react';
import { sound } from '../utils/audio';

interface Viewport3DProps {
  config: MonsterConfig;
  customGlbUrl?: string | null;
  envPreset: EnvironmentPreset;
  onSelectEnvPreset: (env: EnvironmentPreset) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  config,
  customGlbUrl,
  envPreset,
  onSelectEnvPreset,
}) => {
  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    sound.playClick();
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const takeSnapshot = () => {
    sound.playClick();
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `antigravity-3d-monster-${config.id}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const renderLights = () => {
    switch (envPreset) {
      case 'magma':
        return (
          <>
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={2.5} color="#ff3300" />
            <pointLight position={[-5, -2, -5]} intensity={3} color="#ff9900" />
            <directionalLight position={[0, 10, 5]} intensity={1.5} color="#ffaa00" castShadow />
          </>
        );
      case 'matrix':
        return (
          <>
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 5, 2]} intensity={3} color="#00ff88" />
            <directionalLight position={[-5, 5, -5]} intensity={2} color="#00f0ff" />
          </>
        );
      case 'studio':
        return (
          <>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <directionalLight position={[-10, 5, -10]} intensity={0.8} color="#e0f2fe" />
          </>
        );
      case 'void':
        return (
          <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 4, 4]} intensity={2.0} color="#7000ff" />
            <pointLight position={[0, -4, -4]} intensity={2.5} color="#00f0ff" />
          </>
        );
      case 'cyber':
      default:
        return (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1.8} color="#00f0ff" castShadow />
            <pointLight position={[-5, -3, -5]} intensity={2.2} color="#ff007f" />
            <pointLight position={[0, 10, -5]} intensity={1.5} color="#7000ff" />
          </>
        );
    }
  };

  return (
    <div className="relative w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 5], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        shadows
      >
        {renderLights()}

        {/* Stars Background */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />

        {/* Monster Model */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <MonsterViewer config={config} customGlbUrl={customGlbUrl} />
        </Float>

        {/* Ground Contact Shadows */}
        <ContactShadows
          position={[0, -1.8, 0]}
          opacity={0.7}
          scale={10}
          blur={2}
          far={4}
          color={config.glowColor}
        />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2 + 0.1}
        />
      </Canvas>

      {/* Floating Canvas Quick Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 p-1.5 glass-panel rounded-xl border border-cyan-500/20">
          <button
            onClick={resetCamera}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Reset Camera View"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={takeSnapshot}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Download PNG Snapshot"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Environment Presets Quick Toggle */}
        <div className="flex items-center gap-1 p-1.5 glass-panel rounded-xl border border-slate-700/50">
          {(['cyber', 'magma', 'void', 'studio', 'matrix'] as EnvironmentPreset[]).map((env) => (
            <button
              key={env}
              onClick={() => {
                sound.playClick();
                onSelectEnvPreset(env);
              }}
              className={`px-2.5 py-1 text-[11px] font-heading capitalize rounded-lg transition-all ${
                envPreset === env
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
