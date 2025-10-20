// app/forms/components/FieldPreview.tsx
import React, { FC } from 'react';
import { FormField } from '../../../types/formTypes';

interface Props {
  field: FormField;
  disabled?: boolean;
}

export const FieldPreview: FC<Props> = ({ field, disabled = true }) => {
  switch (field.type) {
    case 'textarea':
      return <textarea placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" rows={3} readOnly disabled={disabled} />;
    case 'dropdown':
      return <select className="w-full p-2 border border-gray-300 rounded-md bg-white" disabled={disabled}>{field.options?.map((opt, i) => <option key={i}>{opt}</option>)}</select>;
    case 'checkbox':
      return <div className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-purple-600" disabled={disabled} /><span>{field.label}</span></div>;
    case 'radio':
      return <div className="space-y-2">{field.options?.map((opt, i) => (<div key={i} className="flex items-center gap-2"><input type="radio" name={String(field.id)} className="h-4 w-4 border-gray-300 text-purple-600" disabled={disabled} /><label>{opt}</label></div>))}</div>;
    default:
      // text, number, tel, date, time
      return <input type={field.type} placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" readOnly disabled={disabled} />;
  }
};

export default FieldPreview;
