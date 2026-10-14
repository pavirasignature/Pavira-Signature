"use client";

import { Star, ShieldCheck, CheckCircle2 } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Aarav S.",
    rating: 5,
    date: "2 weeks ago",
    title: "Exquisite craftsmanship and finish",
    comment:
      "The weight and texture of this piece surpassed expectations. It anchors our living room console with quiet luxury. Packaged immaculately with care certificate.",
    verified: true,
  },
  {
    id: "rev-2",
    author: "Meera K.",
    rating: 5,
    date: "1 month ago",
    title: "Subtle elegance, museum-worthy",
    comment:
      "The brass detailing has an authentic warm sheen that catches ambient afternoon light beautifully. Truly exceptional quality.",
    verified: true,
  },
  {
    id: "rev-3",
    author: "Vikramaditya P.",
    rating: 5,
    date: "2 months ago",
    title: "Worth every rupee",
    comment:
      "Arrived within 3 business days via insured express transit. The fit, balance, and artisanal character speak for themselves.",
    verified: true,
  },
];

export default function ProductReviews() {
  return (
    <section className="mt-20 border-t border-[#1A1A1A]/10 pt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-8 border-b border-[#1A1A1A]/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">
            Verified Experiences
          </span>
          <h2 className="text-2xl md:text-3xl font-brand text-[#1A1A1A]">
            Client Testimonials & Ratings
          </h2>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0 bg-[#F4F1EA] px-6 py-4 rounded-xl">
          <div className="text-3xl font-brand text-[#1A1A1A]">4.9</div>
          <div>
            <div className="flex items-center gap-1 text-[#D4AF37]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={15} fill="#D4AF37" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground block mt-1">
              Based on 28 verified collector reviews
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEFAULT_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-[#1A1A1A]/10 p-6 rounded-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={13} fill="#D4AF37" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">
                {review.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#1A1A1A]/5 text-xs">
              <span className="font-medium text-[#1A1A1A]">{review.author}</span>
              {review.verified && (
                <span className="inline-flex items-center gap-1 text-[#0C3A2E] bg-[#0C3A2E]/5 px-2 py-0.5 rounded text-[10px] font-semibold">
                  <CheckCircle2 size={10} />
                  <span>Verified Purchase</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
