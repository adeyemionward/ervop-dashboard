'use client';

import React, { useState } from 'react';
import { WebsiteData } from '@/types/WebsiteTypes';
import { AccordionSection, InputField, ToggleSwitch } from '@/components/customization/pages/shared';

type Props = {
  initialTheme?: WebsiteData['theme'];
  initialSeo?: WebsiteData['seo'];
  initialBranding?: WebsiteData['branding'];
  onUpdate?: (section: keyof WebsiteData, path: string[], value: unknown) => void;
};

const BrandingSection: React.FC<Props> = ({
  initialTheme,
  initialSeo,
  initialBranding,
  onUpdate,
}) => {
  const [brandingData, setBrandingData] = useState<WebsiteData['branding']>(
    initialBranding ?? { visible: true }
  );

  const [themeData, setThemeData] = useState<WebsiteData['theme']>(
    initialTheme ?? { primaryColor: '#1D4ED8', secondaryColor: '#9333EA' }
  );

  const [seoData, setSeoData] = useState<WebsiteData['seo']>(
    initialSeo ?? { metaTitle: '', metaDescription: '', metaKeywords: '' }
  );

  const handleBrandingUpdate = <K extends keyof WebsiteData['branding']>(
  field: K,
  value: WebsiteData['branding'][K]
  ) => {
    const updated = { ...brandingData, [field]: value };
    setBrandingData(updated);
    onUpdate?.('branding', [field], value);
  };


  

  const handleThemeUpdate = (field: keyof WebsiteData['theme'], value: string) => {
    const updated = { ...themeData, [field]: value };
    setThemeData(updated);
    onUpdate?.('theme', [field], value);
  };

  const handleSeoUpdate = (field: keyof WebsiteData['seo'], value: string) => {
    const updated = { ...seoData, [field]: value };
    setSeoData(updated);
    onUpdate?.('seo', [field], value);
  };

  return (
    <AccordionSection
      title="Branding & SEO Settings"
      description="Customize your site's branding colors and SEO metadata."
      isVisible={brandingData.visible ?? true}
      onToggle={() => handleBrandingUpdate('visible', !brandingData.visible)}
    >
      <div className="space-y-6">
        {/* Branding Visibility */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Show Branding Section</h3>
          <ToggleSwitch
            isVisible={brandingData.visible ?? true}
            onToggle={() => handleBrandingUpdate('visible', !brandingData.visible)}
          />
        </div>

        {/* Theme & Brand Colors */}
        {(brandingData.visible ?? true) && (
          <>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Theme & Brand Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={themeData.primaryColor}
                    onChange={(e) => handleThemeUpdate('primaryColor', e.target.value)}
                    className="w-full h-10 cursor-pointer border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={themeData.secondaryColor}
                    onChange={(e) => handleThemeUpdate('secondaryColor', e.target.value)}
                    className="w-full h-10 cursor-pointer border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

             
            </div>

            {/* SEO Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">SEO Settings</h3>

              <InputField
                label="Meta Title"
                value={seoData.metaTitle}
                onChange={(e) => handleSeoUpdate('metaTitle', e.target.value)}
                placeholder="Enter your website title for search engines"
              />
              <InputField
                label="Meta Description"
                value={seoData.metaDescription}
                onChange={(e) => handleSeoUpdate('metaDescription', e.target.value)}
                placeholder="Enter a short description for SEO"
              />
              <InputField
                label="Meta Keywords"
                value={seoData.metaKeywords}
                onChange={(e) => handleSeoUpdate('metaKeywords', e.target.value)}
                placeholder="e.g. fashion, handmade, african style"
              />
            </div>
          </>
        )}
      </div>
    </AccordionSection>
  );
};

export default BrandingSection;
