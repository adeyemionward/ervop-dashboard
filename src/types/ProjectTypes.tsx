// -------------------- TYPES --------------------
import { ExpenseResponse } from "@/types/expenses";
export type PaymentItem = {
  id: number;
  date: string;
  amount: number;
  payment_method: string;
  status?: string;
};

export type PaymentHistoryItem = { 
  id: number; 
  date: string; 
  amount: string; 
  method: string; 
  status: string;
  payments: PaymentItem[];  // ✅ now an array
  invoice_no: string;
  created_at: string;
};

export interface AvailableForm {
    id: number;
    user_id: number;
    title: string;
    // description: string | null; // It can be null in the API response
    // status: string;           // E.g., 'Draft', 'Active'
    // created_at: string;
  }

  export interface AttachedForm {
    id: number; // The ID of the attachment record
    form_id: number;
    title: string;
    // description: string | null;
    status: 'pending' | 'submitted';
    public_url: string;
    created_at: string;
    completed_at?: string;
}

export type NoteItem = { 
  id: number; 
  content: string; 
  author: string; 
  date: string; 
  created_at: string;
};

export type DocumentFileItem = {
  id: number;
  file_path: string;
  file_type: string;
  created_at: string;
};

export type DocumentItem = {
  id: number;
  title: string;
  tags?: string | null;
  created_at: string;
  files: DocumentFileItem[];
};

export interface Customer {
  customer_id: number;
  name: string;
  email: string;
  phone: string;
}

// ========== EXPENSES ==========
export interface ApiExpense {
  id: number;
  user_id: number;
  contact_id: number | null;    // vendor or contractor
  project_id: number;
  amount: string;
  date: string;
  title: string | null;
  category: string | null;
  payment_method: string | null;
  type: string | null;
  sub_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseDisplayItem {
  id: number;
  title: string | null;
  amount: number;
  date: string;
  category: string | null;
  paymentMethod: string | null;
  vendorOrContractor: number | null; // contact_id
}

export interface ProjectDisplayData {
  id: string;
  projectId: number;
  createdAt: string;
  date: string;
  time: string;
  projectAmount: number;
  projectStatus: string;
  notes: string;
  serviceName: string;
  customer: Customer;
  paymentStatus: string;
  paymentHistory: PaymentHistoryItem[];
  notesHistory: NoteItem[];
  documents: DocumentItem[];

  expenses: (ExpenseResponse | ExpenseDisplayItem)[];
  availableForms: AvailableForm[];
  attachedForms: AttachedForm[];
}

// API types
export interface ApiProject {
  id: number;
  user_id: number; 
  date: string;
  time: string;
  project_status: string | null;
  amount: number;
  notes: string;
  service_id: number;
  service_name: string;
  customer_id: number;
  customer_firstname: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  invoices?: ApiInvoice[];
  quotations?: ApiQuotation[];
  notesHistory?: NoteItem[];
  service?: { name: string };
  customer?: { id: number; firstname: string; lastname: string; email: string; phone: string };

  documents?: DocumentItem[];
  expenses?: ApiExpense[];
  availableForms?: AvailableForm[];
  attachedForms: AttachedForm[];
}

// API types
export interface ApiQuotation {
  id: number;
  quotation_no?: string;
  status?: string;
  issue_date?: string;
  due_date?: string;
  tax_percentage?: number;
  discount_percentage?: number;
  tax_amount?: number;
  discount?: number;
  notes?: string;
  items?: {
    id: number;
    description: string;
    quantity: number;
    rate: number;
  }[];

}

export interface ApiInvoice {
  id: number;
  invoice_no?: string;
  status?: string;
  issue_date?: string;
  due_date?: string;
  tax_percentage?: number;
  discount_percentage?: number;
  tax_amount?: number;
  discount?: number;
  remaining_balance?: number;
  notes?: string;
  payments?: PaymentItem[];
  items?: {
    id: number;
    description: string;
    quantity: number;
    rate: number;
  }[];
}
