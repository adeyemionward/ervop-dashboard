import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const ToggleSwitch = ({
  isVisible,
  onToggle,
}: {
  isVisible: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-800"
  >
    {isVisible ? (
      <Eye className="w-4 h-4 text-green-500" />
    ) : (
      <EyeOff className="w-4 h-4 text-red-500" />
    )}
    <span>{isVisible ? 'Visible' : 'Hidden'}</span>
  </button>
);

export default ToggleSwitch;
