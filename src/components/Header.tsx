import React, { useRef } from 'react';
import { MonsterConfig } from '../types';
import { sound } from '../utils/audio';
import { Sparkles, Code2, Database, Upload, Volume2, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  config: MonsterConfig;
  onOpenCodeExporter: () => void;
  onOpenAssetVault: () => void;
  onFileUpload: (url: string, filename: string) => void;
  customFileName?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenCodeExporter,
  onOpenAssetVault,
  onFileUpload,
  customFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playClick();
      const blobUrl = URL.createObjectURL(file);
      onFileUpload(blobUrl, file.name);
    }
  };

  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-4 p-4 glass-panel rounded-2xl border border-cyan-500/20 shadow-2xl">
      {/* App Branding */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <span className="text-2xl">👾</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-lg md:text-xl tracking-wider gradient-text-cyan">
              ANTIGRAVITY 3D
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-heading uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
              Monster Studio
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Active Model:</span>
            <strong className="text-cyan-300 font-medium">
              {customFileName ? `Custom (${customFileName})` : config.name}
            </strong>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Hidden File Input for GLTF/GLB upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".glb,.gltf"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => {
            sound.playClick();
            fileInputRef.current?.click();
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-2 hover:shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          title="Import any local .glb or .gltf 3D model file"
        >
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>Import 3D GLB</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenAssetVault();
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-purple-900/40 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-2 hover:shadow-[0_0_12px_rgba(112,0,255,0.2)]"
        >
          <Database className="w-4 h-4 text-purple-400" />
          <span>Asset Vault</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenCodeExporter();
          }}
          className="btn-neon"
        >
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span>Get Code</span>
        </button>
      </div>
    </header>
  );
};
