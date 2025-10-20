'use client';

import React from 'react';
import { AccordionSection, InputField, ToggleSwitch } from '@/components/customization/pages/shared';
import { PlusCircle, Trash2, Star } from 'lucide-react';
import { WebsiteData, ReviewItem } from '@/types/WebsiteTypes';

type Props = {
  data: WebsiteData['reviews'];
  onUpdate: (section: keyof WebsiteData, path: string[], value: unknown) => void;
};

const ReviewsSection: React.FC<Props> = ({ data, onUpdate }) => {
  const reviews = data?.items ?? [];

  /** Toggle Reviews section visibility */
  const toggleReviewsSection = () => {
    onUpdate('reviews', ['visible'], !(data.visible ?? true));
  };

  /** Add a new review */
  const addReview = () => {
    if (reviews.length >= 10) return;
    const newReview: ReviewItem = {
      customer_name: '',
      comment: '',
      star_rating: 5,
    };
    onUpdate('reviews', ['items'], [...reviews, newReview]);
  };

  /** Delete a review */
  const deleteReview = (index: number) => {
    const updated = [...reviews];
    updated.splice(index, 1);
    onUpdate('reviews', ['items'], updated);
  };

  /** Update review field */
  const updateReview = <K extends keyof ReviewItem>(
  index: number,
  field: K,
  value: ReviewItem[K]
) => {
  const updated = [...reviews];
  if (updated[index]) {
    updated[index][field] = value;
    onUpdate('reviews', ['items'], updated);
  }
};


  return (
    <AccordionSection
      title="Customer Reviews Section"
      description="Manage customer testimonials shown on your website."
      isVisible={data?.visible ?? true}
      onToggle={toggleReviewsSection}
    >
      <div className="space-y-4">
        {/* Toggle visibility */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Show Customer Reviews Section</h3>
          <ToggleSwitch isVisible={data.visible ?? true} onToggle={toggleReviewsSection} />
        </div>

        {(data.visible ?? true) && (
          <>
            {reviews.map((review, index) => (
              <div key={index} className="border rounded-lg p-4 relative bg-white">
                {/* Delete button */}
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => deleteReview(index)}
                >
                  <Trash2 size={16} />
                </button>

                {/* Customer name */}
                <InputField
                  label="Customer Name"
                  value={review.customer_name ?? ''}
                  onChange={(e) => updateReview(index, 'customer_name', e.target.value)}
                  placeholder="Enter customer name"
                />

                {/* Comment */}
                <InputField
                  label="Comment / Testimonial"
                  value={review.comment ?? ''}
                  onChange={(e) => updateReview(index, 'comment', e.target.value)}
                  placeholder="Enter the customer's feedback"
                  textarea
                />

                {/* Star Rating */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateReview(index, 'star_rating', star)}
                        className={`text-xl transition ${
                          star <= (review.star_rating ?? 5)
                            ? 'text-yellow-500'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        <Star fill={star <= (review.star_rating ?? 5) ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Add new review button */}
            {reviews.length < 10 && (
              <button
                onClick={addReview}
                className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline mt-2"
              >
                <PlusCircle size={20} /> Add Customer Review
              </button>
            )}
          </>
        )}
      </div>
    </AccordionSection>
  );
};

export default ReviewsSection;
