export interface MonsterConfig {
  id: string;
  name: string;
  title: string;
  category: 'Eldritch' | 'Cybernetic' | 'Elemental' | 'Draconic' | 'Ghostly';
  difficulty: 'Easy Import' | 'Medium' | 'Advanced';
  description: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  accentColor: string;
  roughness: number;
  metalness: number;
  wireframe: boolean;
  xray: boolean;
  pulseSpeed: number;
  glowIntensity: number;
  animation: 'idle' | 'roar' | 'spin' | 'float' | 'stomp';
  animationSpeed: number;
  scale: number;
}

export type EnvironmentPreset = 'cyber' | 'magma' | 'void' | 'studio' | 'matrix';

export interface ExportCodeOptions {
  framework: 'r3f' | 'three' | 'html';
  includeControls: boolean;
  includeLighting: boolean;
  includeParticles: boolean;
}

export interface FreeAssetSource {
  title: string;
  creator: string;
  format: string;
  license: string;
  url: string;
  description: string;
  sampleGlb?: string;
  tags: string[];
}
