"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  status: string;
  created_at: string;
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // ==========================================
  // FETCH REVIEWS
  // ==========================================

  const fetchReviews = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*");

      if (error) {
        console.error("REVIEWS ERROR:", error);

        setMessage(
          `Unable to load reviews: ${error.message || "Unknown error"}`
        );

        setLoading(false);
        return;
      }

      setReviews((data || []) as Review[]);
      setLoading(false);
    } catch (err) {
      console.error("UNEXPECTED REVIEWS ERROR:", err);

      setMessage("Something went wrong while loading reviews.");
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD REVIEWS
  // ==========================================

  useEffect(() => {
    fetchReviews();
  }, []);

  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");

    if (!customerName.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!reviewText.trim()) {
      setMessage("Please write a review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setMessage("Please select a rating.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("reviews")
        .insert([
          {
            customer_name: customerName.trim(),
            rating: rating,
            review_text: reviewText.trim(),
            status: "pending",
          },
        ]);

      if (error) {
        console.error("SUBMIT REVIEW ERROR:", error);

        setMessage(
          `Unable to submit review: ${
            error.message || "Unknown error"
          }`
        );

        setSubmitting(false);
        return;
      }

      setCustomerName("");
      setRating(5);
      setReviewText("");

      setMessage(
        "Thank you! ❤️ Your review has been submitted and is waiting for approval."
      );

      setSubmitting(false);

      await fetchReviews();
    } catch (err) {
      console.error("UNEXPECTED SUBMIT ERROR:", err);

      setMessage(
        "Something went wrong while submitting your review."
      );

      setSubmitting(false);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date: string) => {
    if (!date) return "";

    const formattedDate = new Date(date);

    if (isNaN(formattedDate.getTime())) {
      return "";
    }

    return formattedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="border-y border-[#171717] bg-[#050505] px-4 py-10 sm:px-6 md:py-12">
      <div className="mx-auto max-w-7xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-7 text-center">

          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00FF7F] shadow-[0_0_10px_#00FF7F]" />

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00FF7F]">
              Customer Reviews
            </p>

            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD600] shadow-[0_0_10px_#FFD600]" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            What Our Customers Say{" "}
            <span className="text-[#FF6F00]">❤️</span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#999] sm:text-base">
            Fresh juices, delicious food and happy customers.
            See what people are saying about Anil&apos;s Juice Station.
          </p>

        </div>


        {/* ==========================================
            MESSAGE
        ========================================== */}

        {message && !showForm && (
          <div className="mx-auto mb-5 max-w-xl rounded-xl border border-[#3a2500] bg-[#171006] px-4 py-3 text-center text-sm font-medium text-[#FFD600]">
            {message}
          </div>
        )}


        {/* ==========================================
            LOADING
        ========================================== */}

        {loading ? (
          <div className="py-7 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#222] border-t-[#FF6F00]" />

            <p className="mt-3 text-sm text-[#777]">
              Loading reviews...
            </p>

          </div>
        ) : reviews.length === 0 ? (

          /* ==========================================
             NO REVIEWS
          ========================================== */

          <div className="mx-auto max-w-md rounded-2xl border border-[#242424] bg-[#111] p-6 text-center">

            <div className="mb-3 text-4xl">
              🍊
            </div>

            <h3 className="text-lg font-bold text-white">
              No reviews yet
            </h3>

            <p className="mt-1 text-sm text-[#888]">
              Be the first customer to share your experience!
            </p>

          </div>

        ) : (

          /* ==========================================
             REVIEWS
          ========================================== */

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {reviews.map((review, index) => {

              const accent =
                index % 3 === 0
                  ? "#FF6F00"
                  : index % 3 === 1
                  ? "#FFD600"
                  : "#00FF7F";

              return (
                <div
                  key={review.id}
                  className="group rounded-2xl border border-[#242424] bg-[#111] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#FF6F00] hover:shadow-[0_0_25px_rgba(255,111,0,0.1)]"
                >

                  {/* TOP */}

                  <div className="flex items-center justify-between">

                    {/* STARS */}

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${
                            star <= review.rating
                              ? "text-[#FFD600]"
                              : "text-[#444]"
                          }`}
                        >
                          {star <= review.rating
                            ? "★"
                            : "☆"}
                        </span>
                      ))}
                    </div>

                    {/* SMALL ACCENT */}

                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: accent,
                        boxShadow: `0 0 8px ${accent}`,
                      }}
                    />

                  </div>


                  {/* REVIEW */}

                  <p className="mt-3 min-h-[66px] text-sm leading-6 text-[#BDBDBD]">
                    &quot;{review.review_text}&quot;
                  </p>


                  {/* CUSTOMER */}

                  <div className="mt-4 flex items-center justify-between border-t border-[#242424] pt-3">

                    <div className="flex items-center gap-2">

                      {/* INITIAL */}

                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-black"
                        style={{
                          backgroundColor: accent,
                        }}
                      >
                        {review.customer_name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <p className="text-sm font-bold text-white">
                          {review.customer_name}
                        </p>

                        <p className="text-[10px] text-[#666]">
                          Happy Customer
                        </p>

                      </div>

                    </div>


                    {/* DATE */}

                    <p className="text-[10px] text-[#666]">
                      {formatDate(review.created_at)}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

        )}


        {/* ==========================================
            WRITE REVIEW BUTTON
        ========================================== */}

        <div className="mt-7 text-center">

          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setMessage("");
            }}
            className="rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-6 py-2.5 text-sm font-extrabold text-black shadow-[0_0_18px_rgba(255,111,0,0.15)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(255,111,0,0.3)]"
          >
            {showForm
              ? "Close Review Form"
              : "⭐ Write a Review"}
          </button>

        </div>


        {/* ==========================================
            REVIEW FORM
        ========================================== */}

        {showForm && (

          <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-[#242424] bg-[#111] p-5 shadow-[0_0_30px_rgba(255,111,0,0.06)] sm:p-6">

            {/* FORM HEADING */}

            <div className="mb-5 text-center">

              <div className="mb-2 text-3xl">
                🍊
              </div>

              <h3 className="text-xl font-extrabold text-white">
                Share Your Experience
              </h3>

              <p className="mt-1 text-sm text-[#777]">
                Tell us how you enjoyed your food or juice!
              </p>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* NAME */}

              <div>

                <label
                  htmlFor="customer_name"
                  className="mb-1.5 block text-sm font-bold text-[#DDD]"
                >
                  Your Name
                </label>

                <input
                  id="customer_name"
                  type="text"
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(e.target.value)
                  }
                  placeholder="Enter your name"
                  maxLength={100}
                  className="w-full rounded-xl border border-[#2d2d2d] bg-[#080808] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/10"
                />

              </div>


              {/* RATING */}

              <div>

                <label className="mb-1.5 block text-sm font-bold text-[#DDD]">
                  Your Rating
                </label>

                <div className="flex items-center gap-1">

                  {[1, 2, 3, 4, 5].map((star) => (

                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} stars`}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        star <= rating
                          ? "text-[#FFD600]"
                          : "text-[#444]"
                      }`}
                    >
                      {star <= rating
                        ? "★"
                        : "☆"}
                    </button>

                  ))}

                  <span className="ml-2 text-xs font-semibold text-[#888]">
                    {rating}/5
                  </span>

                </div>

              </div>


              {/* REVIEW */}

              <div>

                <label
                  htmlFor="review_text"
                  className="mb-1.5 block text-sm font-bold text-[#DDD]"
                >
                  Your Review
                </label>

                <textarea
                  id="review_text"
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(e.target.value)
                  }
                  placeholder="Tell us about your experience..."
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-[#2d2d2d] bg-[#080808] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/10"
                />

                <p className="mt-1 text-right text-[10px] text-[#555]">
                  {reviewText.length}/500
                </p>

              </div>


              {/* FORM MESSAGE */}

              {message && (
                <div className="rounded-xl border border-[#3a2500] bg-[#171006] p-3 text-sm font-medium text-[#FFD600]">
                  {message}
                </div>
              )}


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-[#FF6F00] to-[#FFD600] py-3 text-sm font-extrabold text-black transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(255,111,0,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting Review..."
                  : "Submit Review ❤️"}
              </button>


              <p className="text-center text-[10px] text-[#555]">
                Your review will be checked before appearing
                publicly.
              </p>

            </form>

          </div>

        )}

      </div>
    </section>
  );
}