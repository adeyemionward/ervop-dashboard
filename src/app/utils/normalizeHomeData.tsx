// utils/normalizeHomeData.ts
import { WebsiteData } from '@/types/WebsiteTypes';

type NestedObject = Record<string, unknown>;

/** Safely cleans a string: removes '**' and trims whitespace */
const cleanText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\*\*/g, '').trim();
};

/** Safely gets a nested property from an object */
const getNested = (
  obj: NestedObject | undefined,
  path: (string | number)[],
  defaultValue: unknown = ''
): unknown => {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as NestedObject)[key];
    }
    return null;
  }, obj) ?? defaultValue;
};


/** Normalizes API home data into WebsiteData['home'] */
export const normalizeHomeData = (apiHome: NestedObject): WebsiteData['home'] => ({
  visible: true,
  hero: {
    visible: true,
    tagline: cleanText(getNested(apiHome, ['hero', 'home', 'hero', 'tagline'])),
    headline: cleanText(getNested(apiHome, ['hero', 'home', 'hero', 'headline'])),
    subheadline: cleanText(getNested(apiHome, ['hero', 'home', 'hero', 'subheadline'])),
    ctaText: cleanText(getNested(apiHome, ['hero', 'home', 'hero', 'ctaText'])),
    ctaText2: cleanText(getNested(apiHome, ['hero', 'home', 'hero', 'ctaText2'])),
    images: Object.values(
      getNested(apiHome, ['hero', 'home', 'hero', 'image'], {}) as NestedObject
    ).map((img) => cleanText((img as NestedObject)?.description)),
  },
  processes: {
    visible: true,
    title: cleanText(getNested(apiHome, ['process', 'home', 'process', 'section_title'])),
    steps: Object.keys(
      getNested(apiHome, ['process', 'home', 'process', 'title'], {}) as NestedObject
    ).map((key) => ({
      title: cleanText(getNested(apiHome, ['process', 'home', 'process', 'title', key])),
      description: cleanText(getNested(apiHome, ['process', 'home', 'process', 'description', key])),
    })),
  },
  whyUs: {
    visible: true,
    title: cleanText(getNested(apiHome, ['why_choose_us', 'home', 'why_choose_us', 'section_title'])),
    points: Object.keys(
      getNested(apiHome, ['why_choose_us', 'home', 'why_choose_us', 'title'], {}) as NestedObject
    ).map((key) => ({
      title: cleanText(getNested(apiHome, ['why_choose_us', 'home', 'why_choose_us', 'title', key])),
      description: cleanText(getNested(apiHome, ['why_choose_us', 'home', 'why_choose_us', 'description', key])),
    })),
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
