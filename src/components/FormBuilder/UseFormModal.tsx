'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ClientSelector from '@/components/ClientSelector1';
import { Template } from '@/types/formTypes';

type Contact = {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
};

interface UseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  contacts: Contact[];
  selectedClient: string;
  setSelectedClient: (value: string) => void;
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  selectedAppointment: string;
  setSelectedAppointment: (value: string) => void;
}

const UseFormModal: React.FC<UseFormModalProps> = ({
  isOpen,
  onClose,
  template,
  contacts,
  selectedClient,
  setSelectedClient,
  selectedProject,
  setSelectedProject,
  selectedAppointment,
  setSelectedAppointment,
}) => {
  const router = useRouter();

  const [modalClient, setModalClient] = useState<string>(selectedClient || '');
  const [modalProject, setModalProject] = useState<string>(selectedProject || '');
  const [modalAppointment, setModalAppointment] = useState<string>(selectedAppointment || '');

  useEffect(() => {
    if (isOpen) {
      setModalClient(selectedClient || '');
      setModalProject(selectedProject || '');
      setModalAppointment(selectedAppointment || '');
    }
  }, [isOpen, selectedClient, selectedProject, selectedAppointment]);

  // Debugging: remove or keep for dev
  useEffect(() => {
    console.log('[UseFormModal] modalClient:', modalClient);
    console.log('[UseFormModal] modalProject:', modalProject);
    console.log('[UseFormModal] modalAppointment:', modalAppointment);
  }, [modalClient, modalProject, modalAppointment]);



  const handleProceed = () => {
    setSelectedClient(modalClient);
    setSelectedProject(modalProject);
    setSelectedAppointment(modalAppointment);

    const token = localStorage.getItem('token');
    router.push(
      `/forms/fill-form?clientId=${modalClient}&projectId=${modalProject}&templateId=${template?.id}&token=${token}`
    );
  };

  const closeModal = () => {
    onClose();
  };

  if (!template) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/40 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {`Use "${template.title}"`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a client and project to proceed.
            </p>
          </div>
          <button onClick={closeModal} className="p-2 -m-2 rounded-full hover:bg-gray-100">
            <X />
          </button>
        </div>

        <div className="p-4">
          <ClientSelector
            selectedClient={modalClient}
            setSelectedClient={setModalClient}
            selectedProject={modalProject}
            setSelectedProject={setModalProject}
            selectedAppointment={modalAppointment}
            setSelectedAppointment={setModalAppointment}
            contacts={contacts}
            showInvoices={false}
          />
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl grid grid-cols-2 gap-4">
          <button
            onClick={handleProceed}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg cursor-pointer font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !modalClient &&
              !modalProject &&
              !modalAppointment
            }
          >
            Fill on Behalf of Client
          </button>

          <button
            className="w-full p-3 bg-purple-600 text-white rounded-lg cursor-pointer font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !modalClient &&
              !modalProject &&
              !modalAppointment
            }
          >
            Send to Client
          </button>
        </div>
      </div>
    </div>
  );
};

export default UseFormModal;
