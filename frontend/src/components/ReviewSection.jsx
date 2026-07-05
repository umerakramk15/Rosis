import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

// ─── ICONS ────────────────────────────────────────────────────────────────────
const StarIcon = ({ filled, size = "sm" }) => {
  const sz = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <svg className={sz} viewBox="0 0 20 20">
      <path
        fill={filled ? "#f59e0b" : "#e5e7eb"}
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"
      />
    </svg>
  );
};

const ThumbUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
);

const ChevronDown = ({ open }) => (
  <svg 
    className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
  </svg>
);

// ─── RATING STARS COMPONENT ───────────────────────────────────────────────────
function RatingStars({ rating, size = "md" }) {
  const sz = size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const diff = (rating || 0) - (i - 1);
        return (
          <svg key={i} className={sz} viewBox="0 0 20 20">
            {diff >= 1 ? (
              <path fill="#f59e0b" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"/>
            ) : diff > 0 ? (
              <>
                <defs>
                  <linearGradient id={`pg-${i}-${rating}`}>
                    <stop offset={`${diff * 100}%`} stopColor="#f59e0b"/>
                    <stop offset={`${diff * 100}%`} stopColor="#e5e7eb"/>
                  </linearGradient>
                </defs>
                <path fill={`url(#pg-${i}-${rating})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"/>
              </>
            ) : (
              <path fill="#e5e7eb" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"/>
            )}
          </svg>
        );
      })}
    </div>
  );
}

// ─── RATING BREAKDOWN BARS ────────────────────────────────────────────────────
function RatingBreakdown({ breakdown, total, activeFilter, onFilterChange }) {
  const percentages = {};
  [5, 4, 3, 2, 1].forEach(star => {
    percentages[star] = total ? Math.round(((breakdown?.[star] || 0) / total) * 100) : 0;
  });
  
  return (
    <div className="space-y-2.5">
      {[5, 4, 3, 2, 1].map(star => {
        const count = breakdown?.[star] || 0;
        const pct = percentages[star];
        const isActive = activeFilter === star;
        
        return (
          <button
            key={star}
            onClick={() => onFilterChange(isActive ? 0 : star)}
            className="w-full flex items-center gap-2.5 group transition-all"
          >
            <div className="flex items-center gap-0.5 flex-shrink-0 w-16">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon key={i} filled={i <= star} size="sm" />
              ))}
            </div>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#f0e4e4" }}>
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${pct}%`, 
                  background: "linear-gradient(90deg, #c9727a, #e8a0a0)"
                }}
              />
            </div>
            <span 
              className="text-xs w-12 text-right font-mono transition-all"
              style={{ 
                color: isActive ? "#c9727a" : "#8a6060",
                fontWeight: isActive ? "600" : "400"
              }}
            >
              {pct}%
            </span>
            <span 
              className="text-xs w-8 text-right transition-all"
              style={{ color: isActive ? "#c9727a" : "#b0a0a0" }}
            >
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── INDIVIDUAL REVIEW CARD ───────────────────────────────────────────────────
function ReviewCard({ review, onHelpful, currentUser }) {
  const [voted, setVoted] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0);
  
  // Check if user already voted
  useEffect(() => {
    if (currentUser && review.helpfulUsers?.includes(currentUser._id)) {
      setVoted(true);
    }
  }, [currentUser, review.helpfulUsers]);
  
  const handleHelpful = async () => {
    if (!currentUser) {
      toast.info("Please login to mark reviews as helpful");
      return;
    }
    if (voted) return;
    
    const result = await onHelpful(review._id);
    if (result.success) {
      setVoted(true);
      setHelpfulCount(prev => prev + 1);
      toast.success("Thanks for your feedback!");
    }
  };
  
  return (
    <div className="bg-white rounded-3xl p-6 transition-all hover:shadow-md" style={{ border: "1.5px solid #f5e0e0" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #c9727a, #e8a0a0)" }}
          >
            {review.userId?.name?.[0]?.toUpperCase() || review.author?.[0]?.toUpperCase() || "U"}
          </div>
          
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm" style={{ color: "#2d1a1a" }}>
                {review.userId?.name || review.author || "Customer"}
              </p>
              {review.verified && (
                <span 
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
                >
                  <CheckIcon /> Verified
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#b0a0a0" }}>
              {new Date(review.createdAt).toLocaleDateString("en-PK", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              })}
            </p>
          </div>
        </div>
        
        <RatingStars rating={review.rating} size="md" />
      </div>
      
      {/* Title */}
      {review.title && (
        <h4 className="font-semibold mb-2" style={{ color: "#2d1a1a", fontSize: "0.95rem" }}>
          {review.title}
        </h4>
      )}
      
      {/* Comment */}
      <p className="text-sm leading-relaxed mb-4" style={{ color: "#5a3d3d", lineHeight: "1.75", fontWeight: 300 }}>
        {review.comment}
      </p>
      
      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {review.size && (
            <span 
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "#fdf0f0", color: "#8b3a4a", border: "1px solid #f5e0e0" }}
            >
              Size: <strong>{review.size}</strong>
            </span>
          )}
          {review.color && (
            <span 
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "#fdf0f0", color: "#8b3a4a", border: "1px solid #f5e0e0" }}
            >
              Colour: <strong>{review.color}</strong>
            </span>
          )}
        </div>
        
        <button 
          onClick={handleHelpful}
          disabled={voted}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
            voted ? "cursor-default" : "hover:opacity-80"
          }`}
          style={{
            background: voted ? "rgba(34,197,94,0.1)" : "#fdf0f0",
            color: voted ? "#22c55e" : "#8b3a4a",
            border: "1px solid",
            borderColor: voted ? "rgba(34,197,94,0.3)" : "#f5e0e0",
          }}
        >
          <ThumbUpIcon />
          {voted ? "Helpful!" : `Helpful (${helpfulCount})`}
        </button>
      </div>
    </div>
  );
}

// ─── WRITE REVIEW FORM ────────────────────────────────────────────────────────
function WriteReviewForm({ productId, onReviewSubmitted, availableSizes, availableColors }) {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to review");
      return;
    }
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Please write your review");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      await api.post(`/products/${productId}/reviews`, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        size: size || undefined,
        color: color || undefined,
      });
      
      toast.success("Review submitted! Thank you for your feedback.");
      setRating(0);
      setTitle("");
      setComment("");
      setSize("");
      setColor("");
      onReviewSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!user || user.role !== "customer") {
    return (
      <div className="bg-white rounded-3xl p-6 text-center" style={{ border: "1.5px solid #f5e0e0" }}>
        <p className="text-sm" style={{ color: "#8a6060" }}>
          <a href="/login" style={{ color: "#c9727a", fontWeight: 600 }}>Sign in</a> to write a review
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-3xl p-6" style={{ border: "1.5px solid #f5e0e0" }}>
      <h3 className="display-font font-semibold mb-4" style={{ color: "#2d1a1a", fontSize: "1rem" }}>
        Write a Review
      </h3>
      
      {/* Rating stars */}
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setRating(s)}
            onMouseEnter={() => setHoverRating(s)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-all hover:scale-110"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.8rem",
              color: s <= (hoverRating || rating) ? "#f59e0b" : "#e5e7eb",
            }}
          >
            ★
          </button>
        ))}
      </div>
      
      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="w-full mb-3 p-3 rounded-xl text-sm"
        style={{
          border: "1.5px solid #f0d0d0",
          fontFamily: "Jost, sans-serif",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "#c9727a"}
        onBlur={(e) => e.target.style.borderColor = "#f0d0d0"}
      />
      
      {/* Comment textarea */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product..."
        rows={4}
        className="w-full mb-3 p-3 rounded-xl text-sm resize-none"
        style={{
          border: "1.5px solid #f0d0d0",
          fontFamily: "Jost, sans-serif",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "#c9727a"}
        onBlur={(e) => e.target.style.borderColor = "#f0d0d0"}
      />
      
      {/* Size and color dropdowns */}
      <div className="flex gap-3 mb-3">
        {availableSizes && availableSizes.length > 0 && (
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="flex-1 p-3 rounded-xl text-sm"
            style={{
              border: "1.5px solid #f0d0d0",
              fontFamily: "Jost, sans-serif",
              outline: "none",
              background: "white",
            }}
          >
            <option value="">Select size (optional)</option>
            {availableSizes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        
        {availableColors && availableColors.length > 0 && (
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1 p-3 rounded-xl text-sm"
            style={{
              border: "1.5px solid #f0d0d0",
              fontFamily: "Jost, sans-serif",
              outline: "none",
              background: "white",
            }}
          >
            <option value="">Select colour (optional)</option>
            {availableColors.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>
      
      {error && (
        <p className="text-sm mb-3" style={{ color: "#c9727a" }}>{error}</p>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50"
        style={{
          background: submitting ? "#e8a0a0" : "linear-gradient(135deg, #c9727a, #e8a0a0)",
          cursor: submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}

// ─── MAIN REVIEW SECTION ──────────────────────────────────────────────────────
export default function ReviewSection({ productId, ratings: initialRatings, availableSizes, availableColors }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [showAll, setShowAll] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRating > 0) params.append("rating", filterRating);
      params.append("sortBy", sortBy);
      params.append("limit", showAll ? 50 : 5);
      
      const res = await api.get(`/products/${productId}/reviews?${params}`);
      setReviews(res.data.data.reviews || []);
      setTotal(res.data.data.total || 0);
      setRatingBreakdown(res.data.data.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId, filterRating, sortBy, showAll]);
  
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);
  
  const handleHelpful = async (reviewId) => {
    try {
      await api.post(`/products/${productId}/reviews/${reviewId}/helpful`);
      return { success: true };
    } catch {
      toast.error("Failed to mark as helpful");
      return { success: false };
    }
  };
  
  const handleReviewSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);
  const hasMore = !showAll && total > 3;
  
  return (
    <div>
      {/* Rating Summary with Breakdown Bars */}
      <div className="grid md:grid-cols-5 gap-8 mb-10">
        {/* Left - Summary Card */}
        <div className="md:col-span-2">
          <div 
            className="rounded-3xl p-8 text-center"
            style={{ background: "linear-gradient(135deg, #fde8e8, #fdf0f8)", border: "1.5px solid #f5d0d0" }}
          >
            <p className="display-font font-bold mb-1" style={{ fontSize: "4rem", color: "#2d1a1a", lineHeight: 1 }}>
              {initialRatings?.average?.toFixed(1) || "0.0"}
            </p>
            <RatingStars rating={initialRatings?.average || 0} size="lg" />
            <p className="text-sm mt-2" style={{ color: "#8a6060" }}>
              Based on {initialRatings?.count || 0} reviews
            </p>
            
            <div className="mt-6">
              <RatingBreakdown 
                breakdown={ratingBreakdown}
                total={total}
                activeFilter={filterRating}
                onFilterChange={setFilterRating}
              />
            </div>
            
            {filterRating > 0 && (
              <button
                onClick={() => setFilterRating(0)}
                className="mt-4 w-full py-2 rounded-2xl text-xs font-medium transition-all hover:opacity-80"
                style={{ background: "#fde8e8", color: "#c9727a", border: "1px solid #f5d0d0" }}
              >
                × Clear filter ({filterRating} ★ only)
              </button>
            )}
          </div>
        </div>
        
        {/* Right - Sort Controls */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <p className="text-sm" style={{ color: "#8a6060" }}>
              {filterRating > 0 
                ? `Showing ${total} reviews for ${filterRating} ★` 
                : `${total} reviews`}
            </p>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm"
                style={{
                  border: "1.5px solid #f0d0d0",
                  background: "white",
                  color: "#2d1a1a",
                  fontFamily: "Jost, sans-serif",
                  outline: "none",
                }}
              >
                <option value="newest">Newest First</option>
                <option value="helpful">Most Helpful</option>
                <option value="rating">Highest Rated</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#c9727a" }}>
                <ChevronDown open={false} />
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4 mb-8">
        {loading ? (
          <div className="text-center py-8">
            <p style={{ color: "#8a6060" }}>Loading reviews...</p>
          </div>
        ) : visibleReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-2" style={{ color: "#8a6060" }}>No reviews yet</p>
            <p className="text-sm" style={{ color: "#b0a0a0" }}>Be the first to review this product!</p>
          </div>
        ) : (
          visibleReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onHelpful={handleHelpful}
              currentUser={user}
            />
          ))
        )}
      </div>
      
      {/* Show More Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-80 mb-8"
          style={{
            background: "white",
            border: "1.5px solid #f0d0d0",
            color: "#c9727a",
          }}
        >
          Show all {total} reviews ↓
        </button>
      )}
      
      {/* Write Review Form */}
      <WriteReviewForm 
        productId={productId}
        onReviewSubmitted={handleReviewSubmitted}
        availableSizes={availableSizes}
        availableColors={availableColors}
      />
    </div>
  );
}