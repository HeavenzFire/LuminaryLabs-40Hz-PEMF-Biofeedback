
import React from 'react';

interface BiofeedbackDisplayProps {
  heartRate: number;
  affirmation: string;
  isBiofeedbackActive: boolean;
}

const BiofeedbackDisplay: React.FC<BiofeedbackDisplayProps> = ({ heartRate, affirmation, isBiofeedbackActive }) => {
  return (
    <div className="text-center space-y-4 w-full max-w-md">
      <div className="text-lg text-gray-400">
        {isBiofeedbackActive ? `Simulated Heart Rate: ${Math.round(heartRate)} BPM` : 'Biofeedback: Inactive'}
      </div>
      <div className="text-xl italic font-serif text-gray-200 h-14 flex items-center justify-center p-2">
        {affirmation}
      </div>
    </div>
  );
};

export default BiofeedbackDisplay;
