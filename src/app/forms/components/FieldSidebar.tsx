// app/forms/components/FieldSidebar.tsx
import React, { FC } from 'react';
import { FIELD_DEFINITIONS } from './fieldDefinitions';
import { FieldType } from '../../../types/formTypes';

interface Props {
  onDragStart: (e: React.DragEvent, type: FieldType) => void;
}

export const FieldSidebar: FC<Props> = ({ onDragStart }) => {
  return (
    <aside className="w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">FIELDS</h3>
      <div className="grid grid-cols-2 gap-3">
        {FIELD_DEFINITIONS.map(field => (
          <div
            key={field.type}
            draggable
            onDragStart={(e) => onDragStart(e, field.type)}
            className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-purple-50 rounded-lg text-gray-600 hover:text-purple-600 transition-colors cursor-grab active:cursor-grabbing"
          >
            <div className="w-8 h-8">{field.icon}</div>
            <span className="text-xs mt-1">{field.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default FieldSidebar;
