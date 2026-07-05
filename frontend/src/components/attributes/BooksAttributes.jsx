import { useState } from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const BookIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const LanguageIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PagesIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M4 6h16v12H4z" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
  </svg>
);

const StarIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ─── BOOK DETAILS COMPONENT ────────────────────────────────────────────────────
function BookDetails({ details }) {
  if (!details || Object.keys(details).length === 0) return null;

  const detailItems = [
    { key: "author", label: "Author", icon: <StarIcon /> },
    { key: "publisher", label: "Publisher", icon: <BookIcon /> },
    { key: "publishedYear", label: "Published", icon: <CalendarIcon /> },
    { key: "pages", label: "Pages", icon: <PagesIcon /> },
    { key: "isbn", label: "ISBN", icon: <BookIcon /> },
    { key: "edition", label: "Edition", icon: <StarIcon /> },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1.5px solid #f5e0e0", background: "white" }}
    >
      <div
        className="px-4 py-3"
        style={{ background: "#fde8e8", borderBottom: "1.5px solid #f5e0e0" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
        >
          Book Details
        </p>
      </div>
      <div className="divide-y" style={{ borderColor: "#f5e0e0" }}>
        {detailItems.map(({ key, label, icon }) => {
          const value = details[key];
          if (!value) return null;

          return (
            <div
              key={key}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderColor: "#f5e0e0" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#fdf0f0", color: "#c9727a" }}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}
                >
                  {label}
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: "#2d1a1a",
                    fontFamily: "Jost, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN BOOKS ATTRIBUTES COMPONENT ──────────────────────────────────────────
export default function BooksAttributes({
  product,
  category,
  onAttributeChange,
  selectedAttributes = {},
  onPriceChange,
  onStockChange,
  onVariantChange,
}) {
  const [selectedFormat, setSelectedFormat] = useState(
    selectedAttributes?.format || null,
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    selectedAttributes?.language || null,
  );
  const [showDetails, setShowDetails] = useState(false);

  // Extract available options from product or category
  const formatOptions =
    product?.availableAttributes?.format ||
    category?.attributes?.find((a) => a.name === "format")?.options ||
    [];

  const languageOptions =
    product?.availableAttributes?.language ||
    category?.attributes?.find((a) => a.name === "language")?.options ||
    [];

  // Language display mapping
  const languageMap = {
    en: "English",
    ur: "Urdu",
    ar: "Arabic",
    fr: "French",
    es: "Spanish",
    de: "German",
    zh: "Chinese",
    hi: "Hindi",
  };

  // Format display mapping
  const formatMap = {
    hardcover: "Hardcover",
    paperback: "Paperback",
    ebook: "eBook",
    audiobook: "Audiobook",
  };

  // Format icons
  const formatIcon = {
    hardcover: "📘",
    paperback: "📖",
    ebook: "📱",
    audiobook: "🎧",
  };

  // Get variant price based on selections
  const getVariantPrice = (format, language) => {
    if (!product?.variants || product.variants.length === 0) {
      return product?.price;
    }

    const variant = product.variants.find((v) => {
      const hasFormat =
        !format ||
        v.attributes?.some((a) => a.name === "format" && a.value === format);
      const hasLanguage =
        !language ||
        v.attributes?.some(
          (a) => a.name === "language" && a.value === language,
        );
      return hasFormat && hasLanguage;
    });

    return variant?.price || product?.price;
  };

  // Get variant stock
  const getVariantStock = (format, language) => {
    if (!product?.variants || product.variants.length === 0) {
      return product?.stock;
    }

    const variant = product.variants.find((v) => {
      const hasFormat =
        !format ||
        v.attributes?.some((a) => a.name === "format" && a.value === format);
      const hasLanguage =
        !language ||
        v.attributes?.some(
          (a) => a.name === "language" && a.value === language,
        );
      return hasFormat && hasLanguage;
    });

    return variant?.stock || 0;
  };

  // Handle format selection
  const handleFormatSelect = (format) => {
    const newFormat = selectedFormat === format ? null : format;
    setSelectedFormat(newFormat);
    onAttributeChange?.("format", newFormat);

    const newPrice = getVariantPrice(newFormat, selectedLanguage);
    const newStock = getVariantStock(newFormat, selectedLanguage);

    if (newPrice !== product?.price && onPriceChange) onPriceChange(newPrice);
    if (onStockChange) onStockChange(newStock);
    if (onVariantChange) {
      onVariantChange({
        format: newFormat,
        language: selectedLanguage,
        price: newPrice,
        stock: newStock,
      });
    }
  };

  // Handle language selection
  const handleLanguageSelect = (language) => {
    const newLanguage = selectedLanguage === language ? null : language;
    setSelectedLanguage(newLanguage);
    onAttributeChange?.("language", newLanguage);

    const newPrice = getVariantPrice(selectedFormat, newLanguage);
    const newStock = getVariantStock(selectedFormat, newLanguage);

    if (newPrice !== product?.price && onPriceChange) onPriceChange(newPrice);
    if (onStockChange) onStockChange(newStock);
    if (onVariantChange) {
      onVariantChange({
        format: selectedFormat,
        language: newLanguage,
        price: newPrice,
        stock: newStock,
      });
    }
  };

  const currentPrice = getVariantPrice(selectedFormat, selectedLanguage);
  const currentStock = getVariantStock(selectedFormat, selectedLanguage);
  const inStock = currentStock > 0;
  const lowStock = currentStock > 0 && currentStock <= 3;

  // Get extra price text for option
  const getExtraPriceText = (option) => {
    if (option.extraPrice > 0) return `+Rs. ${option.extraPrice}`;
    if (option.extraPrice < 0) return `-Rs. ${Math.abs(option.extraPrice)}`;
    return null;
  };

  // Build book details from product
  const bookDetails = {
    author: product?.author || product?.details?.author,
    publisher: product?.publisher || product?.details?.publisher,
    publishedYear: product?.publishedYear || product?.details?.year,
    pages: product?.pages || product?.details?.pages,
    isbn: product?.isbn || product?.details?.isbn,
    edition: product?.edition || product?.details?.edition,
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      {formatOptions && formatOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-sm font-semibold"
              style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
            >
              Format:{" "}
              <span style={{ color: "#c9727a" }}>
                {selectedFormat
                  ? formatMap[selectedFormat] || selectedFormat
                  : "Select"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {formatOptions.map((option) => {
              const name = typeof option === "string" ? option : option.name;
              const isSelected = selectedFormat === name;
              const extraPrice =
                typeof option === "string" ? 0 : option.extraPrice || 0;
              const displayName = formatMap[name] || name;
              const icon = formatIcon[name] || "📖";

              return (
                <button
                  key={name}
                  onClick={() => handleFormatSelect(name)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  style={{
                    border: "1.5px solid",
                    borderColor: isSelected ? "#c9727a" : "#e0c8c8",
                    background: isSelected ? "#c9727a" : "white",
                    color: isSelected ? "white" : "#5a3d3d",
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  <span>{icon}</span>
                  {displayName}
                  {extraPrice !== 0 && (
                    <span
                      className={`text-xs ${isSelected ? "text-white/80" : "text-green-600"}`}
                    >
                      {extraPrice > 0
                        ? `+Rs. ${extraPrice}`
                        : `-Rs. ${Math.abs(extraPrice)}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Language Selection */}
      {languageOptions && languageOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-sm font-semibold"
              style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
            >
              Language:{" "}
              <span style={{ color: "#c9727a" }}>
                {selectedLanguage
                  ? languageMap[selectedLanguage] || selectedLanguage
                  : "Select"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {languageOptions.map((option) => {
              const name = typeof option === "string" ? option : option.name;
              const isSelected = selectedLanguage === name;
              const displayName = languageMap[name] || name;

              return (
                <button
                  key={name}
                  onClick={() => handleLanguageSelect(name)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    border: "1.5px solid",
                    borderColor: isSelected ? "#c9727a" : "#e0c8c8",
                    background: isSelected ? "#c9727a" : "white",
                    color: isSelected ? "white" : "#5a3d3d",
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Current price display */}
      {currentPrice !== product?.price && currentPrice && (
        <div className="mt-2">
          <span
            className="text-xs line-through mr-2"
            style={{ color: "#c0a0a0", fontFamily: "Jost, sans-serif" }}
          >
            Rs. {product?.price?.toLocaleString()}
          </span>
          <span
            className="font-bold text-lg"
            style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
          >
            Rs. {currentPrice?.toLocaleString()}
          </span>
        </div>
      )}

      {/* Stock info */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`}
        />
        <span
          className="text-sm font-medium"
          style={{
            fontFamily: "Jost, sans-serif",
            color: inStock ? "#22c55e" : "#ef4444",
          }}
        >
          {inStock
            ? `${lowStock ? `Only ${currentStock} left!` : `In Stock (${currentStock} available)`}`
            : "Out of Stock"}
        </span>
      </div>

      {/* View Details Button */}
      {(bookDetails.author || bookDetails.publisher || bookDetails.pages) && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm transition-all hover:opacity-70"
          style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
        >
          <BookIcon />
          {showDetails ? "Hide Book Details" : "View Book Details"}
        </button>
      )}

      {/* Book Details Section */}
      {showDetails && (
        <div className="mt-2">
          <BookDetails details={bookDetails} />

          {/* Synopsis */}
          {product?.synopsis && (
            <div
              className="mt-3 rounded-2xl p-4"
              style={{ background: "#fdf0f0", border: "1.5px solid #f5e0e0" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
              >
                Synopsis
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "#5a3d3d",
                  fontFamily: "Jost, sans-serif",
                  lineHeight: 1.7,
                }}
              >
                {product.synopsis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selection guidance */}
      {!selectedFormat && (
        <p
          className="text-xs"
          style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}
        >
          Please select format to add to cart
        </p>
      )}
    </div>
  );
}
