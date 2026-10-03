import React, { Suspense } from 'react';
import { MonsterConfig } from '../types';
import { EldritchBehemoth } from './monsters/EldritchBehemoth';
import { CyberMechDemon } from './monsters/CyberMechDemon';
import { ShadowDrake } from './monsters/ShadowDrake';
import { MagmaGolem } from './monsters/MagmaGolem';
import { CrystalSlime } from './monsters/CrystalSlime';
import { HydraSerpent } from './monsters/HydraSerpent';
import { CustomGLTFMonster } from './monsters/CustomGLTFMonster';
import { Html } from '@react-three/drei';

interface MonsterViewerProps {
  config: MonsterConfig;
  customGlbUrl?: string | null;
}

export const MonsterViewer: React.FC<MonsterViewerProps> = ({ config, customGlbUrl }) => {
  if (customGlbUrl) {
    return (
      <Suspense fallback={
        <Html center>
          <div className="text-cyan-400 font-heading text-sm animate-pulse bg-slate-900/90 p-4 rounded-xl border border-cyan-500/40">
            LOADING CUSTOM 3D MODEL...
          </div>
        </Html>
      }>
        <CustomGLTFMonster url={customGlbUrl} config={config} />
      </Suspense>
    );
  }

  switch (config.id) {
    case 'eldritch':
      return <EldritchBehemoth config={config} />;
    case 'cyber-demon':
      return <CyberMechDemon config={config} />;
    case 'shadow-drake':
      return <ShadowDrake config={config} />;
    case 'magma-golem':
      return <MagmaGolem config={config} />;
    case 'crystal-slime':
      return <CrystalSlime config={config} />;
    case 'hydra-serpent':
      return <HydraSerpent config={config} />;
    default:
      return <EldritchBehemoth config={config} />;
  }
};
