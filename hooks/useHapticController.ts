import { useState, useEffect, useRef, useCallback } from 'react';

export const useHapticController = () => {
  const [hapticGamepad, setHapticGamepad] = useState<Gamepad | null>(null);
  const pulseIntervalRef = useRef<number | null>(null);

  const connectHandler = useCallback((e: GamepadEvent) => {
    // FIX: The Gamepad API type definitions can be too strict, typing actuator type as just 'vibration'.
    // Casting to string allows checking for 'dual-rumble', which is also a valid type.
    if (e.gamepad.vibrationActuator && (e.gamepad.vibrationActuator.type as string) === 'dual-rumble') {
      console.log('Haptic gamepad connected:', e.gamepad.id);
      setHapticGamepad(e.gamepad);
    }
  }, []);

  const disconnectHandler = useCallback((e: GamepadEvent) => {
    if (hapticGamepad && e.gamepad.id === hapticGamepad.id) {
      console.log('Haptic gamepad disconnected.');
      setHapticGamepad(null);
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
    }
  }, [hapticGamepad]);

  useEffect(() => {
    window.addEventListener('gamepadconnected', connectHandler);
    window.addEventListener('gamepaddisconnected', disconnectHandler);
    
    // Check for already connected gamepads
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      // FIX: The Gamepad API type definitions can be too strict, typing actuator type as just 'vibration'.
      // Casting to string allows checking for 'dual-rumble', which is also a valid type.
      if (gamepad && gamepad.vibrationActuator && (gamepad.vibrationActuator.type as string) === 'dual-rumble') {
        setHapticGamepad(gamepad);
        break;
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', connectHandler);
      window.removeEventListener('gamepaddisconnected', disconnectHandler);
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
      }
    };
  }, [connectHandler, disconnectHandler]);

  const stopHaptics = useCallback(() => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    // The Gamepad API doesn't have a reliable 'stop' or 'reset' on all browsers,
    // so clearing the interval is the primary way to stop the effect.
    if (hapticGamepad?.vibrationActuator?.reset) {
        hapticGamepad.vibrationActuator.reset();
    }
  }, [hapticGamepad]);

  const startHapticPulse = useCallback((frequency: number, leftIntensity: number, rightIntensity: number) => {
    stopHaptics();
    if (!hapticGamepad || !hapticGamepad.vibrationActuator || frequency <= 0) {
      return;
    }

    const interval = 1000 / frequency;
    // Pulse duration should be less than the interval to create a pulse effect
    const pulseDuration = Math.max(1, interval / 2); 

    pulseIntervalRef.current = window.setInterval(() => {
      if (hapticGamepad && hapticGamepad.vibrationActuator) {
        hapticGamepad.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: pulseDuration,
          weakMagnitude: rightIntensity,
          strongMagnitude: leftIntensity,
        });
      }
    }, interval);

  }, [hapticGamepad, stopHaptics]);

  const isHapticReady = hapticGamepad !== null;

  return { isHapticReady, startHapticPulse, stopHaptics };
};
