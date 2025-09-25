export interface InvoiceItem {
  id: number | string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  discount?: number;
  tax?: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  taxPercentage: number;
  discountPercentage: number;
  taxAmount: number;
  discountAmount: number;
  status: 'Paid' | 'Pending';
  items: InvoiceItem[];
  notes: string;
}