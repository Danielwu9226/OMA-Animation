import React, { useState } from 'react';
import { MonsterConfig, EnvironmentPreset } from './types';
import { MONSTER_PRESETS } from './data/monstersData';
import { Header } from './components/Header';
import { Viewport3D } from './components/Viewport3D';
import { ControlsPanel } from './components/ControlsPanel';
import { CodeExporterModal } from './components/CodeExporterModal';
import { AssetVaultModal } from './components/AssetVaultModal';

export const App: React.FC = () => {
  const [config, setConfig] = useState<MonsterConfig>(MONSTER_PRESETS[0]);
  const [envPreset, setEnvPreset] = useState<EnvironmentPreset>('cyber');
  const [customGlbUrl, setCustomGlbUrl] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  
  const [isCodeExporterOpen, setIsCodeExporterOpen] = useState(false);
  const [isAssetVaultOpen, setIsAssetVaultOpen] = useState(false);

  const handleFileUpload = (url: string, filename: string) => {
    setCustomGlbUrl(url);
    setCustomFileName(filename);
  };

  const handleClearCustomFile = () => {
    setCustomGlbUrl(null);
    setCustomFileName(null);
  };

  const handleLoadSampleGlb = (url: string, name: string) => {
    setCustomGlbUrl(url);
    setCustomFileName(name);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        config={config}
        onOpenCodeExporter={() => setIsCodeExporterOpen(true)}
        onOpenAssetVault={() => setIsAssetVaultOpen(true)}
        onFileUpload={handleFileUpload}
        customFileName={customFileName}
      />

      {/* Main 3D Viewport & Controls Layout */}
      <div className="relative flex-1 w-full h-full flex flex-col lg:flex-row items-center justify-between p-4 pt-20">
        {/* Left/Center 3D Canvas */}
        <main className="w-full lg:flex-1 h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <Viewport3D
            config={config}
            customGlbUrl={customGlbUrl}
            envPreset={envPreset}
            onSelectEnvPreset={setEnvPreset}
          />
        </main>

        {/* Right Controls Sidebar Panel */}
        <div className="z-10 w-full lg:w-auto p-2 lg:p-0">
          <ControlsPanel
            config={config}
            onChangeConfig={setConfig}
            onClearCustomFile={handleClearCustomFile}
            hasCustomFile={!!customGlbUrl}
          />
        </div>
      </div>

      {/* Code Exporter Modal */}
      <CodeExporterModal
        config={config}
        isOpen={isCodeExporterOpen}
        onClose={() => setIsCodeExporterOpen(false)}
        customFileName={customFileName}
      />

      {/* Asset Vault Modal */}
      <AssetVaultModal
        isOpen={isAssetVaultOpen}
        onClose={() => setIsAssetVaultOpen(false)}
        onLoadSampleGlb={handleLoadSampleGlb}
      />
    </div>
  );
};

export default App;
