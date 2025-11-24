export interface QuotationItem {
  id: number | string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  discount?: number;
  tax?: number;
}

export interface Quotation {
  id: number;
  quotationNumber: string;
  issueDate: string;
  dueDate: string;
  taxPercentage: number; 
  discountPercentage: number;
  taxAmount: number;
  discountAmount: number;
  subTotal: number;       // add this
  totalAmount: number;    // add this
  status: 'Paid' | 'Pending';
  items: QuotationItem[];
  notes: string;

}