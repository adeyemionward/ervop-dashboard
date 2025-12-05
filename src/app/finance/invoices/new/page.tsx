'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { useGoBack } from "@/hooks/useGoBack";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useClientData } from "@/hooks/useClientData";
import ClientSelector from "@/components/ClientSelector1";
import { RecurringInvoiceSetup } from "@/components/RecurringInvoiceSetup";
import { toast } from "react-hot-toast";
import { Eye, Info, Trash2, X } from "lucide-react"; // Added X for close button
import { useTodayDate } from "@/app/utils/useTodayDate";
import { useRouter } from "next/navigation";

type LineItem = {
  description: string;
  qty: number;
  rate: number;
};


// --- NEW COMPONENT: The Invoice Preview Modal ---
interface InvoicePreviewModalProps {
    invoiceData: {
        invoiceNo: string;
        issueDate: string;
        dueDate: string;
        notes: string;
        items: LineItem[];
        discount: number;
        tax: number;
        subtotal: number;
        total: number;
        clientName: string;
        clientPhone: string;
        clientEmail: string;
        clientAddress: string;
        clientCompany: string;
    };
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ invoiceData, onClose, onSubmit,isLoading }) => {
  // 🌟 ADD THIS HERE
    const user = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : {};

    const companyName = user?.business_name || "";
    const companyAddress = user?.address || "";
    const companyLogo = user?.business_logo || "https://via.placeholder.com/100";
    const companySignature = user?.business_signature || "https://via.placeholder.com/100";
    return (
      
        // Modal Backdrop
        <div className="fixed inset-0 z-50 bg-gray-900/50 bg-opacity-75 flex items-center justify-center p-4">
            {/* Modal Content Container */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                {/* Header and Close Button */}
                <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Invoice Preview: #{invoiceData.invoiceNo || 'DRAFT'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Invoice Body */}
                <div className="p-8 space-y-8">
                    {/* Header Info */}
                   {/* <!-- Invoice Header --> */}
                    <div className="flex justify-between items-start">

                        {/* Left: Logo */}
                        <div className="flex items-start">
                            <img
                                src={companyLogo}
                                className="w-24 h-24 object-contain"
                            />
                        </div>

                        {/* Right: Invoice title */}
                        <div className="text-right self-start">
                            <h1 className="text-4xl font-bold text-gray-800 uppercase">Invoice</h1>
                            <p className="text-sm text-gray-500">
                                {invoiceData.invoiceNo}
                            </p>
                        </div>
                    </div>

                    {/* Company Name + Address */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {companyName}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {companyAddress}
                        </p>
                    </div>

                    {/* <!-- Billed To and Dates --> */}
                    <div className="grid grid-cols-2 gap-8">

                        {/* Customer Info */}
                        <div>
                            <p className="font-semibold text-gray-500 text-sm mb-1">BILLED TO</p>

                            <p className="font-bold text-gray-800">
                                {invoiceData.clientCompany || invoiceData.clientName}
                            </p>

                            <p className="text-gray-600">
                                {invoiceData.clientEmail || ""}
                            </p>

                            <p className="text-gray-600">
                                {invoiceData.clientPhone || ""}
                            </p>
                        </div>

                        {/* Invoice Dates */}
                        <div className="text-right">

                            <div className="flex justify-end">
                                <p className="font-semibold text-gray-500 text-sm w-32">Issue Date:</p>
                                <p className="text-gray-800 w-32">
                                    {invoiceData.issueDate || "2025-01-01"}
                                </p>
                            </div>

                            <div className="flex justify-end mt-1">
                                <p className="font-semibold text-gray-500 text-sm w-32">Due Date:</p>
                                <p className="text-gray-800 w-32">
                                    {invoiceData.dueDate || "2025-01-10"}
                                </p>
                            </div>

                        </div>
                    </div>


                    {/* Line Items Table */}
                    <table className="w-full mt-8 border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left text-xs font-medium uppercase text-gray-600">
                                <th className="p-3 w-1/2">Description</th>
                                <th className="p-3 text-center">Qty</th>
                                <th className="p-3 text-right">Rate (₦)</th>
                                <th className="p-3 text-right">Amount (₦)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items.map((item, index) => (
                                <tr key={index} className="border-b text-sm text-gray-800">
                                    <td className="p-3">{item.description}</td>
                                    <td className="p-3 text-center">{item.qty}</td>
                                    <td className="p-3 text-right">{item.rate.toFixed(2)}</td>
                                    <td className="p-3 text-right font-medium">{(item.qty * item.rate).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals and Notes */}
                    <div className="flex justify-between gap-8 mt-8">
                        {/* Notes */}
                        <div className="w-1/2">
                            <p className="font-semibold text-gray-700 mb-2">Notes:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md min-h-[60px]">
                                {invoiceData.notes || 'No additional notes provided.'}
                            </p>
                        </div>
                        
                        {/* Summary */}
                        <div className="w-1/2 max-w-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal:</span>
                                    <span>₦{invoiceData.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Discount ({invoiceData.discount}%):</span>
                                    <span className="text-red-600">- ₦{(invoiceData.subtotal * (invoiceData.discount / 100)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Tax ({invoiceData.tax}%):</span>
                                    <span className="text-green-600">+ ₦{(invoiceData.total - invoiceData.subtotal + (invoiceData.subtotal * (invoiceData.discount / 100))).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                                    <span>GRAND TOTAL:</span>
                                    <span>₦{invoiceData.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Signature Section */}
                <div className="mt-4  border-t flex flex-col items-center text-center">

                    {/* Signature Image */}
                    {companySignature ? (
                        <img
                            src={companySignature}
                            alt="Company Signature"
                            className="h-20 object-contain mx-auto"
                        />
                    ) : (
                        <p className="text-sm text-gray-500 italic">
                            No signature uploaded
                        </p>
                    )}

                    {/* Company Name */}
                    
                    <p className="font-semibold text-gray-700 mb-3">Authorized Signature</p>
                </div>


                
                {/* Footer Actions in Modal */}
               
                  <div className="p-6 border-t flex justify-end gap-4 bg-gray-50 sticky bottom-0">
                    <button onClick={onClose} disabled={isLoading} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 cursor-pointer">
                        Close Preview
                    </button>
                    {/* Add a button to continue to 'Send' or 'Finalize' from the preview */}
                    <button 
                          type="button" 
                          onClick={(e) => {
                              // Call the passed submit function
                              onSubmit(e as unknown as React.FormEvent); 
                              // onClose() is now called on success in the parent
                          }} 
                          disabled={isLoading} 
                          className="
                              bg-purple-600 
                              text-white 
                              px-6 py-2 
                              rounded-lg 
                              hover:bg-purple-700 
                              disabled:opacity-75 
                              disabled:cursor-not-allowed
                              disabled:bg-gray-400 
                              cursor-pointer
                          "
                      >
                          {isLoading ? "Processing..." : "Proceed to Send"}
                    </button>
                </div>
            </div>
        </div>
    );
};
// -----------------------------------------------------------------

export default function CreateInvoice() {
  const router = useRouter();
  const handleGoBack = useGoBack();

  const [items, setItems] = useState<LineItem[]>([
    { description: "", qty: 1, rate: 0 },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");

  const [loading, setLoading] = useState(false);
const [modalLoading, setModalLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // <--- NEW STATE FOR MODAL

  //vaidation
  const [invoiceNo, setInvoiceNo] = useState("");
  const [issueDate, setIssueDate] = useState(useTodayDate());
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const { contacts} = useClientData(selectedClient);
  
  // Find the selected client's name for the preview, if possible
  const selectedClientContact = contacts?.find(
    c => c.id.toString() === selectedClient // assuming c.id is number
)
  const clientName = selectedClientContact ? `${selectedClientContact.firstname} ${selectedClientContact.lastname}` : '';
  const clientPhone = selectedClientContact ? `${selectedClientContact.phone}` : '';
  const clientEmail = selectedClientContact ? `${selectedClientContact.email}` : '';
  const clientAddress = selectedClientContact ? `${selectedClientContact.address}` : '';
  const clientCompany = selectedClientContact ? `${selectedClientContact.company}` : '';


  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountedTotal = subtotal - subtotal * (discount / 100);
  const total = discountedTotal + discountedTotal * (tax / 100);


  const [isRecurring, setIsRecurring] = useState(false);
  const [startDate, setStartDate] = useState("2024-01-01"); 
  const [endDate, setEndDate] = useState("2024-12-31");

   // Default to the first combined option
  const [repeats, setRepeats] = useState("Weekly (Every Monday)");

  const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';
  

  const addItem = () => {
    setItems([...items, { description: "", qty: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...items];
    if (field === "qty" || field === "rate") {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  };

  //form validation
  const isFormValid = () => {
  if (!selectedClient || !invoiceNo.trim() || !issueDate || !dueDate) return false;
  if (!selectedAppointment && !selectedProject) return false;
  if (items.length === 0) return false;
  for (const item of items) {
    if (!item.description.trim() || item.qty <= 0 || item.rate <= 0) return false;
  }
  return true;
};

// --- NEW HANDLER FOR PREVIEW BUTTON ---
const handlePreview = () => {
    if (!isFormValid()) {
        toast.error("Please complete all required fields and line items before previewing.");
        return;
    }
    setShowPreview(true);
};
// ------------------------------------

  // API Integration
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Check for invalid items
  const invalidIndices = items
    .map((item, idx) =>
      !item.description.trim() || item.qty <= 0 || item.rate <= 0 ? idx : -1
    )
    .filter((idx) => idx !== -1);

  if (invalidIndices.length > 0) {
    // setInvalidItems(invalidIndices);
    toast.error("Please fill out all item fields correctly.");
    return;
  }

  // Check overall form validity
  if (!isFormValid()) {
    toast.error("Please fill out all required fields.");
    return;
  }

  // Set modal loading state
  setModalLoading(true);

  setLoading(true);

  try {
    const payload = {
      contact_id: selectedClient,
      project_id: selectedProject || null,
      appointment_id: selectedAppointment || null,
      invoice_no: invoiceNo,
      issue_date: issueDate,
      due_date: dueDate,
      tax_percentage: tax,
      discount_percentage: discount,
      notes: notes,
      item: items.map((item) => ({
        description: item.description,
        quantity: item.qty,
        rate: item.rate,
      })),
      // --- RECURRING INVOICE DATA ---
      is_recurring: isRecurring, // MANDATORY: True/False based on toggle
      
      // Conditionally add recurrence details only if it is recurring
      ...(isRecurring && {
        repeats: repeats, // e.g., "Weekly (Every Monday)"
        occuring_start_date: startDate,
        occuring_end_date: endDate || null, // Use null if user leaves it blank
      }),
    };
    
    const res = await fetch(
      `${BASE_URL}/professionals/invoices/create/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    
    const result = await res.json();
    if (!res.ok || result.status === false) {
        throw new Error(result.message || "Failed to create invoice");
      }

      toast.success(result.message || "Invoice created successfully!");
      // 💡 SUCCESS: Close the modal only on success
        setShowPreview(false);
        // 🚀 ROUTE TO INVOICE PAGE
        router.push('/finance/invoices');

    console.log(result);
  } catch (error) {
    console.error("Error creating invoice:", error);
    // toast.error(error.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};



  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
          <HeaderTitleCard
              onGoBack={handleGoBack}
              title="Generate Invoice"
              description="Create and send a professional invoice to your customers."
              >
              <div className="flex flex-col md:flex-row gap-2">
                  <button
                     type="button"
                        onClick={handlePreview}
                        className="btn-primary flex items-center justify-center cursor-pointer"
                        >
                          <Eye/>
                        <span>Preview Invoice</span>
                    </button>
              </div>
          </HeaderTitleCard>
       

        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-5xl mx-auto">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* ... (rest of your form inputs) ... */}

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Invoice Number */}
                <div>
                
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <div className="flex items-center">
                      Invoice Number (optional)
                      {/* Tooltip icon */}
                      <span className="ml-2 relative group">
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                        {/* Tooltip content */}
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-md bg-gray-900 text-white text-xs text-center px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          If left empty, the invoice number will be generated automatically
                        </span>
                      </span>
                    </div>
                  </label>

                  <input
                      type="text"
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      placeholder="Invoice Number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                </div>
                {/* Issue Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                </div>
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                </div>
              </div>

              <ClientSelector
                selectedClient={selectedClient}
                setSelectedClient={setSelectedClient}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedAppointment={selectedAppointment}
                setSelectedAppointment={setSelectedAppointment}
                
                contacts={contacts || []} // initial contacts loaded

                showInvoices={false}
              />

              {/* --- RECURRING INVOICE SETUP (NEW SECTION) --- */}
              <RecurringInvoiceSetup
                isRecurring={isRecurring}
                setIsRecurring={setIsRecurring}
                repeats={repeats}
                setRepeats={setRepeats}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />

              {/* --- END RECURRING INVOICE SETUP --- */}

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-left text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="pb-2 font-medium w-1/2">Description</th>
                        <th className="pb-2 font-medium text-center">Qty</th>
                        <th className="pb-2 font-medium text-right">Rate</th>
                        <th className="pb-2 font-medium text-right">Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2">
                            <input type="text" value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} placeholder="Item or service description" className="w-full border border-gray-300 rounded-md p-2" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(index, "qty", e.target.value)} className="w-20 text-center border border-gray-300 rounded-md p-2" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="number" step="0.01" value={item.rate} onChange={(e) => updateItem(index, "rate", e.target.value)} placeholder="0.00" className="w-32 text-right border border-gray-300 rounded-md p-2" />
                          </td>
                          <td className="py-2 px-2 text-right font-medium text-gray-800">
                            ₦{(item.qty * item.rate).toFixed(2)}
                          </td>
                          <td className="py-2 pl-2 text-right">
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-700 p-2"
                              >
                                <Trash2 className="w-4 h-4"/>
                            </button>
                          
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={addItem} className="mt-4 text-sm font-medium text-purple-600 hover:text-purple-800">+ Add Line Item</button>
              </div>

              {/* Notes Section */}
              <div className="border-t pt-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Add any special instructions or remarks here..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Summary */}
              <div className="border-t border-gray-100 pt-6 space-y-6">
                <div className="flex justify-end">
                  <div className="w-full max-w-sm space-y-3">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Subtotal</p>
                      <p className="font-medium text-gray-900">₦{subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <label htmlFor="discount" className="text-gray-600">Discount (%)</label>
                      <input type="number" id="discount" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-24 text-right border border-gray-300 rounded-md p-1" />
                    </div>
                    <div className="flex justify-between items-center">
                      <label htmlFor="tax" className="text-gray-600">Tax (%)</label>
                      <input type="number" id="tax" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="w-24 text-right border border-gray-300 rounded-md p-1" />
                    </div>
                    <div className="border-t my-2 pt-2"></div>
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <p>Total</p>
                      <p>₦{total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t pt-6">
                  <button type="button"  onClick={handlePreview} className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2 cursor-pointer">Preview InvoIce</button>
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-purple-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? "Sending..." : "Send Invoice"}
                  </button>

              </div>
          </form>
        </div>
      </div>
        
        {/* --- MODAL RENDERING --- */}
        {showPreview && (
            <InvoicePreviewModal
                invoiceData={{
                    invoiceNo,
                    issueDate,
                    dueDate,
                    notes,
                    items,
                    discount,
                    tax,
                    subtotal,
                    total,
                    clientName,
                    clientPhone,
                    clientEmail,
                    clientCompany,
                    clientAddress,
                }}
                onClose={() => setShowPreview(false)}
                onSubmit={handleSubmit}
                isLoading={modalLoading}
            />
        )}
    </DashboardLayout>
  );
}