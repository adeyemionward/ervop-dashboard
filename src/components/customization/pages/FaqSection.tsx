'use client';

import React from 'react';
import { AccordionSection, InputField, ToggleSwitch } from '@/components/customization/pages/shared';
import { PlusCircle, Trash2 } from 'lucide-react';
import { WebsiteData, FaqItem } from '@/types/WebsiteTypes';

type Props = {
  data: WebsiteData['faq'];
  onUpdate: (field: string, value: any) => void;
};

const FaqSection: React.FC<Props> = ({ data, onUpdate }) => {
  // Add a new FAQ item
  const addFaq = () => {
    const newFaq: FaqItem = { question: '', answer: '' };
    const updatedItems = [...(data.items ?? []), newFaq];
    onUpdate('items', updatedItems);
    console.log('Added FAQ:', updatedItems);
  };

  // Update a specific FAQ item
  const updateFaq = (index: number, field: keyof FaqItem, value: string) => {
    const updatedItems = (data.items ?? []).map((faq, i) =>
      i === index ? { ...faq, [field]: value } : faq
    );
    onUpdate('items', updatedItems);
    console.log(`Updated FAQ [${index}] ${field}:`, updatedItems[index]);
  };

  // Delete a specific FAQ item
  const deleteFaq = (index: number) => {
    const updatedItems = (data.items ?? []).filter((_, i) => i !== index);
    onUpdate('items', updatedItems);
    console.log(`Deleted FAQ [${index}]:`, updatedItems);
  };

  // Toggle FAQ section visibility
  const handleToggle = () => {
    const newVisibility = !(data.visible ?? false);
    onUpdate('visible', newVisibility);
    console.log('FAQ section visibility:', newVisibility);
  };

  return (
    <AccordionSection
      title="FAQ Section"
      description="Manage FAQ visibility, questions, and answers."
      isVisible={data.visible ?? false}
      onToggle={handleToggle}
    >
      <div className="space-y-6">
        {/* Toggle Section */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Show FAQ Section</h3>
          <ToggleSwitch
            isVisible={data.visible ?? false}
            onToggle={handleToggle}
          />
        </div>

        {data.visible && (
          <>
            {(data.items ?? []).map((faq, index) => (
              <div key={index} className="border rounded-lg p-4 relative">
                <button
                  onClick={() => deleteFaq(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
                <InputField
                  label="Question"
                  value={faq.question}
                  onChange={(e) => updateFaq(index, 'question', e.target.value)}
                  placeholder="Enter FAQ question"
                />
                <InputField
                  label="Answer"
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                  placeholder="Enter FAQ answer"
                  textarea
                />
              </div>
            ))}

            <button
              onClick={addFaq}
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
            >
              <PlusCircle size={20} /> Add FAQ
            </button>
          </>
        )}
      </div>
    </AccordionSection>
  );
};

export default FaqSection;
