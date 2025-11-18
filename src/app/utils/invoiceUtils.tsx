import { InvoiceItem } from "@/types/invoice";

// Define what a proper payload looks like
export interface InvoicePayload {
  contact_id: number;
  invoice_no: string;
  issue_date: string;
  due_date: string;
  tax_percentage: number;
  discount_percentage: number;
  notes: string;
  item: { description: string; quantity: number; rate: number }[];
  appointment_id?: string;
  project_id?: string;
}

// A function that builds the payload
export function buildInvoicePayload({
  contactId,
  invoiceNumber,
  invoiceIssueDate,
  invoiceDueDate,
  invoiceTax,
  invoiceDiscount,
  invoiceNotes,
  invoiceItems,
  sourceType,
  sourceId,
}: {
  contactId: number;
  invoiceNumber: string;
  invoiceIssueDate: string;
  invoiceDueDate: string;
  invoiceTax: string;
  invoiceDiscount: string;
  invoiceNotes: string;
  invoiceItems: InvoiceItem[];
  sourceType?: "appointment" | "project";
  sourceId?: string;
}): InvoicePayload {
  const payload: InvoicePayload = {
    contact_id: contactId,
    invoice_no: invoiceNumber,
    issue_date: invoiceIssueDate,
    due_date: invoiceDueDate,
    tax_percentage: Number(invoiceTax),
    discount_percentage: Number(invoiceDiscount),
    notes: invoiceNotes,
    item: invoiceItems.map(({ description, quantity, rate }) => ({
      description,
      quantity,
      rate,
    })),
  };

  // Add optional IDs if needed
  if (sourceType === "appointment" && sourceId) payload.appointment_id = sourceId;
  if (sourceType === "project" && sourceId) payload.project_id = sourceId;

  return payload;
}
