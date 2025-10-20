'use client';
import React, { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import ToggleSwitch from '@/components/customization/pages/shared/ToggleSwitch';

const AccordionSection = ({
  title,
  description,
  isVisible,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  isVisible: boolean;
  onToggle: () => void;
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <ToggleSwitch isVisible={isVisible} onToggle={onToggle} />
          <ChevronDown
            className={clsx(
              'w-5 h-5 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </div>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;
