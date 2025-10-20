// app/forms/components/FormBuilderHeader.tsx
import React, { FC } from 'react';
import clsx from 'clsx';
import { Save, CheckCircle } from 'lucide-react';

import { Template } from '../../../types/formTypes';

interface Props {
  onBack: () => void;
  handleSaveForm: () => void;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  formToEdit?: Template | null;
  title?: string;
}



export const FormBuilderHeader: FC<Props> = ({ onBack, handleSaveForm, isSaving, saveStatus, formToEdit }) => (
  <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6 flex-shrink-0">
    <div className="flex items-center gap-4">
      <button onClick={onBack} className="text-gray-600 hover:text-gray-900">&larr; Back to Templates</button>
      <h1 className="text-xl font-bold text-gray-800">{formToEdit ? 'Edit Form' : 'Create Form'}</h1>
    </div>
    <button
      onClick={handleSaveForm}
      disabled={isSaving}
      className={clsx("flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors", {
        'bg-purple-600 hover:bg-purple-700': !isSaving && saveStatus === 'idle',
        'bg-gray-400 cursor-not-allowed': isSaving,
        'bg-green-600': saveStatus === 'success',
        'bg-red-600': saveStatus === 'error'
      })}
    >
      {isSaving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : (saveStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
      <span>{isSaving ? 'Saving...' : (saveStatus === 'success' ? 'Saved!' : (saveStatus === 'error' ? 'Error!' : 'Save Form'))}</span>
    </button>
  </header>
);

export default FormBuilderHeader;
