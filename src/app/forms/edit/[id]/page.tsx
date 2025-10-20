'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { FormField, Template } from '@/types/formTypes';
import FormBuilder from '@/app/forms/components/FormBuilder';

export default function FormBuilderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formToEdit, setFormToEdit] = useState<Template | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

  // ✅ Fetch full form details (with fields)
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${BASE_URL}/professionals/forms/show/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch form data');

        const data = await res.json();
        setFormToEdit(data);
        setFormTitle(data.title);
        setFormFields(data.fields);
      } catch (error) {
        console.error(error);
      }
    };

    if (token && id) fetchForm();
  }, [id, token, BASE_URL]);

  // ✅ Correct Save Logic (handles new vs existing fields)
  const handleSaveForm = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    const endpoint = `${BASE_URL}/professionals/forms/update/${id}`;

    // ⚡ Ensure we send correct payload
    const payload = {
      title: formTitle,
      fields: formFields.map((field) => {
        const { id, ...rest } = field;
        // If ID is a timestamp, treat as new field
        const isExistingField = String(id).length < 10;
        return isExistingField ? { id, ...rest } : rest;
      }),
    };

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to save form');
      }

      await res.json();
      setSaveStatus('success');

      setTimeout(() => {
        router.push('/forms');
      }, 1000);
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <DashboardLayout>
      <FormBuilder
        formToEdit={formToEdit}
        onBack={() => router.push('/forms')}
        handleSaveForm={handleSaveForm}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formFields={formFields}
        setFormFields={setFormFields}
        isSaving={isSaving}
        saveStatus={saveStatus}
      />
    </DashboardLayout>
  );
}
