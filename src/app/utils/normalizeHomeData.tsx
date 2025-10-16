// File: /utils/normalizeHomeData.ts
import { WebsiteData } from '@/types/WebsiteTypes';

const cleanText = (value: any): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\*\*/g, '').trim();
};

// Helper to safely get nested keys
const getNested = (obj: any, path: (string | number)[], defaultValue: any = ''): any => {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj) ?? defaultValue;
};

export const normalizeHomeData = (apiHome: any): WebsiteData['home'] => ({
  visible: true,
  hero: {
    visible: true,
    tagline: cleanText(getNested(apiHome, ['hero', 'home', 'hero', 'tagline'])),
    headline: cleanText(getNested(apiHome, ['hero', 'home', 'hero', 'headline'])),
    subheadline: cleanText(getNested(apiHome, ['hero', 'home', 'hero', 'subheadline'])),
    ctaText: cleanText(getNested(apiHome, ['hero', 'home', 'hero', 'ctaText'])),
    ctaText2: cleanText(getNested(apiHome, ['hero', 'home', 'hero', 'ctaText2'])),
    images: Object.values(getNested(apiHome, ['hero', 'home', 'hero', 'image'], {})).map(
      (img: any) => cleanText(img.description)
    ),
  },
  processes: {
    visible: true,
    title: cleanText(getNested(apiHome, ['process', 'home', 'process', 'section_title'])),
    steps: Object.keys(getNested(apiHome, ['process', 'home', 'process', 'title'], {})).map((key) => ({
      title: cleanText(getNested(apiHome, ['process', 'home', 'process', 'title', key])),
      description: cleanText(getNested(apiHome, ['process', 'home', 'process', 'description', key])),
    })),
  },
  whyUs: {
    visible: true,
    title: cleanText(getNested(apiHome, ['why_choose_us', 'home', 'why_choose_us', 'section_title'])),
    points: Object.keys(getNested(apiHome, ['why_choose_us', 'home', 'why_choose_us', 'title'], {})).map(
      (key) => ({
        title: cleanText(getNested(apiHome, ['why_choose_us', 'home', 'why_choose_us', 'title', key])),
        description: cleanText(getNested(apiHome, ['why_choose_us', 'home', 'why_choose_us', 'description', key])),
      })
    ),
  },
  services: {
    visible: true,
    title: cleanText(getNested(apiHome, ['services', 'title'])),
    summary: cleanText(getNested(apiHome, ['services', 'summary'])),
  },
  about: {
    visible: true,
    title: cleanText(getNested(apiHome, ['about', 'title'])),
    summary: cleanText(getNested(apiHome, ['about', 'summary'])),
  },
});
