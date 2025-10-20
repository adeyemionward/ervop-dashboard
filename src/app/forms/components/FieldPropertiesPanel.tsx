// app/forms/components/FieldPropertiesPanel.tsx
import React, { FC } from 'react';
import clsx from 'clsx';
import { FormField } from '../../../types/formTypes';

interface Props {
  selectedField?: FormField | null;
  updateField: <K extends keyof FormField>(id: number, prop: K, value: FormField[K]) => void;
}




export const FieldPropertiesPanel: FC<Props> = ({ selectedField, updateField }) => {
  return (
    <aside className={clsx("w-80 bg-white border-l border-gray-200 p-6 transition-all duration-300", selectedField ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Field Properties</h3>
      {selectedField && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Label</label>
            <input type="text" value={selectedField.label} onChange={(e) => updateField(selectedField.id, 'label', e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
          </div>
          {['text', 'textarea', 'number', 'tel', 'date', 'time'].includes(selectedField.type) && (
            <div>
              <label className="text-sm font-medium text-gray-600">Placeholder</label>
              <input type="text" value={selectedField.placeholder || ''} onChange={(e) => updateField(selectedField.id, 'placeholder', e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
            </div>
          )}
          {['dropdown', 'radio'].includes(selectedField.type) && (
            <div>
              <label className="text-sm font-medium text-gray-600">Options (one per line)</label>
              <textarea value={selectedField.options?.join('\n')} onChange={(e) => updateField(selectedField.id, 'options', e.target.value.split('\n'))} className="w-full mt-1 p-2 border border-gray-300 rounded-md" rows={4} />
            </div>
          )}
          <div className="flex items-center justify-between pt-4">
            <label className="text-sm font-medium text-gray-600">Required</label>
            <button onClick={() => updateField(selectedField.id, 'required', !selectedField.required)} className={clsx("relative inline-flex h-6 w-11 items-center rounded-full", selectedField.required ? 'bg-purple-600' : 'bg-gray-200')}>
              <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition", selectedField.required ? 'translate-x-6' : 'translate-x-1')} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default FieldPropertiesPanel;
