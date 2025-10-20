'use client';

import React from 'react';
import { AccordionSection, InputField, ToggleSwitch } from '@/components/customization/pages/shared';
import { WebsiteData } from '@/types/WebsiteTypes';

type Props = {
  data: WebsiteData['contact'];
  onUpdate: (section: keyof WebsiteData, path: string[], value: unknown) => void;
};

const ContactSection: React.FC<Props> = ({ data, onUpdate }) => {
  const toggleSection = () => {
    onUpdate('contact', ['visible'], !data.visible);
  };

  return (
    <AccordionSection
      title="Contact Section"
      description="Manage contact info visibility and details"
      isVisible={data.visible ?? true}
      onToggle={toggleSection}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Show Contact Section</h3>
          <ToggleSwitch
            isVisible={data.visible ?? true}
            onToggle={toggleSection}
          />
        </div>

        {data.visible && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-800">
              <i data-lucide="mail" className="w-5 h-5 text-purple-500"></i>
              <InputField
                label="Enter Email Address"
                value={data.email ?? ''}
                onChange={(e) => onUpdate('contact', ['email'], e.target.value)}
                placeholder="Enter email"
              />
            </div>


            <div className="flex items-center space-x-3 text-gray-800">
              <i data-lucide="phone" className="w-5 h-5 text-purple-500"></i>
              <InputField
                label="Enter Phone Number"
                value={data.phone ?? ''}
                onChange={(e) => onUpdate('contact', ['phone'], e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="flex items-start space-x-3 text-gray-800">
              <i data-lucide="map-pin" className="w-5 h-5 mt-1 text-purple-500"></i>
              <InputField
                label="Enter Address"
                value={data.address ?? ''}
                onChange={(e) => onUpdate('contact', ['address'], e.target.value)}
                placeholder="Enter address"
                textarea
              />
            </div>
          </div>
        )}
      </div>
    </AccordionSection>
  );
};

export default ContactSection;
