// -------------------- TYPES --------------------
export type PaymentItem = {
  id: number;
  payment_date: string;
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

export interface AppointmentDisplayData {
  id: string;
  appointmentId: number;
  createdAt: string;
  date: string;
  time: string;
  appointmentAmount: number;
  appointmentStatus: string;
  notes: string;
  serviceName: string;
  customer: Customer;
  paymentStatus: string;
  paymentHistory: PaymentHistoryItem[];
  notesHistory: NoteItem[];
  documents: DocumentItem[];
}

// API types
export interface ApiAppointment {
  id: number;
  user_id: number; 
  date: string;
  time: string;
  appointment_status: string | null;
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
  notesHistory?: NoteItem[];
  service?: { name: string };
  customer?: { id: number; firstname: string; lastname: string; email: string; phone: string };

  documents?: DocumentItem[];
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
