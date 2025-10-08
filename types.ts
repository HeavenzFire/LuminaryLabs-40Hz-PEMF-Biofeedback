
export enum BiofeedbackState {
  STRESSED = 'STRESSED',
  CALM = 'CALM',
  INTUITIVE = 'INTUITIVE',
}

export interface StateProperties {
  color: string;
  solfeggio: number;
  pemfIntensity: number;
  affirmations: string[];
}
