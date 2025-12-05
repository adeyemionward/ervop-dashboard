import { WebsiteData, FaqItem } from '@/types/WebsiteTypes';

type NestedObject = Record<string, unknown>;

/** Recursively searches for the first object that has `question` and `answer` */
const findDeepestFaq = (obj: NestedObject): { question: Record<string, string>; answer: Record<string, string> } | null => {
  if (!obj || typeof obj !== 'object') return null;

  if ('question' in obj && 'answer' in obj) {
    const question = obj.question;
    const answer = obj.answer;

    if (
      question && typeof question === 'object' &&
      answer && typeof answer === 'object'
    ) {
      return { question: question as Record<string, string>, answer: answer as Record<string, string> };
    }
  }

  for (const key in obj) {
    const value = obj[key];
    if (value && typeof value === 'object') {
      const found = findDeepestFaq(value as NestedObject);
      if (found) return found;
    }
  }

  return null;
};

/** Normalizes API FAQ data into WebsiteData['faq'] */
export const normalizeFaqData = (apiFaq: NestedObject): WebsiteData['faq'] => {
  const faqSection = findDeepestFaq(apiFaq);

  if (!faqSection) return { visible: false, items: [] };

  const items: FaqItem[] = Object.keys(faqSection.question).map((key) => ({
    question: faqSection.question[key] ?? '',
    answer: faqSection.answer[key] ?? '',
  }));

  return { visible: true, items };
};
