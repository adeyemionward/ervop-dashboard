import { WebsiteData, TeamMember } from '@/types/WebsiteTypes';

type NestedObject = Record<string, unknown>;

const cleanText = (value: unknown): string =>
  typeof value === 'string' ? value.replace(/\*\*/g, '').trim() : '';

const findDeepestKey = (obj: NestedObject, keys: string[]): unknown => {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of keys) if (key in obj) return obj[key];
  for (const key in obj) {
    const value = obj[key];
    if (value && typeof value === 'object') {
      const found = findDeepestKey(value as NestedObject, keys);
      if (found !== null) return found;
    }
  }
  return null;
};

export const normalizeAboutData = (apiAbout: NestedObject): WebsiteData['about'] => ({
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
  team: Array.isArray(apiAbout?.team)
    ? (apiAbout.team as TeamMember[])
    : [],
  metaTitle: cleanText(findDeepestKey(apiAbout, ['meta_title']) ?? ''),
  metaDescription: cleanText(findDeepestKey(apiAbout, ['meta_description']) ?? ''),
  metaKeywords: cleanText(findDeepestKey(apiAbout, ['meta_keywords']) ?? ''),
});
