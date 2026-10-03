import React from 'react';
import { FREE_3D_MONSTER_REPOSITORIES } from '../data/assetVaultData';
import { sound } from '../utils/audio';
import { X, ExternalLink, Download, ShieldCheck, Sparkles, Database, Check } from 'lucide-react';

interface AssetVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleGlb: (url: string, name: string) => void;
}

export const AssetVaultModal: React.FC<AssetVaultModalProps> = ({
  isOpen,
  onClose,
  onLoadSampleGlb,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl glass-panel rounded-2xl border border-purple-500/30 p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-100 tracking-wider">
                3D MONSTER ASSET VAULT
              </h3>
              <p className="text-xs text-slate-400">
                Free, CC0 & CC-BY 3D Monster Models you can import into Antigravity
              </p>
            </div>
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

        {/* Repository Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[65vh] pr-2">
          {FREE_3D_MONSTER_REPOSITORIES.map((repo, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 group hover:shadow-[0_0_20px_rgba(112,0,255,0.15)]"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-heading font-bold text-sm text-cyan-300 group-hover:text-purple-300 transition-colors">
                    {repo.title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 whitespace-nowrap">
                    {repo.format}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{repo.description}</p>
              </div>

              {/* Meta & Tags */}
              <div className="flex flex-col gap-2.5 border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{repo.license}</span>
                  </span>
                  <span>By {repo.creator}</span>
                </div>

                <div className="flex items-center flex-wrap gap-1.5">
                  {repo.tags.map((t, ti) => (
                    <span
                      key={ti}
                      className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => sound.playClick()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    <span>Browse Site</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  {repo.sampleGlb && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onLoadSampleGlb(repo.sampleGlb!, repo.title);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/40 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(112,0,255,0.2)]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      <span>Test GLB Model Live</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tip Notice */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-purple-950/30 p-3 rounded-xl border border-purple-500/20">
          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>
            Tip: Download any 3D monster file in <strong>.glb</strong> or <strong>.gltf</strong> format from these repositories, then use the <strong>"Import 3D GLB"</strong> button in the top bar to test it live!
          </span>
        </div>
      </div>
    </div>
  );
};
