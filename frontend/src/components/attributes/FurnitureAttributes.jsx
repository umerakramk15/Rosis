import { useState } from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const RulerIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
    />
  </svg>
);

const WeightIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2 L18 8" />
    <path d="M12 2 L6 8" />
  </svg>
);

const WoodIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="4" y="6" width="16" height="12" rx="1.5" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
  </svg>
);

const ToolsIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
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

const InfoIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ─── DIMENSIONS DISPLAY ────────────────────────────────────────────────────────
function DimensionsDisplay({ dimensions }) {
  if (!dimensions) return null;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#fdf0f0", border: "1.5px solid #f5e0e0" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <RulerIcon />
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
        >
          Product Dimensions
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p
            className="text-xs"
            style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}
          >
            Width
          </p>
          <p
            className="font-semibold text-sm"
            style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
          >
            {dimensions.width || "—"} cm
          </p>
        </div>
        <div>
          <p
            className="text-xs"
            style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}
          >
            Depth
          </p>
          <p
            className="font-semibold text-sm"
            style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
          >
            {dimensions.depth || "—"} cm
          </p>
        </div>
        <div>
          <p
            className="text-xs"
            style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}
          >
            Height
          </p>
          <p
            className="font-semibold text-sm"
            style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
          >
            {dimensions.height || "—"} cm
          </p>
        </div>
      </div>
      {dimensions.weight && (
        <div
          className="flex items-center gap-2 mt-3 pt-3 border-t"
          style={{ borderColor: "#f5e0e0" }}
        >
          <WeightIcon />
          <div className="flex-1">
            <p
              className="text-xs"
              style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}
            >
              Weight
            </p>
            <p
              className="font-semibold text-sm"
              style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
            >
              {dimensions.weight} kg
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ASSEMBLY INFO ────────────────────────────────────────────────────────────
function AssemblyInfo({ assembly }) {
  if (!assembly) return null;

  const levels = {
    easy: {
      label: "Easy Assembly",
      color: "#22c55e",
      bg: "#dcfce7",
      time: "15-30 min",
    },
    moderate: {
      label: "Moderate Assembly",
      color: "#f59e0b",
      bg: "#fef3c7",
      time: "30-60 min",
    },
    professional: {
      label: "Professional Assembly Recommended",
      color: "#ef4444",
      bg: "#fee2e2",
      time: "60+ min",
    },
  };

  const level = levels[assembly.level] || levels.moderate;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: level.bg, border: `1.5px solid ${level.color}20` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <ToolsIcon />
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: level.color, fontFamily: "Jost, sans-serif" }}
        >
          {level.label}
        </p>
      </div>
      <p
        className="text-sm"
        style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
      >
        Estimated time: <span className="font-semibold">{level.time}</span>
      </p>
      {assembly.toolsIncluded && (
        <p
          className="text-xs mt-2"
          style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}
        >
          ✓ Tools and instructions included
        </p>
      )}
      {assembly.instructions && (
        <button
          onClick={() => window.open(assembly.instructions, "_blank")}
          className="text-xs mt-2 underline hover:no-underline transition-all"
          style={{ color: level.color, fontFamily: "Jost, sans-serif" }}
        >
          View Assembly Instructions →
        </button>
      )}
    </div>
  );
}

// ─── MATERIAL INFO ────────────────────────────────────────────────────────────
function MaterialInfo({ material }) {
  if (!material) return null;

  const materials = {
    "solid-wood": {
      label: "Solid Wood",
      desc: "Premium quality, durable, natural grain",
    },
    plywood: { label: "Plywood", desc: "Lightweight, durable, cost-effective" },
    metal: { label: "Metal", desc: "Sturdy, rust-resistant, industrial look" },
    glass: { label: "Glass", desc: "Tempered safety glass, easy to clean" },
    plastic: { label: "Plastic", desc: "Lightweight, weather-resistant" },
    fabric: { label: "Fabric", desc: "Soft, comfortable, easy to clean" },
    leather: { label: "Leather", desc: "Premium, durable, ages beautifully" },
  };

  const info = materials[material] || { label: material, desc: "" };

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{ background: "#fdf0f0", border: "1px solid #f5e0e0" }}
    >
      <WoodIcon />
      <div>
        <p
          className="font-semibold text-sm"
          style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
        >
          {info.label}
        </p>
        {info.desc && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "#8a6060", fontFamily: "Jost, sans-serif" }}
          >
            {info.desc}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── MAIN FURNITURE ATTRIBUTES COMPONENT ───────────────────────────────────────
