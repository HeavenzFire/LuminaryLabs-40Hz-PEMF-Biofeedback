import React, { useRef, useCallback } from 'react';

// Define a type for the audio nodes to be stored in the ref
interface AudioNodes {
  audioCtx: AudioContext | null;
  solfeggioOscillator: OscillatorNode | null;
  solfeggioGain: GainNode | null;
  pemfOscillator: OscillatorNode | null;
  pemfGain: GainNode | null;
  schumannOscillator: OscillatorNode | null;
}

export const useAudioController = () => {
  const audioNodesRef = useRef<AudioNodes>({
    audioCtx: null,
    solfeggioOscillator: null,
    solfeggioGain: null,
    pemfOscillator: null,
    pemfGain: null,
    schumannOscillator: null,
  });

  const getAudioContext = useCallback(() => {
    if (!audioNodesRef.current.audioCtx || audioNodesRef.current.audioCtx.state === 'closed') {
      audioNodesRef.current.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioNodesRef.current.audioCtx;
  }, []);

  const stopAudio = useCallback(() => {
    const { solfeggioOscillator, solfeggioGain, pemfOscillator, pemfGain, schumannOscillator } = audioNodesRef.current;
    if (solfeggioOscillator) {
      solfeggioOscillator.stop();
      solfeggioOscillator.disconnect();
    }
    if (solfeggioGain) {
      solfeggioGain.disconnect();
    }
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
    audioNodesRef.current.solfeggioOscillator = null;
    audioNodesRef.current.solfeggioGain = null;
    audioNodesRef.current.pemfOscillator = null;
    audioNodesRef.current.pemfGain = null;
    audioNodesRef.current.schumannOscillator = null;

    if (audioNodesRef.current.audioCtx && audioNodesRef.current.audioCtx.state !== 'closed') {
        // We don't close the context immediately, to allow for quick restart.
        // It can be closed on component unmount if needed.
    }
  }, []);

  const playSolfeggio = useCallback((frequency: number, intensity: number) => {
    const audioCtx = getAudioContext();
    if (audioNodesRef.current.solfeggioOscillator) {
      audioNodesRef.current.solfeggioOscillator.stop();
    }
    if (audioNodesRef.current.solfeggioGain) {
        audioNodesRef.current.solfeggioGain.disconnect();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(intensity, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    audioNodesRef.current.solfeggioOscillator = oscillator;
    audioNodesRef.current.solfeggioGain = gainNode;
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
  
  const updateSolfeggioFrequency = useCallback((frequency: number) => {
      const { audioCtx, solfeggioOscillator } = audioNodesRef.current;
      if (audioCtx && solfeggioOscillator) {
          solfeggioOscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      }
  }, []);
  
  const updateSolfeggioIntensity = useCallback((intensity: number) => {
      const { audioCtx, solfeggioGain } = audioNodesRef.current;
      if (audioCtx && solfeggioGain) {
          solfeggioGain.gain.setValueAtTime(intensity, audioCtx.currentTime);
      }
  }, []);

  const updatePemfIntensity = useCallback((intensity: number) => {
      const { audioCtx, pemfGain } = audioNodesRef.current;
      if (audioCtx && pemfGain) {
          pemfGain.gain.setValueAtTime(intensity, audioCtx.currentTime);
      }
  }, []);


  return { playSolfeggio, playPemf, stopAudio, updateSolfeggioFrequency, updatePemfIntensity, playSchumann, stopSchumann, updateSolfeggioIntensity };
};