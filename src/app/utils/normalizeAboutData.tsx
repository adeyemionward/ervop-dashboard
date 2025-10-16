
  import { WebsiteData } from '@/types/WebsiteTypes';

  const cleanText = (value: any): string => {
  if (typeof value !== 'string') return '';
  // Remove any unwanted characters, e.g., **, extra whitespace
  return value.replace(/\*\*/g, '').trim();
};
const findDeepestKey = (obj: any, targetKeys: string[]): any => {
  if (!obj || typeof obj !== 'object') return null;

  for (const key of targetKeys) {
    if (obj[key] !== undefined) return obj[key];
  }

  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      const found = findDeepestKey(obj[key], targetKeys);
      if (found !== null) return found;
    }
  }

  return null;
};


  export const normalizeAboutData = (apiAbout: any): WebsiteData['about'] => ({
  visible: true,
  storyVisible: true,
  teamVisible: true,
  missionVisionVisible: true,
  heroHeadline: cleanText(findDeepestKey(apiAbout, ['**headline', 'headline']) ?? ''),
  heroSubheadline: cleanText(findDeepestKey(apiAbout, ['**subheadline', 'subheadline']) ?? ''),
  storyHeadline: cleanText(findDeepestKey(apiAbout, ['storyHeadline', 'headline']) ?? ''),
  storyDescription: cleanText(findDeepestKey(apiAbout, ['about_us', 'storyDescription']) ?? ''),
  yoe: cleanText(findDeepestKey(apiAbout, ['yoe']) ?? ''),
  customersServed: cleanText(findDeepestKey(apiAbout, ['customers_served']) ?? ''),
  mission: cleanText(findDeepestKey(apiAbout, ['mission']) ?? ''),
  vision: cleanText(findDeepestKey(apiAbout, ['vision']) ?? ''),
  team: Array.isArray(apiAbout?.team) ? apiAbout.team : [],
  metaTitle: cleanText(findDeepestKey(apiAbout, ['meta_title']) ?? ''),
  metaDescription: cleanText(findDeepestKey(apiAbout, ['meta_description']) ?? ''),
});

