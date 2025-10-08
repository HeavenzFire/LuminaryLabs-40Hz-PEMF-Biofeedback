import { BiofeedbackState, StateProperties } from './types';

export const FREQUENCIES = {
  PEMF: 40,
  LOVE: 528,
  CLARITY: 432,
  INTUITION: 963,
  SCHUMANN: 7.83,
};

export const STATE_PROPERTIES: Record<BiofeedbackState, StateProperties> = {
  [BiofeedbackState.STRESSED]: {
    color: '#ff4500', // OrangeRed
    solfeggio: FREQUENCIES.CLARITY,
    pemfIntensity: 0.7,
    affirmations: ["I release tension, embracing calm.", "Love heals me, restoring balance.", "I release my worries into the Earth and find stability."],
  },
  [BiofeedbackState.CALM]: {
    color: '#1e90ff', // DodgerBlue
    solfeggio: FREQUENCIES.LOVE,
    pemfIntensity: 0.5,
    affirmations: ["I am at peace, radiating love.", "My mind is clear, my heart is open.", "I am grounded, calm, and centered."],
  },
  [BiofeedbackState.INTUITIVE]: {
    color: '#00ff7f', // SpringGreen
    solfeggio: FREQUENCIES.INTUITION,
    pemfIntensity: 0.5,
    affirmations: ["My inner vision shines brightly.", "I am connected to infinite wisdom.", "Connected to Earth and Spirit, my path is clear."],
  },
};