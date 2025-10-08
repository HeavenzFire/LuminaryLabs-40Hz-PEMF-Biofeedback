import React from 'react';
import { FREQUENCIES } from '../constants';

interface ControlPanelProps {
  isBiofeedbackActive: boolean;
  isPlaying: boolean;
  isGroundingActive: boolean;
  onStartBiofeedback: () => void;
  onPlaySolfeggio: (freq: number) => void;
  onPlayPemf: () => void;
  onStop: () => void;
  onToggleGrounding: () => void;
  onClearSettings: () => void;
  pemfIntensity: number;
  solfeggioIntensity: number;
  onPemfIntensityChange: (value: number) => void;
  onSolfeggioIntensityChange: (value: number) => void;
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
}> = ({ label, value, onChange, min = 0, max = 1, step = 0.01, disabled = false }) => (
  <div className="w-full">
    <label htmlFor={label} className="flex justify-between text-sm text-gray-400">
      <span>{label}</span>
      <span>{Math.round(value * 100)}%</span>
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
    onStartBiofeedback, 
    onPlaySolfeggio, 
    onPlayPemf, 
    onStop, 
    onToggleGrounding, 
    onClearSettings,
    pemfIntensity,
    solfeggioIntensity,
    onPemfIntensityChange,
    onSolfeggioIntensityChange,
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
      <div className="flex gap-4 w-full">
        {isBiofeedbackActive ? (
            <ControlButton onClick={onStop} className="w-full bg-red-600 hover:bg-red-500 focus:ring-red-400">Stop Session</ControlButton>
        ) : (
            <ControlButton onClick={onStartBiofeedback} className="w-full bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-400">Start Biofeedback + 40Hz</ControlButton>
        )}
        {!isBiofeedbackActive && isPlaying && (
            <ControlButton onClick={onStop} className="w-full bg-red-600 hover:bg-red-500 focus:ring-red-400">Stop Audio</ControlButton>
        )}
      </div>
      <div className="w-full border-t border-gray-700 my-2"></div>
      <ControlButton onClick={onClearSettings} className="w-full bg-gray-700 hover:bg-gray-600 focus:ring-gray-500">
        Clear Saved Settings
      </ControlButton>
    </div>
  );
};

export default ControlPanel;