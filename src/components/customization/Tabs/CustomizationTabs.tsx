'use client';

import React, { useState, useEffect } from 'react';
import HomePageSettings from '@/components/customization/pages/HomePageSettings';
import AboutUsSection from '@/components/customization/pages/AboutUsSection';
import HeaderSection from '@/components/customization/pages/HeaderSection';
import FaqSection from '@/components/customization/pages/FaqSection';
import ServicesSection from '@/components/customization/pages/ServiceSection';
import BrandingSection from '@/components/customization/pages/BrandingSection';
import ContactSection from '@/components/customization/pages/ContactSection';
import PortfolioSection from '@/components/customization/pages/PortfolioSection';
import {normalizeHomeData} from '@/app/utils/normalizeHomeData';
import {normalizeAboutData} from '@/app/utils/normalizeAboutData';
import {normalizeFaqData} from '@/app/utils/normalizeFaqData';
import { WebsiteData } from '@/types/WebsiteTypes';
import { normalizeServicesData } from '@/app/utils/normalizeServicesData';
import ReviewsSection from '../pages/ReviewsSection';
import { normalizeReviewsData } from '@/app/utils/normalizeReviewsData';


const TABS = [
  { id: 'branding', label: 'Branding' },
  { id: 'header', label: 'Header' },
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact' },
];

export default function CustomizationTabs() {
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(true);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = 'http://127.0.0.1:8000/api/v1/professionals/customizations/content';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';


  /** Fetch customization data **/
 useEffect(() => {
  console.log('useEffect triggered');
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      console.log('Fetch response status:', res.status);

      if (!res.ok) throw new Error(`Failed to fetch data (${res.status})`);

      const data = await res.json();
     
      setWebsiteData({
        ...data,
        home: normalizeHomeData(data.home),
        about: normalizeAboutData(data.about),
        reviews: normalizeReviewsData(data.reviews),
        faq: normalizeFaqData(data.faq),
        services: normalizeServicesData(data.services), // ✅ normalize services here
      });
    } catch (err: unknown) {
    console.error("Fetch error:", err);

    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Failed to load customization data.");
    }
  } finally {
    setLoading(false);
  }

  };

  fetchData();
}, [apiUrl, token]);


  /** Update nested state safely **/
  const handleUpdate = (
  section: keyof WebsiteData,
  path: string[],
  value: unknown
) => {
  setWebsiteData(prev => {
    if (!prev) return prev;

    // Make a shallow copy of the section
    const updatedSection = { ...prev[section] };
    let temp: Record<string, unknown> = updatedSection;

    // Traverse to the nested property
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      temp[key] = { ...(temp[key] as Record<string, unknown>) };
      temp = temp[key] as Record<string, unknown>;
    }

    // Set the new value
    temp[path[path.length - 1]] = value;

    return { ...prev, [section]: updatedSection };
  });
};


  /** Render tab content **/
  const renderTabContent = () => {
    if (!websiteData) return null;

    switch (activeTab) {
      case 'branding':
        return <BrandingSection data={websiteData.branding ?? {}} onUpdate={handleUpdate} />;

      case 'header':
        return (
          <HeaderSection
            data={websiteData.header ?? {}}
            onUpdate={(field, value) => handleUpdate('header', [field], value)}
            onMenuToggle={(menuKey) =>
              handleUpdate('header', ['menuItems', menuKey, 'visible'], !websiteData.header?.menuItems[menuKey]?.visible)
            }
          />
        );

      case 'home':
        return (
          <HomePageSettings
            data={websiteData.home}
            onUpdate={(section, field, value) => handleUpdate('home', [section, field], value)}
          />
        );

      case 'about':
        return (
          <AboutUsSection
          data={websiteData.about}  // <-- pass the normalized about data here
          onUpdate={(field, value) => handleUpdate('about', [field], value)}
        />
        );

        case 'reviews':
        return (
        
          <ReviewsSection data={websiteData.reviews ?? {}} onUpdate={handleUpdate} />

        );

     // Inside renderTabContent in CustomizationTabs
        case 'faq':
          return (
          <FaqSection
          data={websiteData.faq}
          onUpdate={(field, value) => handleUpdate('faq', [field], value)}
        />

          );

      case 'services':
        return <ServicesSection data={websiteData.services ?? {}} onUpdate={handleUpdate} />;
      case 'portfolio':
        return <PortfolioSection data={websiteData.portfolio ?? {}} onUpdate={handleUpdate} />;
      case 'contact':
        return <ContactSection data={websiteData.contact ?? {}} onUpdate={handleUpdate} />;

      default:
        return null;
    }
  };

  /** Save customization **/
  const saveCustomization = async () => {
    if (!websiteData) return;
    try {
      setLoading(true);
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(websiteData),
      });

      if (!res.ok) throw new Error('Failed to save customization');

      alert('Customization saved successfully!');
      } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save data.");
      }
    } finally {
      setLoading(false);
    }

  };

  if (loading && !websiteData) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!websiteData) return <p>No customization data found.</p>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 rounded-t-lg font-medium text-sm ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>{renderTabContent()}</div>

      <div className="mt-6 text-right">
        <button
          onClick={saveCustomization}
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
