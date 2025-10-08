import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Visualizer from './components/Visualizer';
import ControlPanel from './components/ControlPanel';
import BiofeedbackDisplay from './components/BiofeedbackDisplay';
import { useAudioController } from './hooks/useAudioController';
import { useHapticController } from './hooks/useHapticController';
import { BiofeedbackState } from './types';
import { STATE_PROPERTIES, FREQUENCIES } from './constants';

const STORAGE_KEY = 'LUMINARY_LABS_SETTINGS';
const DEFAULT_GROUNDING_STATE = true;
const DEFAULT_HAPTIC_STATE = true;

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

  const [heartRate, setHeartRate] = useState<number>(70);
  const [affirmation, setAffirmation] = useState<string>('Welcome to LuminaryLabs. Let love and clarity heal you.');
  
  const [pemfIntensity, setPemfIntensity] = useState<number>(0.5);
  const [solfeggioIntensity, setSolfeggioIntensity] = useState<number>(0.3);

  const { playSolfeggio, playPemf, stopAudio, updateSolfeggioFrequency, updatePemfIntensity, playSchumann, stopSchumann, updateSolfeggioIntensity } = useAudioController();
  const { isHapticReady, startHapticPulse, stopHaptics } = useHapticController();

  const biofeedbackState = useMemo(() => {
    if (heartRate > 80) return BiofeedbackState.STRESSED;
    if (heartRate > 60) return BiofeedbackState.CALM;
    return BiofeedbackState.INTUITIVE;
  }, [heartRate]);
  
  // Effect to save settings to localStorage
  useEffect(() => {
    try {
        const settings = { isGroundingActive, isHapticEnabled };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
  }, [isGroundingActive, isHapticEnabled]);

  // Biofeedback simulation effect
  useEffect(() => {
    let interval: number;
    if (isBiofeedbackActive) {
      interval = window.setInterval(() => {
        setHeartRate(60 + Math.random() * 40); // Simulate 60-100 BPM
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBiofeedbackActive]);

  // Effect to update audio and affirmations based on biofeedback state
  useEffect(() => {
    if (isBiofeedbackActive) {
      const properties = STATE_PROPERTIES[biofeedbackState];
      updateSolfeggioFrequency(properties.solfeggio);
      updatePemfIntensity(properties.pemfIntensity);
      
      const newAffirmation = properties.affirmations[Math.floor(Math.random() * properties.affirmations.length)];
      setAffirmation(newAffirmation);
    }
  }, [biofeedbackState, isBiofeedbackActive, updateSolfeggioFrequency, updatePemfIntensity]);

  // Master effect for controlling haptics
  useEffect(() => {
    if (!isPlaying || !isHapticEnabled || !isHapticReady) {
        stopHaptics();
        return;
    }

    let hapticFrequency = 0;
    let leftIntensity = 0;
    let rightIntensity = 0;
    const baseRumble = isGroundingActive ? 0.08 : 0;

    if (isBiofeedbackActive) {
        const properties = STATE_PROPERTIES[biofeedbackState];
        hapticFrequency = FREQUENCIES.PEMF; // Default pulse
        
        switch (biofeedbackState) {
            case BiofeedbackState.STRESSED:
                leftIntensity = properties.pemfIntensity * 0.9 + baseRumble;
                rightIntensity = properties.pemfIntensity * 0.9 + baseRumble;
                break;
            case BiofeedbackState.CALM:
                hapticFrequency = 10; // Slower pulse for calm
                leftIntensity = properties.pemfIntensity * 0.6 + baseRumble;
                rightIntensity = properties.pemfIntensity * 0.7 + baseRumble; // Asymmetric
                break;
            case BiofeedbackState.INTUITIVE:
                hapticFrequency = FREQUENCIES.SCHUMANN; // Pulse at Schumann resonance
                leftIntensity = properties.pemfIntensity * 0.8 + baseRumble;
                rightIntensity = properties.pemfIntensity * 0.8 + baseRumble;
                break;
        }
    } else { // Manual mode
        switch (manualPlayMode) {
            case 'pemf':
                hapticFrequency = FREQUENCIES.PEMF;
                leftIntensity = pemfIntensity + baseRumble;
                rightIntensity = pemfIntensity + baseRumble;
                break;
            case 'solfeggio':
                hapticFrequency = 5; // slow, calming pulse
                leftIntensity = solfeggioIntensity + baseRumble;
                rightIntensity = solfeggioIntensity + baseRumble;
                break;
            default:
                stopHaptics();
                return;
        }
    }
    
    // Clamp intensities to be safe
    leftIntensity = Math.max(0, Math.min(1, leftIntensity));
    rightIntensity = Math.max(0, Math.min(1, rightIntensity));

    if (hapticFrequency > 0 && (leftIntensity > 0 || rightIntensity > 0)) {
        startHapticPulse(hapticFrequency, leftIntensity, rightIntensity);
    } else {
        stopHaptics();
    }

    return () => {
      stopHaptics();
    };
  }, [ isPlaying, isHapticEnabled, isHapticReady, isBiofeedbackActive, biofeedbackState, manualPlayMode, pemfIntensity, solfeggioIntensity, isGroundingActive, startHapticPulse, stopHaptics ]);


  const handleStartBiofeedback = useCallback(() => {
    const initialState = heartRate > 80 ? BiofeedbackState.STRESSED : heartRate > 60 ? BiofeedbackState.CALM : BiofeedbackState.INTUITIVE;
    const properties = STATE_PROPERTIES[initialState];
    
    playSolfeggio(properties.solfeggio, properties.pemfIntensity);
    playPemf(FREQUENCIES.PEMF, properties.pemfIntensity);
    if (isGroundingActive) {
      playSchumann(FREQUENCIES.SCHUMANN);
    }
    
    setManualPlayMode('none');
    setIsPlaying(true);
    setIsBiofeedbackActive(true);
  }, [heartRate, playSolfeggio, playPemf, isGroundingActive, playSchumann]);

  const handlePlaySolfeggio = useCallback((freq: number) => {
    stopAudio();
    playSolfeggio(freq, solfeggioIntensity);
    if (isGroundingActive) {
      playSchumann(FREQUENCIES.SCHUMANN);
    }
    setManualPlayMode('solfeggio');
    setIsPlaying(true);
    setIsBiofeedbackActive(false);
    setAffirmation('Focus on the tone. Let it resonate within you.')
  }, [playSolfeggio, stopAudio, isGroundingActive, playSchumann, solfeggioIntensity]);

  const handlePlayPemf = useCallback(() => {
    stopAudio();
    playPemf(FREQUENCIES.PEMF, pemfIntensity);
     if (isGroundingActive) {
      playSchumann(FREQUENCIES.SCHUMANN);
    }
    setManualPlayMode('pemf');
    setIsPlaying(true);
    setIsBiofeedbackActive(false);
    setAffirmation('Feel the 40Hz pulse harmonizing your mind.')
  }, [playPemf, stopAudio, isGroundingActive, playSchumann, pemfIntensity]);

  const handleStop = useCallback(() => {
    stopAudio();
    setManualPlayMode('none');
    setIsPlaying(false);
    setIsBiofeedbackActive(false);
    setHeartRate(70);
    setAffirmation('Welcome to LuminaryLabs. Let love and clarity heal you.');
  }, [stopAudio]);

  const handleToggleGrounding = useCallback(() => {
    const newGroundingState = !isGroundingActive;
    setIsGroundingActive(newGroundingState);

    if (isPlaying) {
      if (newGroundingState) {
        playSchumann(FREQUENCIES.SCHUMANN);
      } else {
        stopSchumann();
      }
    }
  }, [isGroundingActive, isPlaying, playSchumann, stopSchumann]);

  const handleToggleHaptics = useCallback(() => {
    setIsHapticEnabled(prev => !prev);
  }, []);
  
  const handleClearSettings = useCallback(() => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        // Reset state to default after clearing
        setIsGroundingActive(DEFAULT_GROUNDING_STATE);
        setIsHapticEnabled(DEFAULT_HAPTIC_STATE);
        alert("Saved settings have been cleared.");
    } catch (error) {
        console.error("Failed to clear settings from localStorage", error);
    }
  }, []);

  const handlePemfIntensityChange = useCallback((newIntensity: number) => {
    setPemfIntensity(newIntensity);
    if (isPlaying && !isBiofeedbackActive) {
      updatePemfIntensity(newIntensity);
    }
  }, [isPlaying, isBiofeedbackActive, updatePemfIntensity]);

  const handleSolfeggioIntensityChange = useCallback((newIntensity: number) => {
    setSolfeggioIntensity(newIntensity);
    if (isPlaying && !isBiofeedbackActive) {
      updateSolfeggioIntensity(newIntensity);
    }
  }, [isPlaying, isBiofeedbackActive, updateSolfeggioIntensity]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 space-y-8 font-sans">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          LuminaryLabs
        </h1>
        <p className="text-gray-400 mt-2">40Hz PEMF & Biofeedback Experience</p>
      </header>

      <main className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl">
        <div className="flex-shrink-0">
          <Visualizer state={biofeedbackState} heartRate={heartRate} isPlaying={isPlaying} isGroundingActive={isGroundingActive} />
        </div>
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <BiofeedbackDisplay
            heartRate={heartRate}
            affirmation={affirmation}
            isBiofeedbackActive={isBiofeedbackActive}
          />
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
          />
        </div>
      </main>
    </div>
  );
};

export default App;
