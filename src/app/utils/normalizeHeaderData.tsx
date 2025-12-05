// utils/normalizeHeaderData.ts
import { WebsiteData, MenuItem } from '@/types/WebsiteTypes';

type NestedObject = Record<string, unknown>;

const cleanText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\*\*/g, '').trim();
};

export const normalizeHeaderData = (apiHeader: NestedObject): WebsiteData['header'] => {
  const menu = apiHeader?.menuItems as NestedObject | undefined;

  const buildMenuItem = (key: string, defaultTitle: string, visible = true): MenuItem => {
    const menuItem = menu?.[key] as Record<string, unknown> | undefined;
    return {
      title: cleanText(menuItem?.title ?? defaultTitle),
      visible,
    };
  };

  return {
    visible: true,
    title: cleanText(apiHeader?.['title'] ?? 'My Brand'),
    logo: cleanText(apiHeader?.['logo'] ?? ''),
    menuItems: {
      home: buildMenuItem('home', 'Home'),
      about: buildMenuItem('about', 'About'),
      faq: buildMenuItem('faq', 'FAQ', false),
      shop: buildMenuItem('shop', 'Appointment'),
      services: buildMenuItem('services', 'Services'),
      portfolio: buildMenuItem('portfolio', 'Portfolio', false),
      contact: buildMenuItem('contact', 'Contact'),
    },
  };
};
