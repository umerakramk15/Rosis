import { useState, useEffect } from 'react';

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

// ─── RATING STARS DISPLAY ─────────────────────────────────────────────────────
function RatingStarsDisplay({ rating, size = "md", showNumber = false }) {
  const sz = size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3 h-3" : "w-4 h-4";
  
  return (
    <div className="flex items-center gap-1">
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
                    <linearGradient id={`br-${i}-${rating}`}>
                      <stop offset={`${diff * 100}%`} stopColor="#f59e0b"/>
                      <stop offset={`${diff * 100}%`} stopColor="#e5e7eb"/>
                    </linearGradient>
                  </defs>
                  <path fill={`url(#br-${i}-${rating})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"/>
                </>
              ) : (
                <path fill="#e5e7eb" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.436c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"/>
              )}
            </svg>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-semibold ml-1" style={{ color: "#c9727a" }}>
          {rating?.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ─── RATING BREAKDOWN BARS ────────────────────────────────────────────────────
function RatingBreakdownBars({ breakdown, total, activeFilter, onFilterChange, animate = true }) {
  const [animatedWidths, setAnimatedWidths] = useState({});
  
  // Calculate percentages
  const percentages = {};
  [5, 4, 3, 2, 1].forEach(star => {
    percentages[star] = total ? Math.round(((breakdown?.[star] || 0) / total) * 100) : 0;
  });
  
  // Animate bars on mount
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimatedWidths(percentages);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedWidths(percentages);
    }
  }, [breakdown, total, animate]);
  
  const stars = [
    { value: 5, label: "5 stars" },
    { value: 4, label: "4 stars" },
    { value: 3, label: "3 stars" },
    { value: 2, label: "2 stars" },
    { value: 1, label: "1 star" },
  ];
  
  return (
    <div className="space-y-3">
      {stars.map(({ value, label }) => {
        const count = breakdown?.[value] || 0;
        const pct = percentages[value];
        const isActive = activeFilter === value;
        const currentWidth = animatedWidths[value] !== undefined ? animatedWidths[value] : 0;
        
        return (
          <button
            key={value}
            onClick={() => onFilterChange?.(isActive ? 0 : value)}
            className="w-full group transition-all"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-1 w-20 flex-shrink-0">
                <span className="text-sm font-medium" style={{ color: "#8a6060" }}>
                  {label}
                </span>
              </div>
              
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#f0e4e4" }}>
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${currentWidth}%`, 
                    background: "linear-gradient(90deg, #c9727a, #e8a0a0)"
                  }}
                />
              </div>
              
              <div className="w-12 text-right flex-shrink-0">
                <span 
                  className="text-xs font-mono transition-all"
                  style={{ 
                    color: isActive ? "#c9727a" : "#8a6060",
                    fontWeight: isActive ? "600" : "400"
                  }}
                >
                  {pct}%
                </span>
              </div>
              
              <div className="w-10 text-right flex-shrink-0">
                <span 
                  className="text-xs transition-all"
                  style={{ color: isActive ? "#c9727a" : "#b0a0a0" }}
                >
                  ({count})
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── SUMMARY CARD ─────────────────────────────────────────────────────────────
function RatingSummaryCard({ average, total, ratingDistribution, onFilterChange, activeFilter }) {
  return (
    <div 
      className="rounded-3xl p-8 text-center"
      style={{ background: "linear-gradient(135deg, #fde8e8, #fdf0f8)", border: "1.5px solid #f5d0d0" }}
    >
      {/* Average Rating */}
      <p className="display-font font-bold mb-1" style={{ fontSize: "4rem", color: "#2d1a1a", lineHeight: 1 }}>
        {average?.toFixed(1) || "0.0"}
      </p>
      
      <RatingStarsDisplay rating={average} size="lg" showNumber={false} />
      
      <p className="text-sm mt-2" style={{ color: "#8a6060" }}>
        Based on {total} reviews
      </p>
      
      {/* Breakdown Bars */}
      <div className="mt-6">
        <RatingBreakdownBars 
          breakdown={ratingDistribution}
          total={total}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />
      </div>
      
      {/* Clear Filter Button */}
      {activeFilter > 0 && (
        <button
          onClick={() => onFilterChange?.(0)}
          className="mt-4 w-full py-2 rounded-2xl text-xs font-medium transition-all hover:opacity-80"
          style={{ background: "#fde8e8", color: "#c9727a", border: "1px solid #f5d0d0" }}
        >
          × Clear filter ({activeFilter} ★ only)
        </button>
      )}
    </div>
  );
}

// ─── DISTRIBUTION CHART (Bar Chart Style) ─────────────────────────────────────
function RatingDistributionChart({ breakdown, total, className }) {
  const maxCount = Math.max(...[5,4,3,2,1].map(s => breakdown?.[s] || 0), 1);
  
  return (
    <div className={className}>
      <p className="text-xs font-semibold mb-3" style={{ color: "#8a6060", letterSpacing: "0.08em" }}>
        RATING DISTRIBUTION
      </p>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(star => {
          const count = breakdown?.[star] || 0;
          const barHeight = maxCount > 0 ? (count / maxCount) * 100 : 0;
          
          return (
            <div key={star} className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 w-16">
                {[1,2,3,4,5].map(i => (
                  <StarIcon key={i} filled={i <= star} size="sm" />
                ))}
              </div>
              <div className="flex-1 h-8 flex items-center">
                <div 
                  className="rounded-md transition-all duration-500"
                  style={{ 
                    width: `${barHeight}%`, 
                    height: "24px",
                    background: "linear-gradient(135deg, #c9727a, #e8a0a0)",
                    minWidth: "4px"
                  }}
                />
              </div>
              <span className="text-xs w-12 text-right" style={{ color: "#8a6060" }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RECOMMENDATION SUMMARY ───────────────────────────────────────────────────
function RecommendationSummary({ recommendPercent, totalReviews }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "#fdf0f0", border: "1px solid #f5e0e0" }}>
      <div className="text-center">
        <p className="text-2xl font-bold" style={{ color: "#c9727a" }}>
          {recommendPercent}%
        </p>
        <p className="text-xs" style={{ color: "#8a6060" }}>recommend</p>
      </div>
      <div className="flex-1">
        <p className="text-sm" style={{ color: "#5a3d3d" }}>
          {Math.round(recommendPercent * totalReviews / 100)} out of {totalReviews} customers recommend this product
        </p>
      </div>
    </div>
  );
}

// ─── VERIFIED PURCHASE BADGE ──────────────────────────────────────────────────
function VerifiedBadge() {
  return (
    <span 
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Verified
    </span>
  );
}

// ─── MAIN RATING BREAKDOWN COMPONENT ──────────────────────────────────────────
export default function RatingBreakdown({ 
  productId,
  ratings,
  onFilterChange,
  activeFilter,
  showChart = false,
  compact = false,
  className = ""
}) {
  const [localActiveFilter, setLocalActiveFilter] = useState(activeFilter || 0);
  const [ratingDistribution, setRatingDistribution] = useState(ratings?.breakdown || { 5:0,4:0,3:0,2:0,1:0 });
  const [totalReviews, setTotalReviews] = useState(ratings?.count || 0);
  const [averageRating, setAverageRating] = useState(ratings?.average || 0);
  
  // Update when props change
  useEffect(() => {
    if (ratings) {
      setRatingDistribution(ratings.breakdown || { 5:0,4:0,3:0,2:0,1:0 });
      setTotalReviews(ratings.count || 0);
      setAverageRating(ratings.average || 0);
    }
  }, [ratings]);
  
  useEffect(() => {
    setLocalActiveFilter(activeFilter || 0);
  }, [activeFilter]);
  
  const handleFilterChange = (filter) => {
    setLocalActiveFilter(filter);
    onFilterChange?.(filter);
  };
  
  // Calculate recommendation percentage (4-5 star reviews)
  const recommendCount = (ratingDistribution[5] || 0) + (ratingDistribution[4] || 0);
  const recommendPercent = totalReviews > 0 ? Math.round((recommendCount / totalReviews) * 100) : 0;
  
  if (compact) {
    // Compact version for product cards
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <RatingStarsDisplay rating={averageRating} size="sm" />
        <span className="text-sm font-semibold" style={{ color: "#c9727a" }}>
          {averageRating.toFixed(1)}
        </span>
        <span className="text-xs" style={{ color: "#b0a0a0" }}>
          ({totalReviews})
        </span>
      </div>
    );
  }
  
  if (showChart) {
    // Chart version with bar graph
    return (
      <div className={className}>
        <RatingDistributionChart 
          breakdown={ratingDistribution}
          total={totalReviews}
        />
      </div>
    );
  }
  
  // Full version with summary card
  return (
    <div className={`grid md:grid-cols-2 gap-8 ${className}`}>
      {/* Summary Card */}
      <RatingSummaryCard 
        average={averageRating}
        total={totalReviews}
        ratingDistribution={ratingDistribution}
        activeFilter={localActiveFilter}
        onFilterChange={handleFilterChange}
      />
      
      {/* Recommendation Summary */}
      <div className="space-y-4">
        <RecommendationSummary 
          recommendPercent={recommendPercent}
          totalReviews={totalReviews}
        />
        
        {/* Additional Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl" style={{ background: "#fdf0f0", border: "1px solid #f5e0e0" }}>
            <p className="text-xl font-bold" style={{ color: "#2d1a1a" }}>
              {ratingDistribution[5] || 0}
            </p>
            <p className="text-xs" style={{ color: "#8a6060" }}>5 stars</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "#fdf0f0", border: "1px solid #f5e0e0" }}>
            <p className="text-xl font-bold" style={{ color: "#2d1a1a" }}>
              {ratingDistribution[4] || 0}
            </p>
            <p className="text-xs" style={{ color: "#8a6060" }}>4 stars</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "#fdf0f0", border: "1px solid #f5e0e0" }}>
            <p className="text-xl font-bold" style={{ color: "#2d1a1a" }}>
              {(ratingDistribution[3] || 0) + (ratingDistribution[2] || 0) + (ratingDistribution[1] || 0)}
            </p>
            <p className="text-xs" style={{ color: "#8a6060" }}>below 3★</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXPORT ALL SUB-COMPONENTS ────────────────────────────────────────────────
export { 
  RatingStarsDisplay, 
  RatingBreakdownBars, 
  RatingSummaryCard, 
  VerifiedBadge,
  RecommendationSummary 
};