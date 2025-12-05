'use client';

import React from 'react';
import { AccordionSection, InputField, ToggleSwitch } from '@/components/customization/pages/shared';
import { PlusCircle, Trash2 } from 'lucide-react';
import { WebsiteData, ServiceItem } from '@/types/WebsiteTypes';

type Props = {
  data: WebsiteData['services'];
  onUpdate: (section: keyof WebsiteData, path: string[], value: unknown) => void;
};

const ServicesSection: React.FC<Props> = ({ data, onUpdate }) => {
  const items = data.items ?? [];

  const toggleServices = () => onUpdate('services', ['visible'], !(data.visible ?? true));

  const addService = () => {
    const newService: ServiceItem = {
      serviceName: '',
      headline: '',
      subheadline: '',
      serviceDescription: '',
      whatsIncluded: [''],
      whosItFor: '',
      visible: true,
    };
    onUpdate('services', ['items'], [...items, newService]);
  };

  const deleteService = (i: number) => onUpdate('services', ['items'], items.filter((_, idx) => idx !== i));

  const updateService = <K extends keyof ServiceItem>(
  i: number,
  field: K,
  value: ServiceItem[K]
) => {
  const updated: ServiceItem[] = [...(items ?? [])];
  if (updated[i]) {
    updated[i][field] = value;
    onUpdate('services', ['items'], updated);
  }
};


  

  // const updateWhatsIncluded = (i: number, idx: number, value: string) => {
  //   const updated: ServiceItem[] = [...items];
  //   if (!updated[i].whatsIncluded) updated[i].whatsIncluded = [];
  //   updated[i].whatsIncluded[idx] = value;
  //   onUpdate('services', ['items'], updated);
  // };

  // const addWhatsIncluded = (i: number) => {
  //   const updated: ServiceItem[] = [...items];
  //   if (!updated[i].whatsIncluded) updated[i].whatsIncluded = [];
  //   updated[i].whatsIncluded.push('');
  //   onUpdate('services', ['items'], updated);
  // };

  // const deleteWhatsIncluded = (i: number, idx: number) => {
  //   const updated: ServiceItem[] = [...items];
  //   if (updated[i].whatsIncluded) {
  //     updated[i].whatsIncluded.splice(idx, 1);
  //     onUpdate('services', ['items'], updated);
  //   }
  // };

  return (
    <AccordionSection
      title="Services Section"
      description="Manage services offered"
      isVisible={data.visible ?? true}
      onToggle={toggleServices}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Show Services Section</h3>
          <ToggleSwitch isVisible={data.visible ?? true} onToggle={toggleServices} />
        </div>

        {data.visible &&
          items.map((s, i) => (
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

              {/* <InputField
                label="Headline"
                value={s.headline}
                onChange={e => updateService(i, 'headline', e.target.value)}
                placeholder="Enter headline"
              /> */}

              {/* <InputField
                label="Subheadline"
                value={s.subheadline}
                onChange={e => updateService(i, 'subheadline', e.target.value)}
                placeholder="Enter subheadline"
              /> */}

              <InputField
                label="Service Description"
                value={s.serviceDescription}
                onChange={e => updateService(i, 'serviceDescription', e.target.value)}
                placeholder="Enter service description"
                textarea
              />

              {/* Who it's for */}
      {/* <div className="mt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Show Who it's for</h4>
          <ToggleSwitch
            isVisible={s.showWhosItFor ?? true}
            onToggle={() => updateService(i, 'showWhosItFor', !(s.showWhosItFor ?? true))}
          />
        </div>
        {s.showWhosItFor && (
          <InputField
            label="Who it's for"
            value={s.whosItFor ?? ''}
            onChange={e => updateService(i, 'whosItFor', e.target.value)}
            placeholder="Describe who the service is for"
            textarea
          />
        )}
      </div> */}

      {/* What's Included */}
      {/* <div className="mt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Show What's Included</h4>
          <ToggleSwitch
            isVisible={s.showWhatsIncluded ?? true}
            onToggle={() => updateService(i, 'showWhatsIncluded', !(s.showWhatsIncluded ?? true))}
          />
        </div>
        {s.showWhatsIncluded &&
          s.whatsIncluded?.map((w, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-1">
              <input
                type="text"
                className="w-full border rounded-lg p-1"
                value={w}
                onChange={e => updateWhatsIncluded(i, idx, e.target.value)}
              />
              <button className="text-red-500" onClick={() => deleteWhatsIncluded(i, idx)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        {s.showWhatsIncluded && (
          <button
            onClick={() => addWhatsIncluded(i)}
            className="inline-flex items-center gap-2 text-blue-600 hover:underline mt-1"
          >
            <PlusCircle size={16} /> Add Item
          </button>
        )}
      </div> */}
            </div>
          ))}

        <button onClick={addService} className="inline-flex items-center gap-2 text-blue-600 hover:underline mt-2">
          <PlusCircle size={20} /> Add Service
        </button>
      </div>
    </AccordionSection>
  );
};

export default ServicesSection;
