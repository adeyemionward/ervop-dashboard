'use client';

import React from 'react';
import { AccordionSection, InputField, ToggleSwitch } from '@/components/customization/pages/shared';
import { WebsiteData } from '@/types/WebsiteTypes';

type Props = {
  data: { visible: boolean; buttonText: string };
  onUpdate: (section: keyof WebsiteData, path: string[], value: any) => void;
};

const AppointmentSection: React.FC<Props> = ({ data, onUpdate }) => {
  // Toggle section visibility
  const toggleSection = () => {
    onUpdate('home', ['appointment', 'visible'], !data.visible);
  };

  // Update button text
  const updateButtonText = (value: string) => {
    onUpdate('home', ['appointment', 'buttonText'], value);
  };

  return (
    <AccordionSection
      title="Appointment Section"
      description="Customize the appointment button text"
      isVisible={data.visible ?? true}
      onToggle={toggleSection}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Show Appointment Section</h3>
          <ToggleSwitch
            isVisible={data.visible ?? true}
            onToggle={toggleSection}
          />
        </div>

        {data.visible && (
          <InputField
            label="Button Text"
            value={data.buttonText ?? ''}
            onChange={(e) => updateButtonText(e.target.value)}
            placeholder="Enter button text"
          />
        )}
      </div>
    </AccordionSection>
  );
};

export default AppointmentSection;
