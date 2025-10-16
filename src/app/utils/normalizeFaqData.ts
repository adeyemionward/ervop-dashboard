import { WebsiteData, FaqItem } from '@/types/WebsiteTypes';

const findDeepestFaq = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return null;
  if (obj.question && obj.answer) return obj; // found deepest
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      const found = findDeepestFaq(obj[key]);
      if (found) return found;
    }
  }
  return null;
};

export const normalizeFaqData = (apiFaq: any): WebsiteData['faq'] => {
  const faqSection = findDeepestFaq(apiFaq);
  if (!faqSection) return { visible: false, items: [] };

  const questions = faqSection.question ?? {};
  const answers = faqSection.answer ?? {};

  const items: FaqItem[] = Object.keys(questions).map((key) => ({
    question: questions[key] ?? '',
    answer: answers[key] ?? '',
  }));

  return { visible: true, items };
};