export default function FurnitureAttributes({
  product,
  category,
  onAttributeChange,
  selectedAttributes = {},
  onPriceChange,
  onStockChange,
  onVariantChange,
}) {
  const [selectedMaterial, setSelectedMaterial] = useState(
    selectedAttributes?.material || null,
  );
  const [selectedColor, setSelectedColor] = useState(
    selectedAttributes?.color || null,
  );
  const [showDetails, setShowDetails] = useState(false);

  // Extract available options from product or category
  const materialOptions =
    product?.availableAttributes?.material ||
    category?.attributes?.find((a) => a.name === "material")?.options ||
    [];

  const colorOptions =
    product?.availableAttributes?.color ||
    category?.attributes?.find((a) => a.name === "color")?.options ||
    [];

  // Get variant price based on selections
  const getVariantPrice = (material, color) => {
    if (!product?.variants || product.variants.length === 0) {
      return product?.price;
    }

    const variant = product.variants.find((v) => {
      const hasMaterial =
        !material ||
        v.attributes?.some(
          (a) => a.name === "material" && a.value === material,
        );
      const hasColor =
        !color ||
        v.attributes?.some((a) => a.name === "color" && a.value === color);
      return hasMaterial && hasColor;
    });

    return variant?.price || product?.price;
  };

  // Get variant stock
  const getVariantStock = (material, color) => {
    if (!product?.variants || product.variants.length === 0) {
      return product?.stock;
    }

    const variant = product.variants.find((v) => {
      const hasMaterial =
        !material ||
        v.attributes?.some(
          (a) => a.name === "material" && a.value === material,
        );
      const hasColor =
        !color ||
        v.attributes?.some((a) => a.name === "color" && a.value === color);
      return hasMaterial && hasColor;
    });

    return variant?.stock || 0;
  };

  // Handle material selection
  const handleMaterialSelect = (material) => {
    const newMaterial = selectedMaterial === material ? null : material;
    setSelectedMaterial(newMaterial);
    onAttributeChange?.("material", newMaterial);

    const newPrice = getVariantPrice(newMaterial, selectedColor);
    const newStock = getVariantStock(newMaterial, selectedColor);

    if (newPrice !== product?.price && onPriceChange) onPriceChange(newPrice);
    if (onStockChange) onStockChange(newStock);
    if (onVariantChange) {
      onVariantChange({
        material: newMaterial,
        color: selectedColor,
        price: newPrice,
        stock: newStock,
      });
    }
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    const newColor = selectedColor === color ? null : color;
    setSelectedColor(newColor);
    onAttributeChange?.("color", newColor);

    const newPrice = getVariantPrice(selectedMaterial, newColor);
    const newStock = getVariantStock(selectedMaterial, newColor);

    if (newPrice !== product?.price && onPriceChange) onPriceChange(newPrice);
    if (onStockChange) onStockChange(newStock);
    if (onVariantChange) {
      onVariantChange({
        material: selectedMaterial,
        color: newColor,
        price: newPrice,
        stock: newStock,
      });
    }
  };

  const currentPrice = getVariantPrice(selectedMaterial, selectedColor);
  const currentStock = getVariantStock(selectedMaterial, selectedColor);
  const inStock = currentStock > 0;
  const lowStock = currentStock > 0 && currentStock <= 3;

  // Get display names for material options
  const getMaterialDisplay = (material) => {
    const displays = {
      "solid-wood": "Solid Wood",
      plywood: "Plywood",
      metal: "Metal",
      glass: "Glass",
      plastic: "Plastic",
      fabric: "Fabric",
      leather: "Leather",
    };
    return displays[material] || material;
  };

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      {materialOptions && materialOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-sm font-semibold"
              style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
            >
              Material:{" "}
              <span style={{ color: "#c9727a" }}>
                {selectedMaterial
                  ? getMaterialDisplay(selectedMaterial)
                  : "Select"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {materialOptions.map((option) => {
              const name = typeof option === "string" ? option : option.name;
              const isSelected = selectedMaterial === name;
              const extraPrice =
                typeof option === "string" ? 0 : option.extraPrice || 0;

              return (
                <button
                  key={name}
                  onClick={() => handleMaterialSelect(name)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    border: "1.5px solid",
                    borderColor: isSelected ? "#c9727a" : "#e0c8c8",
                    background: isSelected ? "#c9727a" : "white",
                    color: isSelected ? "white" : "#5a3d3d",
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  {getMaterialDisplay(name)}
                  {extraPrice !== 0 && (
                    <span
                      className={`ml-1 text-xs ${isSelected ? "text-white/80" : "text-green-600"}`}
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

      {/* Material Info (when selected) */}
      {selectedMaterial && <MaterialInfo material={selectedMaterial} />}

      {/* Color Selection */}
      {colorOptions && colorOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-sm font-semibold"
              style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
            >
              Colour:{" "}
              <span style={{ color: "#c9727a" }}>
                {selectedColor || "Select"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {colorOptions.map((color) => {
              const colorName = typeof color === "string" ? color : color.name;
              const colorHex = typeof color === "string" ? null : color.hex;
              const isSelected = selectedColor === colorName;

              return (
                <button
                  key={colorName}
                  onClick={() => handleColorSelect(colorName)}
                  className="relative transition-all duration-200 flex items-center justify-center"
                  style={{
                    width: colorHex ? "44px" : "auto",
                    minWidth: colorHex ? "44px" : "auto",
                    height: "44px",
                    padding: colorHex ? "0" : "10px 20px",
                    borderRadius: "12px",
                    background: colorHex || "white",
                    border: "1.5px solid",
                    borderColor: isSelected ? "#c9727a" : "#e0c8c8",
                    boxShadow: isSelected ? "0 0 0 2px #c9727a" : "none",
                  }}
                >
                  {colorHex && (
                    <>
                      <div
                        className="w-full h-full rounded-lg"
                        style={{ background: colorHex }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckIcon />
                        </div>
                      )}
                    </>
                  )}
                  {!colorHex && (
                    <span
                      className="text-sm font-medium"
                      style={{ color: isSelected ? "#c9727a" : "#5a3d3d" }}
                    >
                      {colorName}
                    </span>
                  )}
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

      {/* Show/Hide Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm transition-all hover:opacity-70"
        style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
      >
        <InfoIcon />
        {showDetails ? "Hide Product Details" : "View Product Details"}
      </button>

      {/* Detailed Info Section */}
      {showDetails && (
        <div className="space-y-3">
          {/* Dimensions */}
          {product?.dimensions && (
            <DimensionsDisplay dimensions={product.dimensions} />
          )}

          {/* Assembly Info */}
          {product?.assembly && <AssemblyInfo assembly={product.assembly} />}

          {/* Care Instructions */}
          {product?.careInstructions && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "#fdf0f0", border: "1.5px solid #f5e0e0" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
              >
                Care Instructions
              </p>
              <p
                className="text-sm"
                style={{ color: "#5a3d3d", fontFamily: "Jost, sans-serif" }}
              >
                {product.careInstructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selection guidance */}
      {!selectedMaterial && (
        <p
          className="text-xs"
          style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}
        >
          Please select material to add to cart
        </p>
      )}
    </div>
  );
}
