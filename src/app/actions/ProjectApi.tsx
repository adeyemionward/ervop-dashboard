// src/hooks/ProjectApi.ts
import { useState, useEffect } from "react";
import { ApiProject, AttachedForm, AvailableForm, ProjectDisplayData } from "@/types/ProjectTypes";
import { Invoice } from "@/types/invoice";
import { Quotation } from "@/types/quotation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";

export const ProjectApi = (projectIdFromUrl?: string) => {
  const [project, setProject] = useState<ProjectDisplayData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  // Added new state variable
  const [availableForms, setAvailableForms] = useState<AvailableForm[]>([]);

  // 👉 ADD THIS LINE HERE:
  const [attachedForms, setAttachedForms] = useState<AttachedForm[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    }
  }, []);

  const fetchProject = async () => {
    if (!projectIdFromUrl || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/professionals/projects/show/${projectIdFromUrl}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch project details.");

      const result = await response.json();
       const apiData: ApiProject = result?.data;
      // const apiData = result?.project;

    if (!apiData) {
      throw new Error("Project data missing in API response.");
    }

      const formatted: ProjectDisplayData = {
        id: String(apiData.id),
        projectId: apiData.id,
        createdAt: new Date(apiData.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        date: new Date(`${apiData.date}T00:00:00`).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: new Date(`1970-01-01T${apiData.time}`).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        projectAmount: apiData.amount || 0,
        projectStatus: apiData.project_status || "Upcoming",
        notes: apiData.notes ?? "",
        serviceName: apiData.service?.name || "",
        customer: {
          customer_id: apiData.customer?.id ?? 0,
          name: `${apiData.customer?.firstname ?? ""} ${apiData.customer?.lastname ?? ""}`,
          email: apiData.customer?.email ?? "",
          phone: apiData.customer?.phone ?? "",
        },
        paymentStatus: apiData.invoices?.every((inv) => inv.status === "Paid")
          ? "Paid"
          : apiData.invoices?.some((inv) => inv.status === "Paid")
          ? "Partially Paid"
          : "Unpaid",
        paymentHistory:
          apiData.invoices?.flatMap((inv) =>
            (inv.payments ?? []).map((p) => ({
              id: p.id,
              date: new Date(p.date).toLocaleDateString("en-US"),
              amount: `₦${Number(p.amount).toLocaleString()}`,
              method: (p.payment_method || "Manual Entry")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
              status: p.status || inv.status || "Paid",
              payments: inv.payments ?? [],
              invoice_no: inv.invoice_no || `#INV-${inv.id}`,
              created_at: new Date(p.date).toISOString(),
            }))
          ) ?? [],


          expenses:
          apiData.expenses?.map((exp) => ({
            id: exp.id,
            title: exp.title ?? "",
            amount: Number(exp.amount) || 0,
            date: exp.date
              ? new Date(exp.date).toLocaleDateString("en-US")
              : "",
            category: exp.category ?? null,
            paymentMethod: exp.payment_method ?? null,
            vendorOrContractor: exp.contact_id ?? null,
          })) ?? [],
        notesHistory:
          apiData.notesHistory?.map((n) => ({
            id: n.id,
            content: n.content,
            created_at: n.created_at,
            author: n.author || "Unknown",
            date: new Date(n.created_at).toLocaleDateString("en-US"),
          })) ?? [],
        documents:
          apiData.documents?.map((doc) => ({
            id: doc.id,
            title: doc.title,
            tags: doc.tags ?? null,
            created_at: doc.created_at,
            files:
              doc.files?.map((f) => ({
                id: f.id,
                file_path: f.file_path,
                file_type: f.file_type,
                created_at: f.created_at,
              })) ?? [],
          })) ?? [],

          // ✅ NEW: Map the available forms data
          availableForms: apiData.availableForms?.map(form => ({
              id: form.id,
              title: form.title,
              user_id: form.user_id,
          })) ?? [],

          // ✅ NEW: Map Attached Forms
          attachedForms: apiData.attachedForms?.map(att => ({
              id: att.id,
              form_id: att.form_id,
              title: att.title,
              // description: att.description,
              status: att.status,
              public_url: att.public_url,
              created_at: att.created_at,
              completed_at: att.completed_at
          })) ?? [],
      };

      setInvoices(
        apiData.invoices?.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoice_no || `#INV-${inv.id}`,
          issuedDate: inv.issue_date ? new Date(inv.issue_date).toLocaleDateString("en-US") : "",
          dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-US") : "",
          taxPercentage: inv.tax_percentage ?? 0,
          discountPercentage: inv.discount_percentage ?? 0,
          taxAmount: inv.tax_amount ?? 0,
          discountAmount: inv.discount ?? 0,
          remainingBalance: inv.remaining_balance ?? 0,
          notes: inv.notes ?? "",
          status: (inv.status as "Paid" | "Pending") || "Pending",
          items:
            inv.items?.map((it) => ({
              id: it.id,
              description: it.description,
              quantity: Number(it.quantity) || 0,
              rate: Number(it.rate) || 0,
              amount: (Number(it.quantity) || 0) * (Number(it.rate) || 0),
            })) ?? [],
        })) ?? []
      );

      setQuotations(
        apiData.quotations?.map((inv) => {
          const items =
            inv.items?.map((it) => ({
              id: it.id,
              description: it.description,
              quantity: Number(it.quantity) || 0,
              rate: Number(it.rate) || 0,
              amount: (Number(it.quantity) || 0) * (Number(it.rate) || 0),
            })) ?? [];

          const subTotal = items.reduce((sum, it) => sum + it.amount, 0);
          const discountAmount = inv.discount ?? 0;
          const taxAmount = inv.tax_amount ?? 0;
          const totalAmount = subTotal - discountAmount + taxAmount;

          return {
            id: inv.id,
            quotationNumber: inv.quotation_no || `#INV-${inv.id}`,
            issueDate: inv.issue_date || "",
            dueDate: inv.due_date || "",
            taxPercentage: inv.tax_percentage ?? 0,
            discountPercentage: inv.discount_percentage ?? 0,

            taxAmount,
            discountAmount,
            subTotal,
            totalAmount,

            notes: inv.notes ?? "",
            status: (inv.status as "Paid" | "Pending") || "Pending",
            items,
          };
        }) ?? []
      );

      // Store the mapped forms data locally in the hook state
      setAvailableForms(formatted.availableForms);
      // 👉 ADD THIS LINE HERE:
      setAttachedForms(formatted.attachedForms)


      setProject(formatted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProject();
  }, [projectIdFromUrl, token]);

  return { project, invoices,  quotations, availableForms, attachedForms, isLoading, error, fetchProject };
};
