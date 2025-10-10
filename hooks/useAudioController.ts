
import React, { useRef, useCallback } from 'react';

// Define a type for the audio nodes to be stored in the ref
interface AudioNodes {
  audioCtx: AudioContext | null;
  solfeggioOscillators: OscillatorNode[];
  solfeggioGains: GainNode[];
  pemfOscillator: OscillatorNode | null;
  pemfGain: GainNode | null;
  schumannOscillator: OscillatorNode | null;
  crystalChimeOscillator: OscillatorNode | null;
  crystalChimeGain: GainNode | null;
}

export const useAudioController = () => {
  const audioNodesRef = useRef<AudioNodes>({
    audioCtx: null,
    solfeggioOscillators: [],
    solfeggioGains: [],
    pemfOscillator: null,
    pemfGain: null,
    schumannOscillator: null,
    crystalChimeOscillator: null,
    crystalChimeGain: null,
  });

  const getAudioContext = useCallback(() => {
    if (!audioNodesRef.current.audioCtx || audioNodesRef.current.audioCtx.state === 'closed') {
      audioNodesRef.current.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioNodesRef.current.audioCtx;
  }, []);

  const stopAudio = useCallback(() => {
    const { solfeggioOscillators, solfeggioGains, pemfOscillator, pemfGain, schumannOscillator, crystalChimeOscillator, crystalChimeGain } = audioNodesRef.current;
    
    solfeggioOscillators.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    solfeggioGains.forEach(gain => gain.disconnect());

    if (pemfOscillator) {
      pemfOscillator.stop();
      pemfOscillator.disconnect();
    }
    if (pemfGain) {
      pemfGain.disconnect();
    }
    if (schumannOscillator) {
      schumannOscillator.stop();
      schumannOscillator.disconnect();
    }
    if (crystalChimeOscillator) {
        crystalChimeOscillator.stop();
        crystalChimeOscillator.disconnect();
    }
    if (crystalChimeGain) {
        crystalChimeGain.disconnect();
    }
    audioNodesRef.current.solfeggioOscillators = [];
    audioNodesRef.current.solfeggioGains = [];
    audioNodesRef.current.pemfOscillator = null;
    audioNodesRef.current.pemfGain = null;
    audioNodesRef.current.schumannOscillator = null;
    audioNodesRef.current.crystalChimeOscillator = null;
    audioNodesRef.current.crystalChimeGain = null;

    if (audioNodesRef.current.audioCtx && audioNodesRef.current.audioCtx.state !== 'closed') {
        // We don't close the context immediately, to allow for quick restart.
        // It can be closed on component unmount if needed.
    }
  }, []);

  const playSolfeggios = useCallback((frequencies: number[], intensity: number) => {
    const audioCtx = getAudioContext();
    // Stop and clear existing solfeggio oscillators and gains
    audioNodesRef.current.solfeggioOscillators.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    audioNodesRef.current.solfeggioGains.forEach(gain => {
      gain.disconnect();
    });

    const newOscillators: OscillatorNode[] = [];
    const newGains: GainNode[] = [];

    frequencies.forEach(frequency => {
      if (isNaN(frequency) || frequency <= 0) return;

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(intensity, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      
      newOscillators.push(oscillator);
      newGains.push(gainNode);
    });
    
    audioNodesRef.current.solfeggioOscillators = newOscillators;
    audioNodesRef.current.solfeggioGains = newGains;
  }, [getAudioContext]);

  const playPemf = useCallback((frequency: number, intensity: number) => {
    const audioCtx = getAudioContext();
    if (audioNodesRef.current.pemfOscillator) {
      audioNodesRef.current.pemfOscillator.stop();
    }
    if (audioNodesRef.current.pemfGain) {
        audioNodesRef.current.pemfGain.disconnect();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(intensity, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    
    audioNodesRef.current.pemfOscillator = oscillator;
    audioNodesRef.current.pemfGain = gainNode;
  }, [getAudioContext]);

  const playSchumann = useCallback((frequency: number) => {
    const audioCtx = getAudioContext();
    if (audioNodesRef.current.schumannOscillator) {
        audioNodesRef.current.schumannOscillator.stop();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Subtle intensity

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    audioNodesRef.current.schumannOscillator = oscillator;
  }, [getAudioContext]);

  const stopSchumann = useCallback(() => {
    const { schumannOscillator } = audioNodesRef.current;
    if (schumannOscillator) {
        schumannOscillator.stop();
        schumannOscillator.disconnect();
        audioNodesRef.current.schumannOscillator = null;
    }
  }, []);
  
    const playCrystalChime = useCallback(() => {
        const audioCtx = getAudioContext();
        if (audioNodesRef.current.crystalChimeOscillator) return; // Don't overlap chimes

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2000, audioCtx.currentTime);

        // Gentle fade in and out
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 2); // 2s attack
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 6); // 4s decay

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        
        // Clean up after the sound finishes
        oscillator.onended = () => {
            if (audioNodesRef.current.crystalChimeOscillator === oscillator) {
                audioNodesRef.current.crystalChimeOscillator = null;
                audioNodesRef.current.crystalChimeGain = null;
            }
        };
        oscillator.stop(audioCtx.currentTime + 6.5);

        audioNodesRef.current.crystalChimeOscillator = oscillator;
        audioNodesRef.current.crystalChimeGain = gainNode;
    }, [getAudioContext]);
  
    const stopCrystalChime = useCallback(() => {
        const { crystalChimeOscillator, crystalChimeGain, audioCtx } = audioNodesRef.current;
        if (crystalChimeOscillator && crystalChimeGain && audioCtx) {
            // Fast fade out
            crystalChimeGain.gain.cancelScheduledValues(audioCtx.currentTime);
            crystalChimeGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
            crystalChimeOscillator.stop(audioCtx.currentTime + 0.2);
            audioNodesRef.current.crystalChimeOscillator = null;
            audioNodesRef.current.crystalChimeGain = null;
        }
    }, []);

  const updateSolfeggioFrequency = useCallback((frequency: number) => {
      const { audioCtx, solfeggioOscillators } = audioNodesRef.current;
      if (audioCtx && solfeggioOscillators.length > 0) {
          // In biofeedback mode, we only expect one oscillator.
          solfeggioOscillators[0].frequency.setValueAtTime(frequency, audioCtx.currentTime);
      }
  }, []);
  
  const updateSolfeggioIntensity = useCallback((intensity: number) => {
      const { audioCtx, solfeggioGains } = audioNodesRef.current;
      if (audioCtx && solfeggioGains.length > 0) {
          solfeggioGains.forEach(gain => {
            gain.gain.setValueAtTime(intensity, audioCtx.currentTime);
          });
      }
  }, []);

  const updatePemfIntensity = useCallback((intensity: number) => {
      const { audioCtx, pemfGain } = audioNodesRef.current;
      if (audioCtx && pemfGain) {
          pemfGain.gain.setValueAtTime(intensity, audioCtx.currentTime);
      }
  }, []);


  return { playSolfeggios, playPemf, stopAudio, updateSolfeggioFrequency, updatePemfIntensity, playSchumann, stopSchumann, updateSolfeggioIntensity, playCrystalChime, stopCrystalChime };
};
