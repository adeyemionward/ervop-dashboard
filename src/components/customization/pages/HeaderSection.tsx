'use client';

import React, { useState } from 'react';
import LogoUpload from '@/components/customization/pages/LogoUpload';
import MenuLinksEditor from '@/components/customization/pages/MenuLinksEditor';
import { WebsiteData } from '@/types/WebsiteTypes';
import { AccordionSection, InputField } from '@/components/customization/pages/shared';
import { normalizeHeaderData } from '@/app/utils/normalizeHeaderData';

type Props = {
  initialHeader?: WebsiteData['header'];
  initialTheme?: WebsiteData['theme'];
  initialSeo?: WebsiteData['seo'];
};

const HeaderSection: React.FC<Props> = ({
  initialHeader,
  
}) => {
  // State for header, theme, and SEO
  const [headerData, setHeaderData] = useState<WebsiteData['header']>(
    initialHeader ? initialHeader : normalizeHeaderData({})
  );

 
  const handleHeaderUpdate = (field: keyof WebsiteData['header'], value: unknown) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
  };


  return (
    <AccordionSection
      title="Header"
      description="Customize your site's main navigation, branding, and global settings."
      isVisible={headerData.visible}
      onToggle={() => handleHeaderUpdate('visible', !headerData.visible)}
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
          value={headerData.title}
          onChange={(e) => handleHeaderUpdate('title', e.target.value)}
          maxLength={40}
          placeholder="Enter your brand name"
        />

        {/* Menu Links */}
        <MenuLinksEditor
  menuItems={headerData.menuItems}
  onToggle={(menuKey) => {
    const updatedMenu = { ...headerData.menuItems };

    if (updatedMenu[menuKey]) {
      updatedMenu[menuKey].visible = !updatedMenu[menuKey]!.visible;
      handleHeaderUpdate('menuItems', updatedMenu);
    }
  }}
/>

      </div>
    </AccordionSection>
  );
};

export default HeaderSection;
