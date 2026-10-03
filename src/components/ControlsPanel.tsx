import React from 'react';
import { MonsterConfig } from '../types';
import { MONSTER_PRESETS } from '../data/monstersData';
import { sound } from '../utils/audio';
import {
  Sliders,
  Palette,
  Eye,
  Activity,
  Play,
  RotateCcw,
  Zap,
  Box,
  Flame,
  Volume2
} from 'lucide-react';

interface ControlsPanelProps {
  config: MonsterConfig;
  onChangeConfig: (newConfig: MonsterConfig) => void;
  onClearCustomFile?: () => void;
  hasCustomFile: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  config,
  onChangeConfig,
  onClearCustomFile,
  hasCustomFile,
}) => {
  const updateField = <K extends keyof MonsterConfig>(key: K, value: MonsterConfig[K]) => {
    onChangeConfig({
      ...config,
      [key]: value,
    });
  };

  const selectMonsterPreset = (preset: MonsterConfig) => {
    sound.playMonsterRoar(preset.category);
    if (onClearCustomFile) onClearCustomFile();
    onChangeConfig(preset);
  };

  return (
    <aside className="w-full lg:w-96 h-[calc(100vh-6rem)] mt-20 lg:mt-0 glass-panel rounded-2xl border border-cyan-500/20 p-5 overflow-y-auto flex flex-col gap-6 shadow-2xl">
      {/* Panel Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="font-heading font-bold text-sm text-slate-100 tracking-wider">
            MONSTER STUDIO STUDIO
          </h2>
        </div>
        {hasCustomFile && (
          <button
            onClick={onClearCustomFile}
            className="text-[11px] font-medium text-pink-400 hover:text-pink-300 underline"
          >
            Switch to Presets
          </button>
        )}
      </div>

      {/* Monster Preset Selector Carousel */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-heading font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Box className="w-4 h-4 text-purple-400" />
          <span>Select Monster Model ({MONSTER_PRESETS.length})</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MONSTER_PRESETS.map((p) => {
            const isSelected = !hasCustomFile && config.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => selectMonsterPreset(p)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-950/80 to-purple-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-heading font-bold text-xs tracking-tight truncate">
                    {p.name}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.glowColor }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">{p.title}</p>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300 w-fit">
                  {p.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Customization */}
      <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-4">
        <label className="text-xs font-heading font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span>Materials & Colors</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Body Color</span>
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-xs text-slate-300 uppercase">{config.primaryColor}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Neon Glow Color</span>
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <input
                type="color"
                value={config.glowColor}
                onChange={(e) => updateField('glowColor', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-xs text-slate-300 uppercase">{config.glowColor}</span>
            </div>
          </div>
        </div>

        {/* Roughness & Metalness Sliders */}
        <div className="flex flex-col gap-2.5 mt-1">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Surface Roughness</span>
              <span className="font-mono text-cyan-400">{config.roughness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.roughness}
              onChange={(e) => updateField('roughness', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Metallic Shine</span>
              <span className="font-mono text-cyan-400">{config.metalness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.metalness}
              onChange={(e) => updateField('metalness', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Shaders & View Modes */}
      <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-4">
        <label className="text-xs font-heading font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-pink-400" />
          <span>Shaders & Wireframe</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              updateField('wireframe', !config.wireframe);
            }}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              config.wireframe
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>{config.wireframe ? 'Wireframe ON' : 'Solid Mesh'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              updateField('xray', !config.xray);
            }}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              config.xray
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>{config.xray ? 'X-Ray Glow' : 'Normal Glow'}</span>
          </button>
        </div>

        {/* Glow Intensity */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Emissive Glow Power</span>
            <span className="font-mono text-cyan-400">{config.glowIntensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={config.glowIntensity}
            onChange={(e) => updateField('glowIntensity', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Animation Controls */}
      <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-4">
        <label className="text-xs font-heading font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-green-400" />
          <span>Animation & Motions</span>
        </label>

        <div className="grid grid-cols-3 gap-1.5">
          {(['idle', 'roar', 'spin', 'float', 'stomp'] as const).map((anim) => (
            <button
              key={anim}
              onClick={() => {
                if (anim === 'roar') sound.playMonsterRoar(config.category);
                else sound.playClick();
                updateField('animation', anim);
              }}
              className={`py-2 text-[11px] font-heading capitalize rounded-lg border transition-all ${
                config.animation === anim
                  ? 'bg-green-500/20 text-green-300 border-green-500/50 shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {anim}
            </button>
          ))}
        </div>

        {/* Animation Speed */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Animation Speed</span>
            <span className="font-mono text-green-400">{config.animationSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={config.animationSpeed}
            onChange={(e) => updateField('animationSpeed', parseFloat(e.target.value))}
            className="w-full accent-green-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </aside>
  );
};
