// app/forms/components/FormBuilder.tsx
import React, { FC, useRef, useState } from 'react';
import { FormBuilderProps, FormField } from '../../../types/formTypes';
import FormBuilderHeader from './FormBuilderHeader';
import FieldSidebar from './FieldSidebar';
import FormCanvas from './FormCanvas';
import FieldPropertiesPanel from './FieldPropertiesPanel';
import { createNewField, reorderFields } from './formUtils';

const FormBuilder: FC<FormBuilderProps> = ({
  formToEdit,
  onBack,
  handleSaveForm,
  formTitle,
  setFormTitle,
  formFields,
  setFormFields,
  isSaving,
  saveStatus
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const selectedField = formFields.find(f => f.id === selectedFieldId);

  // handlers
  const onDragStart = (e: React.DragEvent, type: FormField['type']) => {
  e.dataTransfer.setData('field-type', type);
};

  const onDropToCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData('field-type') as FormField['type'];
if (fieldType) {
  const newField = createNewField(fieldType);
  setFormFields(prev => [...prev, newField]);
  setSelectedFieldId(newField.id);
}

  };

  const onDragStartIndex = (index: number) => { dragItem.current = index; };
  const onDragEnterIndex = (index: number) => { dragOverItem.current = index; };
  const onDragEndReorder = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newFields = reorderFields(formFields, dragItem.current, dragOverItem.current);
    dragItem.current = null;
    dragOverItem.current = null;
    setFormFields(newFields);
  };

  const updateField = <K extends keyof FormField>(
      id: number,
      prop: K,
      value: FormField[K]
      ) => {
      setFormFields(prev =>
          prev.map(f => (f.id === id ? { ...f, [prop]: value } : f))
      );
      };

  const deleteField = (id: number) => {
    setFormFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  return (
    <div className="h-full flex flex-col">
      <FormBuilderHeader onBack={onBack} handleSaveForm={handleSaveForm} isSaving={isSaving} saveStatus={saveStatus} formToEdit={formToEdit} title={formTitle} />
      <div className="flex flex-1 overflow-hidden">
        <FieldSidebar onDragStart={onDragStart} />
        <FormCanvas
          formTitle={formTitle}
          setFormTitle={setFormTitle}
          formFields={formFields}
          setFormFields={setFormFields}
          selectedFieldId={selectedFieldId}
          setSelectedFieldId={setSelectedFieldId}
          onDropToCanvas={onDropToCanvas}
          onDragStartIndex={onDragStartIndex}
          onDragEnterIndex={onDragEnterIndex}
          onDragEndReorder={onDragEndReorder}
          deleteField={deleteField}
        />
        <FieldPropertiesPanel selectedField={selectedField} updateField={updateField} />
      </div>
    </div>
  );
};

export default FormBuilder;
