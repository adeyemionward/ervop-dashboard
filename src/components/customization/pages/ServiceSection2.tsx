'use client';

import React from 'react';
import { AccordionSection, InputField, ToggleSwitch } from '@/components/customization/pages/shared';
import { PlusCircle, Trash2 } from 'lucide-react';
import { WebsiteData, ServiceItem, ProcessStep } from '@/types/WebsiteTypes';

type Props = {
  data: WebsiteData['services'];
  onUpdate: (section: keyof WebsiteData, path: string[], value: any) => void;
};

const ServicesSection: React.FC<Props> = ({ data, onUpdate }) => {
  const items = data.items ?? [];
  const processes = data.processes ?? { visible: true, title: '', steps: [] };

  // Toggle Sections
  const toggleServices = () => onUpdate('services', ['visible'], !(data.visible ?? true));
  const toggleProcesses = () => onUpdate('services', ['processes', 'visible'], !processes.visible);

  // Add / Update / Delete Services 
  const addService = () => {
    const newService: ServiceItem = { serviceName: '', serviceDescription: '', visible: true };
    onUpdate('services', ['items'], [...items, newService]);
  };
  const deleteService = (i: number) => onUpdate('services', ['items'], items.filter((_, idx) => idx !== i));
const updateService = (i: number, field: keyof ServiceItem, value: string) => {
  // explicitly type as ServiceItem[]
  const updated: ServiceItem[] = [...(items ?? [])];

  if (updated[i]) {
    // updated[i][field] = value;
    onUpdate('services', ['items'], updated);
  }
};

    

  // Add / Update / Delete Process Steps
  const addStep = () => onUpdate('services', ['processes', 'steps'], [...processes.steps, { title: '', description: '' }]);
  const deleteStep = (i: number) => onUpdate('services', ['processes', 'steps'], processes.steps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, field: keyof ProcessStep, value: string) => {
    const updated = [...processes.steps];
    updated[i][field] = value;
    onUpdate('services', ['processes', 'steps'], updated);
  };

  return (
    <AccordionSection
      title="Services Section"
      description="Manage services and their processes"
      isVisible={data.visible ?? true}
      onToggle={toggleServices}
    >
      <div className="space-y-6">
        {/* Services Toggle */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Show Services Section</h3>
          <ToggleSwitch
  isVisible={data.visible ?? true}
  onToggle={toggleServices}
/>
        </div>

        {/* Services Items */}
        {data.visible && (
          <>
            {items.map((s, i) => (
              <div key={i} className="border rounded-lg p-4 relative mt-2">
                <button className="absolute top-2 right-2 text-red-500" onClick={() => deleteService(i)}>
                  <Trash2 size={16} />
                </button>

                <InputField
                  label="Service Name"
                  value={s.serviceName}
                  onChange={e => updateService(i, 'serviceName', e.target.value)}
                  placeholder="Enter service name"
                />
                <InputField
                  label="Service Description"
                  value={s.serviceDescription}
                  onChange={e => updateService(i, 'serviceDescription', e.target.value)}
                  placeholder="Enter service description"
                  textarea
                />
              </div>
            ))}

            <button onClick={addService} className="inline-flex items-center gap-2 text-blue-600 hover:underline mt-2">
              <PlusCircle size={20} /> Add Service
            </button>

            {/* Process Section */}
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Process Section</h3>
               <ToggleSwitch
  isVisible={processes.visible}
  onToggle={toggleProcesses} // matches your function declaration
/>
                
              </div>

              {processes.visible && (
                <>
                  <InputField
                    label="Process Title"
                    value={processes.title}
                    onChange={e => onUpdate('services', ['processes', 'title'], e.target.value)}
                    placeholder="Enter process title"
                  />

                  {processes.steps.map((step, i) => (
                    <div key={i} className="border rounded-lg p-4 relative mt-2">
                      <button className="absolute top-2 right-2 text-red-500" onClick={() => deleteStep(i)}>
                        <Trash2 size={16} />
                      </button>

                      <InputField
                        label="Step Title"
                        value={step.title}
                        onChange={e => updateStep(i, 'title', e.target.value)}
                        placeholder="Enter step title"
                      />
                      <InputField
                        label="Step Description"
                        value={step.description}
                        onChange={e => updateStep(i, 'description', e.target.value)}
                        placeholder="Enter step description"
                        textarea
                      />
                    </div>
                  ))}

                  <button onClick={addStep} className="inline-flex items-center gap-2 text-blue-600 hover:underline mt-2">
                    <PlusCircle size={20} /> Add Process Step
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AccordionSection>
  );
};

export default ServicesSection;
