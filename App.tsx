
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
const DEFAULT_CRYSTAL_ATTUNEMENT_STATE = false;


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
  const [isCrystalAttunEMENTActive, setIsCrystalAttunementActive] = useState<boolean>(() => getInitialState('isCrystalAttunementActive', DEFAULT_CRYSTAL_ATTUNEMENT_STATE));
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
  const [customFrequencies, setCustomFrequencies] = useState<string[]>(['', '', '']);

  const { playSolfeggios, playPemf, stopAudio, updateSolfeggioFrequency, updatePemfIntensity, playSchumann, stopSchumann, updateSolfeggioIntensity, playCrystalChime, stopCrystalChime } = useAudioController();
  const { isHapticReady, playHapticEffect, stopHaptics } = useHapticController();
  const hapticTimerRef = useRef<number | null>(null);
  const hapticInnerTimerRef = useRef<number | null>(null);
  const crystalChimeTimerRef = useRef<number | null>(null);

  const biofeedbackState = useMemo(() => {
    if (heartRate > 80) return BiofeedbackState.STRESSED;
    if (heartRate > 60) return BiofeedbackState.CALM;
    return BiofeedbackState.INTUITIVE;
  }, [heartRate]);
  
  // Effect to save settings to localStorage
  useEffect(() => {
    try {
        const settings = { isGroundingActive, isHapticEnabled, hapticIntensity, hapticPattern, hapticWaveInterval, hapticWaveDutyCycle, hapticHeartbeatIntensityMod, isCrystalAttunementActive: isCrystalAttunEMENTActive };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
  }, [isGroundingActive, isHapticEnabled, hapticIntensity, hapticPattern, hapticWaveInterval, hapticWaveDutyCycle, hapticHeartbeatIntensityMod, isCrystalAttunEMENTActive]);

  // Biofeedback simulation effect
  useEffect(() => {
    if (!isBiofeedbackActive) return;

    const interval = setInterval(() => {
      setHeartRate(prevHeartRate => {
        const properties = STATE_PROPERTIES[biofeedbackState];
        // Simulate a trend towards a baseline of 70, influenced by the current state
        const trend = (70 - prevHeartRate) * 0.01;
        const noise = (Math.random() - 0.5) * 2; // -1 to 1
        let newStateInfluence = 0;

        if (biofeedbackState === BiofeedbackState.STRESSED) newStateInfluence = 0.2;
        else if (biofeedbackState === BiofeedbackState.INTUITIVE) newStateInfluence = -0.2;

        return prevHeartRate + trend + noise + newStateInfluence;
      });
      
      const properties = STATE_PROPERTIES[biofeedbackState];
      updateSolfeggioFrequency(properties.solfeggio);
      updatePemfIntensity(properties.pemfIntensity);
      
      const affirmationIndex = Math.floor(Math.random() * properties.affirmations.length);
      setAffirmation(properties.affirmations[affirmationIndex]);

    }, 2000);

    return () => clearInterval(interval);
  }, [isBiofeedbackActive, biofeedbackState, updateSolfeggioFrequency, updatePemfIntensity]);

  // Grounding effect
  useEffect(() => {
    if (isPlaying && isGroundingActive) {
      playSchumann(FREQUENCIES.SCHUMANN);
    } else {
      stopSchumann();
    }
  }, [isPlaying, isGroundingActive, playSchumann, stopSchumann]);

  // Crystal Attunement Chime effect
  useEffect(() => {
    if (isPlaying && isCrystalAttunEMENTActive) {
        if (crystalChimeTimerRef.current) clearInterval(crystalChimeTimerRef.current);
        // Play a chime roughly every 12 seconds
        crystalChimeTimerRef.current = window.setInterval(() => {
            playCrystalChime();
        }, 12000);
    } else {
        if (crystalChimeTimerRef.current) {
            clearInterval(crystalChimeTimerRef.current);
            crystalChimeTimerRef.current = null;
        }
        stopCrystalChime();
    }
    return () => {
        if (crystalChimeTimerRef.current) clearInterval(crystalChimeTimerRef.current);
    }
  }, [isPlaying, isCrystalAttunEMENTActive, playCrystalChime, stopCrystalChime]);

  // Haptic effect
  useEffect(() => {
    // Clear any existing timers when dependencies change
    if (hapticTimerRef.current) clearTimeout(hapticTimerRef.current);
    if (hapticInnerTimerRef.current) clearTimeout(hapticInnerTimerRef.current);

    if (isPlaying && isHapticEnabled) {
      if (hapticPattern === HapticPattern.DEFAULT) {
        const interval = 1000 / (heartRate / 60);
        hapticTimerRef.current = window.setInterval(() => {
          playHapticEffect(hapticIntensity, hapticIntensity, 100);
        }, interval);
      } else if (hapticPattern === HapticPattern.WAVE) {
        hapticTimerRef.current = window.setInterval(() => {
          playHapticEffect(hapticIntensity, hapticIntensity, hapticWaveInterval * hapticWaveDutyCycle);
        }, hapticWaveInterval);
      } else if (hapticPattern === HapticPattern.HEARTBEAT) {
        const beatInterval = 1000 / (heartRate / 60);
        const loop = () => {
          playHapticEffect(hapticIntensity, hapticIntensity, HAPTIC_HEARTBEAT_THUMP1_MS);
          hapticInnerTimerRef.current = window.setTimeout(() => {
            playHapticEffect(hapticIntensity * hapticHeartbeatIntensityMod, hapticIntensity * hapticHeartbeatIntensityMod, HAPTIC_HEARTBEAT_THUMP2_MS);
          }, HAPTIC_HEARTBEAT_DELAY_MS);
          hapticTimerRef.current = window.setTimeout(loop, beatInterval);
        };
        loop();
      } else if (hapticPattern === HapticPattern.CRYSTAL) {
        hapticTimerRef.current = window.setInterval(() => {
            const intensity = hapticIntensity;
            // A continuous rumble with a stronger pulse component
            playHapticEffect(intensity * 0.8, intensity * 0.3, 250);
        }, 250);
      }
    } else {
      stopHaptics();
    }
    
    // Cleanup function
    return () => {
      if (hapticTimerRef.current) clearTimeout(hapticTimerRef.current);
      if (hapticInnerTimerRef.current) clearTimeout(hapticInnerTimerRef.current);
    };
  }, [isPlaying, isHapticEnabled, hapticPattern, heartRate, hapticIntensity, playHapticEffect, stopHaptics, hapticWaveInterval, hapticWaveDutyCycle, hapticHeartbeatIntensityMod]);

  const handleStartBiofeedback = useCallback(() => {
    setIsBiofeedbackActive(true);
    setIsPlaying(true);
    setManualPlayMode('none');
    
    const initialProps = STATE_PROPERTIES[BiofeedbackState.CALM];
    playSolfeggios([initialProps.solfeggio], solfeggioIntensity);
    playPemf(FREQUENCIES.PEMF, initialProps.pemfIntensity);
    setHeartRate(70);
    setAffirmation(initialProps.affirmations[0]);
  }, [playSolfeggios, playPemf, solfeggioIntensity]);

  const handlePlaySolfeggio = useCallback((freq: number) => {
    stopAudio();
    playSolfeggios([freq], solfeggioIntensity);
    playPemf(FREQUENCIES.PEMF, pemfIntensity);
    setIsPlaying(true);
    setIsBiofeedbackActive(false);
    setManualPlayMode('solfeggio');
    setAffirmation('Manual frequency selected. Focus on the tone.');
  }, [stopAudio, playSolfeggios, playPemf, solfeggioIntensity, pemfIntensity]);
  
  const handlePlayCustomSolfeggios = useCallback(() => {
    const freqs = customFrequencies
      .map(f => parseFloat(f))
      .filter(f => !isNaN(f) && f > 0);

    if (freqs.length > 0) {
      stopAudio();
      playSolfeggios(freqs, solfeggioIntensity);
      playPemf(FREQUENCIES.PEMF, pemfIntensity);
      setIsPlaying(true);
      setIsBiofeedbackActive(false);
      setManualPlayMode('solfeggio');
      setAffirmation('Custom frequencies activated. Feel the harmony.');
    }
  }, [customFrequencies, stopAudio, playSolfeggios, playPemf, solfeggioIntensity, pemfIntensity]);

  const handleCustomFrequencyChange = useCallback((index: number, value: string) => {
    setCustomFrequencies(prev => {
        const newFreqs = [...prev];
        newFreqs[index] = value;
        return newFreqs;
    });
  }, []);

  const handlePlayPemf = useCallback(() => {
    stopAudio();
    playPemf(FREQUENCIES.PEMF, pemfIntensity);
    setIsPlaying(true);
    setIsBiofeedbackActive(false);
    setManualPlayMode('pemf');
    setAffirmation('Manual PEMF activated.');
  }, [stopAudio, playPemf, pemfIntensity]);

  const handleStop = useCallback(() => {
    stopAudio();
    setIsPlaying(false);
    setIsBiofeedbackActive(false);
    setManualPlayMode('none');
    setAffirmation('Welcome to LuminaryLabs. Let love and clarity heal you.');
  }, [stopAudio]);

  const handleToggleGrounding = useCallback(() => setIsGroundingActive(p => !p), []);
  const handleToggleCrystalAttunement = useCallback(() => setIsCrystalAttunementActive(p => !p), []);
  const handleToggleHaptics = useCallback(() => setIsHapticEnabled(p => !p), []);

  const handlePemfIntensityChange = useCallback((value: number) => {
    setPemfIntensity(value);
    if (isPlaying) {
      updatePemfIntensity(value);
    }
  }, [isPlaying, updatePemfIntensity]);

  const handleSolfeggioIntensityChange = useCallback((value: number) => {
    setSolfeggioIntensity(value);
    if (isPlaying) {
      updateSolfeggioIntensity(value);
    }
  }, [isPlaying, updateSolfeggioIntensity]);

  const handleClearSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsGroundingActive(DEFAULT_GROUNDING_STATE);
    setIsHapticEnabled(DEFAULT_HAPTIC_STATE);
    setHapticIntensity(DEFAULT_HAPTIC_INTENSITY);
    setHapticPattern(DEFAULT_HAPTIC_PATTERN);
    setHapticWaveInterval(DEFAULT_HAPTIC_WAVE_INTERVAL);
    setHapticWaveDutyCycle(DEFAULT_HAPTIC_WAVE_DUTY_CYCLE);
    setHapticHeartbeatIntensityMod(DEFAULT_HAPTIC_HEARTBEAT_INTENSITY_MOD);
    setIsCrystalAttunementActive(DEFAULT_CRYSTAL_ATTUNEMENT_STATE);
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="relative w-full max-w-lg flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 drop-shadow-lg">
          LuminaryLabs Bio-Resonance
        </h1>
        <div className="relative w-[600px] h-[600px] flex items-center justify-center">
          <Visualizer 
            state={biofeedbackState} 
            heartRate={heartRate} 
            isPlaying={isPlaying} 
            isGroundingActive={isGroundingActive}
            isCrystalAttunementActive={isCrystalAttunEMENTActive}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <BiofeedbackDisplay 
              heartRate={heartRate} 
              affirmation={affirmation} 
              isBiofeedbackActive={isBiofeedbackActive}
            />
          </div>
        </div>
        <ControlPanel
          isBiofeedbackActive={isBiofeedbackActive}
          isPlaying={isPlaying}
          isGroundingActive={isGroundingActive}
          isHapticReady={isHapticReady}
          isHapticEnabled={isHapticEnabled}
          onStartBiofeedback={handleStartBiofeedback}
          onPlaySolfeggio={handlePlaySolfeggio}
          onPlayPemf={handlePlayPemf}
          onStop={handleStop}
          onToggleGrounding={handleToggleGrounding}
          onToggleHaptics={handleToggleHaptics}
          onClearSettings={handleClearSettings}
          pemfIntensity={pemfIntensity}
          solfeggioIntensity={solfeggioIntensity}
          onPemfIntensityChange={handlePemfIntensityChange}
          onSolfeggioIntensityChange={handleSolfeggioIntensityChange}
          hapticIntensity={hapticIntensity}
          onHapticIntensityChange={setHapticIntensity}
          hapticPattern={hapticPattern}
          onHapticPatternChange={setHapticPattern}
          hapticWaveInterval={hapticWaveInterval}
          onHapticWaveIntervalChange={setHapticWaveInterval}
          hapticWaveDutyCycle={hapticWaveDutyCycle}
          onHapticWaveDutyCycleChange={setHapticWaveDutyCycle}
          hapticHeartbeatIntensityMod={hapticHeartbeatIntensityMod}
          onHapticHeartbeatIntensityModChange={setHapticHeartbeatIntensityMod}
          isCrystalAttunementActive={isCrystalAttunEMENTActive}
          onToggleCrystalAttunement={handleToggleCrystalAttunement}
          customFrequencies={customFrequencies}
          onCustomFrequencyChange={handleCustomFrequencyChange}
          onPlayCustomSolfeggios={handlePlayCustomSolfeggios}
        />
      </div>
    </div>
  );
};

export default App;
