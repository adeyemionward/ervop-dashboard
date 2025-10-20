'use client';

import React from 'react';
import { AccordionSection, InputField } from '@/components/customization/pages/shared';
import { WebsiteData } from '@/types/WebsiteTypes';
import { Trash2, Plus, Upload } from 'lucide-react';
import Image from 'next/image';

type HomePageSettingsProps = {
  data: WebsiteData['home'];
  onUpdate: (section: keyof WebsiteData['home'], field: string, value: unknown) => void;
};

export default function HomePageSettings({ data, onUpdate }: HomePageSettingsProps) {
  const updateField = (section: keyof WebsiteData['home'], field: string, value: unknown) => {
    onUpdate(section, field, value);
  };

  

  const handleHeroUpload = (files: FileList | null) => {
    if (!files) return;
    const currentImages = data.hero?.images || [];
    const newFiles = Array.from(files).slice(0, 3 - currentImages.length);

    const readers = newFiles.map(
      file =>
        new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then(newImages => {
      updateField('hero', 'images', [...currentImages, ...newImages]);
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <AccordionSection
        title="Hero Section"
        description="Main section with tagline, headlines, and background images."
        isVisible={data.hero?.visible ?? true}
        onToggle={() => updateField('hero', 'visible', !(data.hero?.visible ?? true))}
      >
        <InputField label="Tagline" value={data.hero?.tagline ?? ''} onChange={e => updateField('hero', 'tagline', e.target.value)} />
        <InputField label="Headline" value={data.hero?.headline ?? ''} onChange={e => updateField('hero', 'headline', e.target.value)} />
        <InputField label="Subheadline" value={data.hero?.subheadline ?? ''} onChange={e => updateField('hero', 'subheadline', e.target.value)} />
        <InputField label="Primary Button" value={data.hero?.ctaText ?? ''} onChange={e => updateField('hero', 'ctaText', e.target.value)} />
        <InputField label="Secondary Button" value={data.hero?.ctaText2 ?? ''} onChange={e => updateField('hero', 'ctaText2', e.target.value)} />

        {/* Hero Images */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Hero Images (Max 3)</h4>
            <label
              htmlFor="heroImageUpload"
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl cursor-pointer ${
                (data.hero?.images?.length ?? 0) >= 3 ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Upload size={16} /> Upload Images
            </label>
            <input
              id="heroImageUpload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={(data.hero?.images?.length ?? 0) >= 3}
              onChange={e => handleHeroUpload(e.target.files)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(data.hero?.images ?? []).map((img, index) => (
              <div key={index} className="relative group">
                <div className="w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={img} alt={`Hero ${index + 1}`} className="object-cover w-full h-full" />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateField('hero', 'images', (data.hero?.images ?? []).filter((_, i) => i !== index))
                  }
                  className="absolute top-2 right-2 bg-white/80 text-red-600 p-1 rounded-full shadow hover:bg-white transition"
                  title="Remove Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </AccordionSection>

      {/* Processes Section */}
      {/* <AccordionSection
        title="Our Process"
        description="Show how your business works."
        isVisible={data.processes?.visible ?? true}
        onToggle={() => updateField('processes', 'visible', !(data.processes?.visible ?? true))}
      >
        <InputField label="Section Title" value={data.processes?.title ?? ''} onChange={e => updateField('processes', 'title', e.target.value)} />
        <div className="mt-4 space-y-4">
          {(data.processes?.steps ?? []).map((step, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-4 rounded-xl relative">
              <button
                type="button"
                onClick={() =>
                  updateField(
                    'processes',
                    'steps',
                    (data.processes?.steps ?? []).filter((_, i) => i !== index)
                  )
                }
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete step"
              >
                <Trash2 size={18} />
              </button>
              <InputField
                label={`Step ${index + 1} Title`}
                value={step.title ?? ''}
                onChange={e => {
                  const newSteps = [...(data.processes?.steps ?? [])];
                  newSteps[index] = { ...newSteps[index], title: e.target.value };
                  updateField('processes', 'steps', newSteps);
                }}
              />
              <InputField
                label={`Step ${index + 1} Description`}
                value={step.description ?? ''}
                onChange={e => {
                  const newSteps = [...(data.processes?.steps ?? [])];
                  newSteps[index] = { ...newSteps[index], description: e.target.value };
                  updateField('processes', 'steps', newSteps);
                }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateField('processes', 'steps', [...(data.processes?.steps ?? []), { title: '', description: '' }])
            }
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <Plus size={16} /> Add Step
          </button>
        </div>
      </AccordionSection> */}

      {/* Why Us Section */}
      <AccordionSection
        title="Why Us"
        description="Reasons customers should choose your brand."
        isVisible={data.whyUs?.visible ?? true}
        onToggle={() => updateField('whyUs', 'visible', !(data.whyUs?.visible ?? true))}
      >
        <InputField label="Section Title" value={data.whyUs?.title ?? ''} onChange={e => updateField('whyUs', 'title', e.target.value)} />
        {(data.whyUs?.points ?? []).map((point, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-4 rounded-xl relative">
            <button
              type="button"
              onClick={() =>
                updateField('whyUs', 'points', (data.whyUs?.points ?? []).filter((_, i) => i !== index))
              }
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Delete reason"
            >
              <Trash2 size={18} />
            </button>
            <InputField
              label={`Reason ${index + 1} Title`}
              value={point.title ?? ''}
              onChange={e => {
                const newPoints = [...(data.whyUs?.points ?? [])];
                newPoints[index] = { ...newPoints[index], title: e.target.value };
                updateField('whyUs', 'points', newPoints);
              }}
            />
            <InputField
              label={`Reason ${index + 1} Description`}
              value={point.description ?? ''}
              onChange={e => {
                const newPoints = [...(data.whyUs?.points ?? [])];
                newPoints[index] = { ...newPoints[index], description: e.target.value };
                updateField('whyUs', 'points', newPoints);
              }}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            updateField('whyUs', 'points', [...(data.whyUs?.points ?? []), { title: '', description: '' }])
          }
          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          <Plus size={16} /> Add Reason
        </button>
      </AccordionSection>

      {/* Services Section */}
      <AccordionSection
        title="Services"
        description="Preview on Home page."
        isVisible={data.services?.visible ?? true}
        onToggle={() => updateField('services', 'visible', !(data.services?.visible ?? true))}
      >
        <InputField label="Title" value={data.services?.title ?? ''} onChange={e => updateField('services', 'title', e.target.value)} />
        <InputField label="Summary" value={data.services?.summary ?? ''} textarea onChange={e => updateField('services', 'summary', e.target.value)} />
      </AccordionSection>

      {/* About Section */}
      <AccordionSection
        title="About"
        description="Preview on Home page."
        isVisible={data.about?.visible ?? true}
        onToggle={() => updateField('about', 'visible', !(data.about?.visible ?? true))}
      >
        <InputField label="Title" value={data.about?.title ?? ''} onChange={e => updateField('about', 'title', e.target.value)} />
        <InputField label="Summary" value={data.about?.summary ?? ''} textarea onChange={e => updateField('about', 'summary', e.target.value)} />
      </AccordionSection>
    </div>
  );
}
