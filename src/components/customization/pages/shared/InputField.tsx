'use client';

import React from 'react';
import clsx from 'clsx';

type Props = {
  id?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  maxLength?: number;
  placeholder?: string;
  className?: string; // extra wrapper classes
  inputClassName?: string; // extra input classes
  textarea?: boolean;
  rows?: number;
};

const InputField: React.FC<Props> = ({
  id,
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  className,
  inputClassName,
  textarea = false,
  rows = 4,
}) => {
  const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={clsx('w-full mt-6', className)}> {/* Added mt-6 for top spacing */}
      {/* Label + Character Counter */}
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {maxLength !== undefined && (
          <span className="text-xs text-gray-400">
            {value.length} / {maxLength}
          </span>
        )}
      </div>

      {/* Input or Textarea */}
      {textarea ? (
        <textarea
          id={inputId}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={clsx(
            'w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm',
            'bg-white',
            inputClassName
          )}
        />
      ) : (
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          placeholder={placeholder}
          className={clsx( 
            'block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500',
            inputClassName
          )}
        />
      )}
    </div>
  );
};

export default InputField;
