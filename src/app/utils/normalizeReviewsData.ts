import { WebsiteData } from '@/types/WebsiteTypes';

const cleanText = (value: any): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\*\*/g, '').trim();
};

export const normalizeReviewsData = (apiReviews: any): WebsiteData['reviews'] => {
  const reviewsRaw = apiReviews?.customer_reviews?.reviews?.customer_reviews;

  if (!reviewsRaw) {
    return {
      visible: true,
      items: [],
    };
  }

  const names = reviewsRaw.customer_name || {};
  const comments = reviewsRaw.comment || {};
  const ratings = reviewsRaw.star_rating || {};

  const items = Object.keys(names).map((key) => ({
    customer_name: cleanText(names[key] ?? ''),
    comment: cleanText(comments[key] ?? ''),
    star_rating: parseInt(ratings[key] ?? '5', 10),
  }));

  return {
    visible: true,
    items,
  };
};
