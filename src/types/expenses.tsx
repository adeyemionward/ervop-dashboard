// types/expenseTypes.ts

export type TransactionType = "disbursement" | "expense";

export type ExpenseItem = {
  id: number;
  description: string;
  amount: number;
};

export type Category = {
  id?: string | number; // Made optional as backend might generate it
  title: string;
};

// This represents the structure of the data coming back from the API
export type ExpenseResponse = {
  id: number;
  title: string;
  date: string;
  category: string;
  paymentMethod: string;
  items: ExpenseItem[];
  amount: number;
  contactId?: string;
  projectId?: string;
};

// This represents the form state for Expenses
export type ExpenseFormData = {
  title: string;
  date: string;
  category: string;
  paymentMethod: string;
  items: ExpenseItem[];
};

// This represents the form state for Disbursements
export type DisbursementFormData = {
  amount: string | number; // Allow number for calculations, string for input
  date: string;
  title: string;
  categoryId: string;
  paymentMethod: string;
};

export interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newExpense: ExpenseResponse) => void;
  projectId: string;
  sourceType?: "project" | "other";
  mode?: "create" | "edit";
  existingExpense?: ExpenseResponse | null;
}