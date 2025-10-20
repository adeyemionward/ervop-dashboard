// app/forms/components/formUtils.ts
import { FormField, FieldType } from '../../../types/formTypes';

export const createNewField = (type: FieldType): FormField => {
  const baseField: FormField = {
    id: Date.now(),
    type,
    label: `Untitled ${type}`,
    required: false,
  };
  if (type === 'dropdown' || type === 'radio') baseField.options = ['Option 1', 'Option 2'];
  if (type === 'checkbox') baseField.label = 'Checkbox Label';
  return baseField;
};

export const reorderFields = (fields: FormField[], fromIndex: number, toIndex: number): FormField[] => {
  const newFields = [...fields];
  const [item] = newFields.splice(fromIndex, 1);
  newFields.splice(toIndex, 0, item);
  return newFields;
};
