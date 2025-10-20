export type FieldType =
  | "text"
  | "textarea"
  | "tel"
  | "number"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "date"
  | "time";

export interface FormField {
  id: number;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface Template {
  id: number;
  title: string;
  submissions_count: number;
  last_used: string;
  fields: FormField[];

  // Optional frontend-only aliases
  submissionsCount?: number;
  lastUsed?: string;
}

export interface FormBuilderProps {
  formToEdit?: Template | null;
  onBack: () => void;
  handleSaveForm: () => void;
  formTitle: string;
  setFormTitle: (title: string) => void;
  formFields: FormField[];
  setFormFields: (
    fields: FormField[] | ((prevFields: FormField[]) => FormField[])
  ) => void;
  isSaving: boolean;
  saveStatus: "idle" | "success" | "error";
}
