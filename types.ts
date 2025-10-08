
export enum BiofeedbackState {
  STRESSED = 'STRESSED',
  CALM = 'CALM',
  INTUITIVE = 'INTUITIVE',
}

export enum HapticPattern {
  DEFAULT = 'DEFAULT',
  WAVE = 'WAVE',
  HEARTBEAT = 'HEARTBEAT',
}

export interface StateProperties {
  color: string;
  solfeggio: number;
  pemfIntensity: number;
  affirmations: string[];
}