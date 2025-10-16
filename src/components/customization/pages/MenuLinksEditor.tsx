'use client';

import React from 'react';
import SettingToggle from '@/components/customization/pages/shared/SettingToggle';
import { WebsiteData } from '@/types/WebsiteTypes';

type Props = {
  menuItems: WebsiteData['header']['menuItems'];
  onToggle: (menuKey: keyof WebsiteData['header']['menuItems']) => void;
};

const MenuLinksEditor: React.FC<Props> = ({ menuItems, onToggle }) => {
  return (
    <div className="pt-4 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Menu Links</h4>
      <div className="space-y-3">
        {Object.entries(menuItems).map(([key, item]) => (
          <SettingToggle
            key={key}
            label={`Show "${item.title}" link`}
            isEnabled={item.visible}
            onToggle={() => onToggle(key as keyof WebsiteData['header']['menuItems'])}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuLinksEditor;
