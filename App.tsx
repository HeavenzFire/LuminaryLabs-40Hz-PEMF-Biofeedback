import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Visualizer from './components/Visualizer';
import ControlPanel from './components/ControlPanel';
import BiofeedbackDisplay from './components/BiofeedbackDisplay';
import { useAudioController } from './hooks/useAudioController';
import { useHapticController } from './hooks/useHapticController';
import { BiofeedbackState, HapticPattern } from './types';
import { STATE_PROPERTIES, FREQUENCIES } from './constants';

const STORAGE_KEY = 'LUMINARY_LABS_SETTINGS';
const DEFAULT_GROUNDING_STATE = true;
const DEFAULT_HAPTIC_STATE = true;
const DEFAULT_HAPTIC_INTENSITY = 1.0;
const DEFAULT_HAPTIC_PATTERN = HapticPattern.DEFAULT;
const DEFAULT_HAPTIC_WAVE_INTERVAL = 500;
const DEFAULT_HAPTIC_WAVE_DUTY_CYCLE = 0.8;
const DEFAULT_HAPTIC_HEARTBEAT_INTENSITY_MOD = 0.7;


// Haptic Pattern Constants for readability and maintenance
const HAPTIC_HEARTBEAT_THUMP1_MS = 80;
const HAPTIC_HEARTBEAT_THUMP2_MS = 60;
const HAPTIC_HEARTBEAT_DELAY_MS = 120;

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings[key] !== undefined ? settings[key] : defaultValue;
    }
  } catch (error) {
    console.error("Failed to parse settings from localStorage", error);
  }
  return defaultValue;
}

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBiofeedbackActive, setIsBiofeedbackActive] = useState<boolean>(false);
  const [manualPlayMode, setManualPlayMode] = useState<'solfeggio' | 'pemf' | 'none'>('none');
  
  const [isGroundingActive, setIsGroundingActive] = useState<boolean>(() => getInitialState('isGroundingActive', DEFAULT_GROUNDING_STATE));
  const [isHapticEnabled, setIsHapticEnabled] = useState<boolean>(() => getInitialState('isHapticEnabled', DEFAULT_HAPTIC_STATE));
  const [hapticIntensity, setHapticIntensity] = useState<number>(() => getInitialState('hapticIntensity', DEFAULT_HAPTIC_INTENSITY));
  const [hapticPattern, setHapticPattern] = useState<HapticPattern>(() => getInitialState('hapticPattern', DEFAULT_HAPTIC_PATTERN));
  
  const [hapticWaveInterval, setHapticWaveInterval] = useState<number>(() => getInitialState('hapticWaveInterval', DEFAULT_HAPTIC_WAVE_INTERVAL));
  const [hapticWaveDutyCycle, setHapticWaveDutyCycle] = useState<number>(() => getInitialState('hapticWaveDutyCycle', DEFAULT_HAPTIC_WAVE_DUTY_CYCLE));
  const [hapticHeartbeatIntensityMod, setHapticHeartbeatIntensityMod] = useState<number>(() => getInitialState('hapticHeartbeatIntensityMod', DEFAULT_HAPTIC_HEARTBEAT_INTENSITY_MOD));


  const [heartRate, setHeartRate] = useState<number>(70);
  const [affirmation, setAffirmation] = useState<string>('Welcome to LuminaryLabs. Let love and clarity heal you.');
  
  const [pemfIntensity, setPemfIntensity] = useState<number>(0.5);
  const [solfeggioIntensity, setSolfeggioIntensity] = useState<number>(0.3);

  const { playSolfeggio, playPemf, stopAudio, updateSolfeggioFrequency, updatePemfIntensity, playSchumann, stopSchumann, updateSolfeggioIntensity } = useAudioController();
  const { isHapticReady, playHapticEffect, stopHaptics } = useHapticController();
  const hapticTimerRef = useRef<number | null>(null);
  const hapticInnerTimerRef = useRef<number | null>(null);

  const biofeedbackState = useMemo(() => {
    if (heartRate > 80) return BiofeedbackState.STRESSED;
    if (heartRate > 60) return BiofeedbackState.CALM;
    return BiofeedbackState.INTUITIVE;
  }, [heartRate]);
  
  // Effect to save settings to localStorage
  useEffect(() => {
    try {
        const settings = { isGroundingActive, isHapticEnabled, hapticIntensity, hapticPattern, hapticWaveInterval, hapticWaveDutyCycle, hapticHeartbeatIntensityMod };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
  }, [isGroundingActive, isHapticEnabled, hapticIntensity, hapticPattern, hapticWaveInterval, hapticWaveDutyCycle, hapticHeartbeatIntensityMod