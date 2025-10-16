import React from 'react';
import clsx from 'clsx';

const SettingToggle = ({
  label,
  description,
  isEnabled,
  onToggle,
}: {
  label: string;
  description?: string;
  isEnabled: boolean;
  onToggle: () => void;
}) => (
  <div className="flex justify-between items-center">
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
    <button
      onClick={onToggle}
      className={clsx(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isEnabled ? 'bg-blue-600' : 'bg-gray-200'
      )}
    >
      <span
        className={clsx(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          isEnabled ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  </div>
);

export default SettingToggle;
