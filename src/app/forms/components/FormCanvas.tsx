// app/forms/components/FormCanvas.tsx
import React, { FC } from 'react';
import clsx from 'clsx';
import { GripVertical, Trash2 } from 'lucide-react';
import { FormField } from '../../../types/formTypes';
import FieldPreview from './FieldPreview';

interface Props {
  formTitle: string;
  setFormTitle: (t: string) => void;
  formFields: FormField[];
  setFormFields: (f: FormField[] | ((prev: FormField[]) => FormField[])) => void;
  selectedFieldId: number | null;
  setSelectedFieldId: (id: number | null) => void;
  onDropToCanvas: (e: React.DragEvent) => void;
  onDragStartIndex: (index: number) => void;
  onDragEnterIndex: (index: number) => void;
  onDragEndReorder: () => void;
  deleteField: (id: number) => void;
}

export const FormCanvas: FC<Props> = ({
  formTitle,
  setFormTitle,
  formFields,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFormFields, 
  selectedFieldId,
  setSelectedFieldId,
  onDropToCanvas,
  onDragStartIndex,
  onDragEnterIndex,
  onDragEndReorder,
  deleteField
}) => {
  return (
    <main className="flex-1 bg-gray-50 p-8 overflow-y-auto" onDragOver={(e) => e.preventDefault()} onDrop={onDropToCanvas}>
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="text-3xl font-bold w-full p-2 -m-2 mb-4 rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-gray-500 mb-8">Drag fields from the left panel or reorder them below.</p>

        <div className="space-y-4">
          {formFields.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Drop fields here</p>
            </div>
          ) : (
            formFields.map((field, index) => (
              <div
                key={field.id}
                onClick={() => setSelectedFieldId(field.id)}
                draggable
                onDragStart={() => onDragStartIndex(index)}
                onDragEnter={() => onDragEnterIndex(index)}
                onDragEnd={onDragEndReorder}
                onDragOver={(e) => e.preventDefault()}
                className={clsx('p-4 rounded-lg cursor-pointer transition-all border-2', selectedFieldId === field.id ? 'bg-purple-50 border-purple-500' : 'bg-white hover:border-gray-300 border-transparent')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <label className="font-semibold text-gray-700 block mb-2">{field.type !== 'checkbox' && field.label} {field.required && <span className="text-red-500">*</span>}</label>
                    <FieldPreview field={field} />
                  </div>
                  <div className="flex items-center ml-4">
                    <button onClick={(e) => { e.stopPropagation(); deleteField(field.id); }} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                    <div className="cursor-grab text-gray-400 active:cursor-grabbing"><GripVertical /></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default FormCanvas;
