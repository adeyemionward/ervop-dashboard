'use client';

import React, { useState, useEffect } from 'react';
import LogoUpload from '@/components/customization/pages/LogoUpload';
import MenuLinksEditor from '@/components/customization/pages/MenuLinksEditor';
import { WebsiteData } from '@/types/WebsiteTypes';
import { AccordionSection, InputField } from '@/components/customization/pages/shared';
import { normalizeHeaderData } from '@/app/utils/normalizeHeaderData';

type Props = {
  data: WebsiteData['header'];
  onUpdate: (field: keyof WebsiteData['header'], value: unknown) => void;
  onMenuToggle: (menuKey: keyof WebsiteData['header']['menuItems']) => void;
};

const HeaderSection: React.FC<Props> = ({ data, onUpdate, onMenuToggle }) => {
  const [headerData, setHeaderData] = useState<WebsiteData['header']>(
    normalizeHeaderData(data ?? {}) // fallback to empty object
  );

  // Keep local state in sync if parent updates `data`
  useEffect(() => {
    setHeaderData(normalizeHeaderData(data));
  }, [data]);

  const handleHeaderUpdate = (field: keyof WebsiteData['header'], value: unknown) => {
    const updated = { ...headerData, [field]: value };
    setHeaderData(updated);
    onUpdate(field, value);
  };

  return (
    <AccordionSection
      title="Header"
      description="Customize your site's main navigation, branding, and global settings."
      isVisible={headerData?.visible ?? true}
      onToggle={() => handleHeaderUpdate('visible', !headerData?.visible)}
    >
      <div className="space-y-6">
        {/* Logo Upload */}
        <LogoUpload
          label="Logo"
          imageUrl={headerData.logo ?? ''}
          onChange={(newUrl) => handleHeaderUpdate('logo', newUrl)}
        />

        {/* Brand Name */}
        <InputField
          label="Brand Name / Title"
          value={headerData.title ?? ''}
          onChange={(e) => handleHeaderUpdate('title', e.target.value)}
          maxLength={40}
          placeholder="Enter your brand name"
        />

        {/* Menu Links */}
        <MenuLinksEditor
          menuItems={headerData.menuItems ?? {}}
          onToggle={(menuKey) => {
            if (!headerData.menuItems) return;
            const updatedMenu = { ...headerData.menuItems };
            if (updatedMenu[menuKey]) {
              updatedMenu[menuKey].visible = !updatedMenu[menuKey].visible;
              handleHeaderUpdate('menuItems', updatedMenu);
              onMenuToggle(menuKey);
            }
          }}
        />
      </div>
    </AccordionSection>
  );
};

export default HeaderSection;
