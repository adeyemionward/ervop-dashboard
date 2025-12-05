import { WebsiteData } from '@/types/WebsiteTypes';

// Helper to clean text
const cleanText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\*\*/g, '').trim();
};

// Define a type for the raw API response if possible
interface RawReview {
  customer_name?: Record<string, string>;
  comment?: Record<string, string>;
  star_rating?: Record<string, string | number>;
}

interface ApiReviews {
  customer_reviews?: {
    reviews?: RawReview;
  };
}

export const normalizeReviewsData = (apiReviews: ApiReviews | undefined): WebsiteData['reviews'] => {
  const reviewsRaw = apiReviews?.customer_reviews?.reviews;

  if (!reviewsRaw) {
    return {
      visible: true,
      items: [],
    };
  }

  const names = reviewsRaw.customer_name ?? {};
  const comments = reviewsRaw.comment ?? {};
  const ratings = reviewsRaw.star_rating ?? {};

  const items = Object.keys(names).map((key) => ({
    customer_name: cleanText(names[key]),
    comment: cleanText(comments[key]),
    star_rating: parseInt(String(ratings[key] ?? 5), 10),
  }));

  return {
    visible: true,
    items,
  };
};
