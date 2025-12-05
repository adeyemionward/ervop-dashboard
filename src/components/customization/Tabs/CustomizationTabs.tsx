'use client';

import React, { useState, useEffect } from 'react';
import HeaderSection from '@/components/customization/pages/HeaderSection';
import BrandingSection from '@/components/customization/pages/BrandingSection';
import HomePageSettings from '@/components/customization/pages/HomePageSettings';
import AboutUsSection from '@/components/customization/pages/AboutUsSection';
import ReviewsSection from '@/components/customization/pages/ReviewsSection';
import FaqSection from '@/components/customization/pages/FaqSection';
import ServicesSection from '@/components/customization/pages/ServiceSection';
import PortfolioSection from '@/components/customization/pages/PortfolioSection';
import { WebsiteData } from '@/types/WebsiteTypes';
import { normalizeHomeData } from '@/app/utils/normalizeHomeData';
import { normalizeAboutData } from '@/app/utils/normalizeAboutData';
import { normalizeFaqData } from '@/app/utils/normalizeFaqData';
import { normalizeServicesData } from '@/app/utils/normalizeServicesData';
import { normalizeReviewsData } from '@/app/utils/normalizeReviewsData';
import { normalizeHeaderData } from '@/app/utils/normalizeHeaderData';

const TABS = [
  { id: 'branding', label: 'Branding' },
  { id: 'header', label: 'Header' },
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'services', label: 'Services' },
] as const;

export default function CustomizationTabs() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('branding');
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = 'http://127.0.0.1:8000/api/v1/professionals/customizations/content';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(`Failed to fetch data (${res.status})`);

        const data = await res.json();

        setWebsiteData({
          ...data,
          header: normalizeHeaderData(data.header), // <-- important
          home: normalizeHomeData(data.home),
          about: normalizeAboutData(data.about),
          reviews: normalizeReviewsData(data.reviews),
          faq: normalizeFaqData(data.faq),
          services: normalizeServicesData(data.services),
        });
      } catch (err: unknown) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customization data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token]);

  const handleUpdate = (section: keyof WebsiteData, path: (string | number)[], value: unknown) => {
    setWebsiteData((prev) => {
      if (!prev) return prev;

      const updatedSection = { ...prev[section] } as Record<string, unknown>;
      let temp: Record<string, unknown> = updatedSection;

      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        temp[key] = { ...(temp[key] as Record<string, unknown>) };
        temp = temp[key] as Record<string, unknown>;
      }

      temp[path[path.length - 1]] = value;
      return { ...prev, [section]: updatedSection } as WebsiteData;
    });
  };

  const renderTabContent = () => {
    if (!websiteData) return <p>Loading data...</p>;

    switch (activeTab) {
      case 'branding':
        return (
          <BrandingSection
            initialBranding={websiteData.branding}
            initialTheme={websiteData.theme}
            initialSeo={websiteData.seo}
            onUpdate={handleUpdate}
          />
        );

      case 'header':
        return websiteData.header ? (
          <HeaderSection
            data={websiteData.header}
            onUpdate={(field, value) => handleUpdate('header', [field], value)}
            onMenuToggle={(menuKey) =>
              handleUpdate('header', ['menuItems', menuKey, 'visible'], !websiteData.header.menuItems[menuKey]?.visible)
            }
          />
        ) : null;

      case 'home':
        return (
          <HomePageSettings
            data={websiteData.home}
            onUpdate={(section, field, value) => handleUpdate('home', [section, field], value)}
          />
        );

      case 'about':
        return <AboutUsSection data={websiteData.about} onUpdate={(field, value) => handleUpdate('about', [field], value)} />;

      case 'reviews':
        return <ReviewsSection data={websiteData.reviews} onUpdate={handleUpdate} />;

      case 'faq':
        return <FaqSection data={websiteData.faq} onUpdate={(field, value) => handleUpdate('faq', [field], value)} />;

      case 'services':
        return <ServicesSection data={websiteData.services} onUpdate={handleUpdate} />;

      case 'portfolio':
        return <PortfolioSection data={websiteData.portfolio} onUpdate={handleUpdate} />;

      default:
        return null;
    }
  };

  if (loading && !websiteData) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!websiteData) return <p>No customization data found.</p>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b mb-6">
        {TABS.map((tab) => (
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
    </div>
  );
}
