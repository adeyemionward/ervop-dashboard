'use client';

import React, { useState, FC, ReactNode } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { 
    Eye, EyeOff, ChevronDown, Image as ImageIcon, Heading1, Type, Link2, Palette, Save
} from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

// --- TYPE DEFINITIONS ---
type MenuItem = {
    title: string;
    visible: boolean;
};

type SectionData = {
    visible: boolean;
    [key: string]: any;
};

type WebsiteData = {
    header: SectionData & { 
        title: string; 
        menuItems: {
            home: MenuItem;
            about: MenuItem;
            faq: MenuItem;
            shop: MenuItem;
            services: MenuItem;
            portfolio: MenuItem;
        }
    };
    hero: SectionData & { headline: string; subheadline: string; ctaText: string; image: string };
    about: SectionData & { title: string; content: string; image: string };
    // Add other sections as needed
};

// --- REUSABLE COMPONENTS ---

const ToggleSwitch = ({ isVisible, onToggle }: { isVisible: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-800">
        {isVisible ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-red-500" />}
        <span>{isVisible ? 'Visible' : 'Hidden'}</span>
    </button>
);

const SettingToggle = ({ label, description, isEnabled, onToggle }: { label: string; description?: string; isEnabled: boolean; onToggle: () => void; }) => (
    <div className="flex justify-between items-center">
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <button 
            onClick={onToggle} 
            className={clsx(
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isEnabled ? 'bg-blue-600' : 'bg-gray-200'
            )}
        >
            <span className={clsx(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                isEnabled ? 'translate-x-5' : 'translate-x-0'
            )}/>
        </button>
    </div>
);


const AccordionSection = ({ title, description, isVisible, onToggle, children }: { title: string; description: string; isVisible: boolean; onToggle: () => void; children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <ToggleSwitch isVisible={isVisible} onToggle={onToggle} />
                    <ChevronDown className={clsx("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
                </div>
            </div>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                    {children}
                </div>
            )}
        </div>
    );
};

const InputField = ({ label, value, onChange, maxLength, placeholder }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; maxLength?: number; placeholder?: string; }) => (
    <div>
        <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {maxLength && <span className="text-xs text-gray-400">{value.length} / {maxLength}</span>}
        </div>
        <input 
            type="text" 
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            placeholder={placeholder}
            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
    </div>
);

// --- MAIN PAGE COMPONENT ---
export default function CustomizationPage() {
    // In a real app, this state would be fetched from your Laravel API
    const [websiteData, setWebsiteData] = useState<WebsiteData>({
        header: { 
            visible: true, 
            title: "Adeyemi's Designs", 
            menuItems: {
                home: { title: 'Home', visible: true },
                about: { title: 'About', visible: true },
                faq: { title: 'FAQ', visible: false },
                shop: { title: 'Shop', visible: true },
                services: { title: 'Services', visible: true },
                portfolio: { title: 'Portfolio', visible: false },
            }
        },
        hero: { visible: true, headline: "Modern Styles, Timeless Roots.", subheadline: "Discover authentic, handcrafted Nigerian fashion.", ctaText: "Shop Bestsellers", image: "https://images.unsplash.com/photo-1617935932135-035889354e6b?q=80&w=2787&auto=format&fit=crop" },
        about: { visible: true, title: "From Our Hands to Your Home", content: "Adeyemi's Designs started in a small workshop in Lagos...", image: "https://placehold.co/600x400/E2E8F0/4A5568?text=Founder" },
    });
    
    // Helper function to update nested state
    const handleUpdate = (section: keyof WebsiteData, field: string, value: any) => {
        setWebsiteData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleMenuItemToggle = (menuKey: keyof WebsiteData['header']['menuItems']) => {
        setWebsiteData(prev => ({
            ...prev,
            header: {
                ...prev.header,
                menuItems: {
                    ...prev.header.menuItems,
                    [menuKey]: {
                        ...prev.header.menuItems[menuKey],
                        visible: !prev.header.menuItems[menuKey].visible,
                    }
                }
            }
        }));
    };

    return (
        <DashboardLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Website Customization</h1>
                    <p className="mt-1 text-gray-500">Bring your brand to life. Your changes will be saved automatically.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm">
                        <Save className="w-4 h-4 mr-2" />
                        <span>Save & Publish</span>
                    </button>
                </div>
            </header>

            <div className="max-w-3xl mx-auto">
                {/* Customization Controls */}
                <div className="space-y-6">
                    <AccordionSection 
                        title="Header" 
                        description="Your site's main navigation bar."
                        isVisible={websiteData.header.visible}
                        onToggle={() => handleUpdate('header', 'visible', !websiteData.header.visible)}
                    >
                        <div className="space-y-6">
                            <InputField label="Brand Name / Title" value={websiteData.header.title} onChange={e => handleUpdate('header', 'title', e.target.value)} maxLength={25} />
                            
                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Menu Links</h4>
                                <div className="space-y-3">
                                    {Object.entries(websiteData.header.menuItems).map(([key, item]) => (
                                        <SettingToggle 
                                            key={key}
                                            label={`Show "${item.title}" Link`}
                                            isEnabled={item.visible}
                                            onToggle={() => handleMenuItemToggle(key as keyof WebsiteData['header']['menuItems'])}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection 
                        title="Hero Section" 
                        description="The first thing visitors see on your homepage."
                        isVisible={websiteData.hero.visible}
                        onToggle={() => handleUpdate('hero', 'visible', !websiteData.hero.visible)}
                    >
                        <div className="space-y-4">
                            <InputField label="Headline" value={websiteData.hero.headline} onChange={e => handleUpdate('hero', 'headline', e.target.value)} maxLength={40} />
                            <InputField label="Sub-headline" value={websiteData.hero.subheadline} onChange={e => handleUpdate('hero', 'subheadline', e.target.value)} maxLength={80} />
                            <InputField label="Button Text" value={websiteData.hero.ctaText} onChange={e => handleUpdate('hero', 'ctaText', e.target.value)} maxLength={20} />
                            {/* Image Uploader Placeholder */}
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Background Image</label>
                                <div className="mt-1 flex items-center space-x-3 p-2 border rounded-lg bg-white">
                                    <ImageIcon className="w-5 h-5 text-gray-400"/>
                                    <span className="text-sm text-gray-600 truncate">hero-image.jpg</span>
                                    <button className="ml-auto text-sm font-semibold text-blue-600 hover:underline">Change</button>
                                </div>
                            </div>
                        </div>
                    </AccordionSection>

                     <AccordionSection 
                        title="About Us Section" 
                        description="Tell your story and build trust with customers."
                        isVisible={websiteData.about.visible}
                        onToggle={() => handleUpdate('about', 'visible', !websiteData.about.visible)}
                    >
                         <div className="space-y-4">
                            <InputField label="Section Title" value={websiteData.about.title} onChange={e => handleUpdate('about', 'title', e.target.value)} maxLength={40} />
                            {/* Textarea Placeholder */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Content</label>
                                <textarea rows={5} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" defaultValue={websiteData.about.content}></textarea>
                            </div>
                        </div>
                    </AccordionSection>
                    
                    {/* Add accordions for Seller/Professional sections here */}

                </div>
            </div>
        </DashboardLayout>
    );
}
