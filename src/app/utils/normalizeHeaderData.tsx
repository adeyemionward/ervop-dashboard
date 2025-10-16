// utils/normalizeHeaderData.ts
import { WebsiteData } from '@/types/WebsiteTypes';

const cleanText = (value: any): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\*\*/g, '').trim();
};

export const normalizeHeaderData = (apiHeader: any): WebsiteData['header'] => {
  return {
    visible: true,
    title: cleanText(apiHeader?.title ?? 'My Brand'),
    logo: apiHeader?.logo ?? '',
    menuItems: {
      home: { title: cleanText(apiHeader?.menuItems?.home?.title ?? 'Home'), visible: true },
      about: { title: cleanText(apiHeader?.menuItems?.about?.title ?? 'About'), visible: true },
      faq: { title: cleanText(apiHeader?.menuItems?.faq?.title ?? 'FAQ'), visible: false },
      shop: { title: cleanText(apiHeader?.menuItems?.shop?.title ?? 'Appointment'), visible: true },
      services: { title: cleanText(apiHeader?.menuItems?.services?.title ?? 'Services'), visible: true },
      portfolio: { title: cleanText(apiHeader?.menuItems?.portfolio?.title ?? 'Portfolio'), visible: false },
      contact: { title: cleanText(apiHeader?.menuItems?.contact?.title ?? 'Contact'), visible: true },
    },
  };
};
