'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { FormField } from '@/types/formTypes';
import FormBuilder from '@/app/forms/components/FormBuilder';

export default function NewFormPage() {
  const router = useRouter();

  const [formTitle, setFormTitle] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

  // ✅ Save New Form
  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a form title before saving.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    const endpoint = `${BASE_URL}/professionals/forms/create`;

    // ⚡ Clean the payload before sending
    const payload = {
      title: formTitle,
      fields: formFields.map(({...rest }) => rest),
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
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
        throw new Error(errorData.message || 'Failed to create form');
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
        formToEdit={null}
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
