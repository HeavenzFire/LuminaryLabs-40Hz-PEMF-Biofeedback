import React from 'react';
import { FREQUENCIES } from '../constants';
import { HapticPattern } from '../types';

interface ControlPanelProps {
  isBiofeedbackActive: boolean;
  isPlaying: boolean;
  isGroundingActive: boolean;
  isHapticReady: boolean;
  isHapticEnabled: boolean;
  onStartBiofeedback: () => void;
  onPlaySolfeggio: (freq: number) => void;
  onPlayPemf: () => void;
  onStop: () => void;
  onToggleGrounding: () => void;
  onToggleHaptics: () => void;
  onClearSettings: () => void;
  pemfIntensity: number;
  solfeggioIntensity: number;
  onPemfIntensityChange: (value: number) => void;
  onSolfeggioIntensityChange: (value: number) => void;
  hapticIntensity: number;
  onHapticIntensityChange: (value: number) => void;
  hapticPattern: HapticPattern;
  onHapticPatternChange: (pattern: HapticPattern) => void;
  hapticWaveInterval: number;
  onHapticWaveIntervalChange: (value: number) => void;
  hapticWaveDutyCycle: number;
  onHapticWaveDutyCycleChange: (value: number) => void;
  hapticHeartbeatIntensityMod: number;
  onHapticHeartbeatIntensityModChange: (value: number) => void;
}

const ControlButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string }> = ({ onClick, disabled = false, children, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const SliderControl: React.FC<{
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  displayFormat?: (value: number) => string;
}> = ({ label, value, onChange, min = 0, max = 1, step = 0.01, disabled = false, displayFormat }) => (
  <div className="w-full">
    <label htmlFor={label} className="flex justify-between text-sm text-gray-400">
      <span>{label}</span>
      <span>{displayFormat ? displayFormat(value) : `${Math.round(value * 100)}%`}</span>
    </label>
    <input
      id={label}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:transition-all
                 hover:[&::-webkit-slider-thumb]:bg-indigo-300
                 focus:[&::-webkit-slider-thumb]:ring-2 focus:[&::-webkit-slider-thumb]:ring-offset-2 focus:[&::-webkit-slider-thumb]:ring-offset-gray-800 focus:[&::-webkit-slider-thumb]:ring-indigo-500"
    />
  </div>
);

const ControlPanel: React.FC<ControlPanelProps> = ({ 
    isBiofeedbackActive, 
    isPlaying, 
    isGroundingActive,
    isHapticReady,
    isHapticEnabled,
    onStartBiofeedback, 
    onPlaySolfeggio, 
    onPlayPemf, 
    onStop, 
    onToggleGrounding,
    onToggleHaptics,
    onClearSettings,
    pemfIntensity,
    solfeggioIntensity,
    onPemfIntensityChange,
    onSolfeggioIntensityChange,
    hapticIntensity,
    onHapticIntensityChange,
    hapticPattern,
    onHapticPatternChange,
    hapticWaveInterval,
    onHapticWaveIntervalChange,
    hapticWaveDutyCycle,
    onHapticWaveDutyCycleChange,
    hapticHeartbeatIntensityMod,
    onHapticHeartbeatIntensityModChange,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <ControlButton onClick={onPlaySolfeggio.bind(null, FREQUENCIES.LOVE)} disabled={isBiofeedbackActive} className="bg-blue-600 hover:bg-blue-500 focus:ring-blue-400">
          528Hz (Love)
        </ControlButton>
        <ControlButton onClick={onPlaySolfeggio.bind(null, FREQUENCIES.CLARITY)} disabled={isBiofeedbackActive} className="bg-orange-600 hover:bg-orange-500 focus:ring-orange-400">
          432Hz (Clarity)
        </ControlButton>
        <ControlButton onClick={onPlaySolfeggio.bind(null, FREQUENCIES.INTUITION)} disabled={isBiofeedbackActive} className="bg-green-600 hover:bg-green-500 focus:ring-green-400">
          963Hz (Intuition)
        </ControlButton>
        <ControlButton onClick={onPlayPemf} disabled={isBiofeedbackActive} className="bg-purple-600 hover:bg-purple-500 focus:ring-purple-400 col-span-2 md:col-span-3">
          Play 40Hz PEMF
        </ControlButton>
      </div>
      <div className="w-full border-t border-gray-600 my-2"></div>
      <div className="w-full space-y-3">
          <SliderControl
            label="Solfeggio Intensity"
            value={solfeggioIntensity}
            onChange={(e) => onSolfeggioIntensityChange(parseFloat(e.target.value))}
            max={0.5} 
            disabled={isBiofeedbackActive}
          />
          <SliderControl
            label="40Hz PEMF Intensity"
            value={pemfIntensity}
            onChange={(e) => onPemfIntensityChange(parseFloat(e.target.value))}
            disabled={isBiofeedbackActive}
          />
        </div>
      <div className="w-full border-t border-gray-600 my-2"></div>
      <ControlButton 
        onClick={onToggleGrounding} 
        className={`w-full ${isGroundingActive 
            ? 'bg-amber-800 hover:bg-amber-700 focus:ring-amber-600' 
            : 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-400'
        }`}
      >
        Grounding (7.83Hz): {isGroundingActive ? 'ON' : 'OFF'}
      </ControlButton>
      
      {isHapticReady && (
        <>
        <div className="w-full border-t border-gray-600 my-2"></div>
        <div className="w-full text-center text-gray-400 text-sm font-semibold tracking-wider">HAPTIC SETTINGS</div>
        <ControlButton
          onClick={onToggleHaptics}
          className={`w-full ${
            isHapticEnabled
              ? 'bg-teal-600 hover:bg-teal-500 focus:ring-teal-400'
              : 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-400'
          }`}
        >
          Haptics: {isHapticEnabled ? 'ON' : 'OFF'}
        </ControlButton>

        {isHapticEnabled && (
            <div className="w-full space-y-4">
              <SliderControl
                label="Master Haptic Intensity"
                value={hapticIntensity}
                onChange={(e) => onHapticIntensityChange(parseFloat(e.target.value))}
                disabled={!isHapticEnabled}
              />
              
              <div>
                <label htmlFor="haptic-pattern" className="block text-sm text-gray-400 mb-1">Haptic Pattern</label>
                <select
                  id="haptic-pattern"
                  value={hapticPattern}
                  onChange={(e) => onHapticPatternChange(e.target.value as HapticPattern)}
                  disabled={!isHapticEnabled}
                  className="w-full bg-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value={HapticPattern.DEFAULT}>Default (Pulse)</option>
                  <option value={HapticPattern.WAVE}>Calm Wave</option>
                  <option value={HapticPattern.HEARTBEAT}>Heartbeat</option>
                </select>
              </div>

              {hapticPattern === HapticPattern.WAVE && (
                <>
                  <SliderControl
                    label="Wave Interval"
                    value={hapticWaveInterval}
                    onChange={(e) => onHapticWaveIntervalChange(parseInt(e.target.value, 10))}
                    min={100}
                    max={2000}
                    step={50}
                    displayFormat={(v) => `${v}ms`}
                  />
                  <SliderControl
                    label="Wave Duty Cycle"
                    value={hapticWaveDutyCycle}
                    onChange={(e) => onHapticWaveDutyCycleChange(parseFloat(e.target.value))}
                    min={0.1}
                    max={1.0}
                    step={0.05}
                  />
                </>
              )}
              {hapticPattern === HapticPattern.HEARTBEAT && (
                <SliderControl
                  label="Thump 2 Intensity"
                  value={hapticHeartbeatIntensityMod}
                  onChange={(e) => onHapticHeartbeatIntensityModChange(parseFloat(e.target.value))}
                  min={0.1}
                  max={1.0}
                  step={0.05}
                />
              )}
            </div>
          )}
        </>
      )}

      <div className="w-full border-t border-gray-600 my-2"></div>
      <div className="w-full grid grid-cols-2 gap-3">
          <ControlButton onClick={onStartBiofeedback} disabled={isPlaying} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 focus:ring-indigo-400">
            Start Biofeedback
          </ControlButton>
          <ControlButton onClick={onStop} disabled={!isPlaying} className="bg-red-700 hover:bg-red-600 focus:ring-red-500">
            Stop All
          </ControlButton>
      </div>

      <button onClick={onClearSettings} className="text-xs text-gray-500 hover:text-gray-300 transition-colors mt-2">
        Clear Saved Settings
      </button>
    </div>
  );
};

export default ControlPanel;
