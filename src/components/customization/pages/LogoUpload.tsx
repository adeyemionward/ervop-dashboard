'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

type Props = {
  label?: string;
  imageUrl?: string;
  onChange: (url: string) => void;
};

const LogoUpload: React.FC<Props> = ({ label = 'Logo', imageUrl, onChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onChange(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Logo"
            className="h-12 w-12 rounded-lg object-contain border border-gray-200"
          />
        ) : (
          <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded-lg">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}

        <button
          type="button"
          className="ml-auto text-sm font-semibold text-blue-600 hover:underline"
          onClick={() => document.getElementById('logo-upload')?.click()}
        >
          {imageUrl ? 'Change Logo' : 'Upload Logo'}
        </button>

        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default LogoUpload;
