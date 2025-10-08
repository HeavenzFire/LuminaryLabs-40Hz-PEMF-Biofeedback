import { useState, useEffect, useRef, useCallback } from 'react';

export const useHapticController = () => {
  const [hapticGamepad, setHapticGamepad] = useState<Gamepad | null>(null);

  const connectHandler = useCallback((e: GamepadEvent) => {
    // The Gamepad API type definitions can be too strict, typing actuator type as just 'vibration'.
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
    }
  }, [hapticGamepad]);

  useEffect(() => {
    window.addEventListener('gamepadconnected', connectHandler);
    window.addEventListener('gamepaddisconnected', disconnectHandler);
    
    // Check for already connected gamepads
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      // The Gamepad API type definitions can be too strict, typing actuator type as just 'vibration'.
      // Casting to string allows checking for 'dual-rumble', which is also a valid type.
      if (gamepad && gamepad.vibrationActuator && (gamepad.vibrationActuator.type as string) === 'dual-rumble') {
        setHapticGamepad(gamepad);
        break;
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', connectHandler);
      window.removeEventListener('gamepaddisconnected', disconnectHandler);
    };
  }, [connectHandler, disconnectHandler]);

  const stopHaptics = useCallback(() => {
    if (hapticGamepad?.vibrationActuator) {
        // The reset() method is the preferred, standards-compliant way to stop all effects.
        if (typeof hapticGamepad.vibrationActuator.reset === 'function') {
            hapticGamepad.vibrationActuator.reset();
        } else {
            // As a fallback, play a short, zero-intensity effect to stop any ongoing vibration.
            hapticGamepad.vibrationActuator.playEffect('dual-rumble', {
                duration: 1,
                strongMagnitude: 0,
                weakMagnitude: 0,
            });
        }
    }
  }, [hapticGamepad]);

  const playHapticEffect = useCallback((strongMagnitude: number, weakMagnitude: number, duration: number) => {
    if (hapticGamepad?.vibrationActuator) {
      hapticGamepad.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: Math.max(1, duration),
        weakMagnitude: Math.max(0, Math.min(1, weakMagnitude)),
        strongMagnitude: Math.max(0, Math.min(1, strongMagnitude)),
      });
    }
  }, [hapticGamepad]);

  const isHapticReady = hapticGamepad !== null;

  return { isHapticReady, playHapticEffect, stopHaptics };
};
