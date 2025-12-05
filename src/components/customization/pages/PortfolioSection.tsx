'use client';

import React from 'react';
import { AccordionSection, InputField, ToggleSwitch } from '@/components/customization/pages/shared';
import { PlusCircle, Trash2 } from 'lucide-react';
import { WebsiteData, PortfolioItem } from '@/types/WebsiteTypes';

type Props = {
  data: WebsiteData['portfolio'];
  // (updated[index] as Record<string, string | File | undefined>)[field] = value;
  onUpdate: (section: keyof WebsiteData, path: string[], value: unknown) => void;
};

const PortfolioSection: React.FC<Props> = ({ data, onUpdate }) => {
  const items = data?.items ?? [];

  // Toggle Portfolio section visibility
  const togglePortfolioSection = () => {
    onUpdate('portfolio', ['visible'], !(data.visible ?? true));
  };

  // Add new portfolio item
  const addItem = () => {
    if (items.length >= 10) return;
    const newItem: PortfolioItem = { image: undefined, title: '', description: '', category: '' };
    onUpdate('portfolio', ['items'], [...items, newItem]);
  };

  // Delete portfolio item
  const deleteItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    onUpdate('portfolio', ['items'], updated);
  };

  // Update portfolio item field
  const updateItem = (index: number, field: keyof PortfolioItem, value: string | File | undefined) => {
    const updated = [...items];
    if (field === 'description' && typeof value === 'string') {
      value = value.slice(0, 100);
    }
    (updated[index][field] as typeof value) = value;

    onUpdate('portfolio', ['items'], updated);
  };

  return (
    <AccordionSection
      title="Portfolio Section"
      description="Manage portfolio items: upload images, titles, descriptions, and categories"
      isVisible={data?.visible ?? true}
      onToggle={togglePortfolioSection}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Show Portfolio Section</h3>
          <ToggleSwitch
            isVisible={data.visible ?? true}
            onToggle={togglePortfolioSection}
          />
        </div>

        {(data.visible ?? true) && (
          <>
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 relative">
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => deleteItem(index)}
                >
                  <Trash2 size={16} />
                </button>

                <input
                  type="file"
                  className="mt-1 block w-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) updateItem(index, 'image', file);
                  }}
                />

                <InputField
                  label="Title"
                  value={item.title}
                  onChange={(e) => updateItem(index, 'title', e.target.value)}
                  placeholder="Enter title"
                />

                <InputField
                  label="Category / Tag"
                  value={item.category}
                  onChange={(e) => updateItem(index, 'category', e.target.value)}
                  placeholder="Enter category (e.g., Product Design)"
                />

                <InputField
                  label="Description (max 100 chars)"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Enter description"
                  textarea
                />
              </div>
            ))}

            {items.length < 10 && (
              <button
                onClick={addItem}
                className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline mt-2"
              >
                <PlusCircle size={20} /> Add Portfolio Item
              </button>
            )}
          </>
        )}
      </div>
    </AccordionSection>
  );
};

export default PortfolioSection;
