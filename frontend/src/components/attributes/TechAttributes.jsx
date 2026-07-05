import { useState, useEffect } from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const CpuIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <line x1="9" y1="9" x2="15" y2="15" />
    <line x1="15" y1="9" x2="9" y2="15" />
  </svg>
);

const HardDriveIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="2" y="12" width="20" height="10" rx="2" />
    <circle cx="6" cy="17" r="1.5" />
    <circle cx="10" cy="17" r="1.5" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

const MemoryIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
  </svg>
);

const BatteryIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="5" y="9" width="14" height="10" rx="1.5" />
    <line x1="19" y1="12" x2="21" y2="12" />
    <line x1="19" y1="14" x2="21" y2="14" />
    <polyline points="8 9 8 19 16 19 16 9" />
  </svg>
);

const CameraIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M3 16V8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
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

// ─── SPECS TABLE COMPONENT ─────────────────────────────────────────────────────
function SpecsTable({ specs }) {
  if (!specs || Object.keys(specs).length === 0) return null;

  const specItems = [
    { key: "processor", label: "Processor", icon: <CpuIcon /> },
    { key: "storage", label: "Storage", icon: <HardDriveIcon /> },
    { key: "ram", label: "RAM", icon: <MemoryIcon /> },
    { key: "battery", label: "Battery", icon: <BatteryIcon /> },
    { key: "camera", label: "Camera", icon: <CameraIcon /> },
    { key: "display", label: "Display", icon: <InfoIcon /> },
    { key: "operatingSystem", label: "OS", icon: <InfoIcon /> },
    { key: "connectivity", label: "Connectivity", icon: <InfoIcon /> },
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
          Technical Specifications
        </p>
      </div>
      <div className="divide-y" style={{ borderColor: "#f5e0e0" }}>
        {specItems.map(({ key, label, icon }) => {
          const value = specs[key];
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

// ─── MAIN TECH ATTRIBUTES COMPONENT ───────────────────────────────────────────
export default function TechAttributes({
  product,
  category,
  onAttributeChange,
  selectedAttributes = {},
  onPriceChange,
  onStockChange,
  onVariantChange,
}) {
  const [selectedStorage, setSelectedStorage] = useState(
    selectedAttributes?.storage || null,
  );
  const [selectedRam, setSelectedRam] = useState(
    selectedAttributes?.ram || null,
  );
  const [selectedColor, setSelectedColor] = useState(
    selectedAttributes?.color || null,
  );
  const [showSpecs, setShowSpecs] = useState(false);

  // Extract available options from product or category
  const storageOptions =
    product?.availableAttributes?.storage ||
    category?.attributes?.find((a) => a.name === "storage")?.options ||
    [];

  const ramOptions =
    product?.availableAttributes?.ram ||
    category?.attributes?.find((a) => a.name === "ram")?.options ||
    [];

  const colorOptions =
    product?.availableAttributes?.color ||
    category?.attributes?.find((a) => a.name === "color")?.options ||
    [];

  // Get variant price based on selections
  const getVariantPrice = (storage, ram, color) => {
    if (!product?.variants || product.variants.length === 0) {
      return product?.price;
    }

    const variant = product.variants.find((v) => {
      const hasStorage =
        !storage ||
        v.attributes?.some((a) => a.name === "storage" && a.value === storage);
      const hasRam =
        !ram || v.attributes?.some((a) => a.name === "ram" && a.value === ram);
      const hasColor =
        !color ||
        v.attributes?.some((a) => a.name === "color" && a.value === color);
      return hasStorage && hasRam && hasColor;
    });

    return variant?.price || product?.price;
  };

  // Get variant stock
  const getVariantStock = (storage, ram, color) => {
    if (!product?.variants || product.variants.length === 0) {
      return product?.stock;
    }

    const variant = product.variants.find((v) => {
      const hasStorage =
        !storage ||
        v.attributes?.some((a) => a.name === "storage" && a.value === storage);
      const hasRam =
        !ram || v.attributes?.some((a) => a.name === "ram" && a.value === ram);
      const hasColor =
        !color ||
        v.attributes?.some((a) => a.name === "color" && a.value === color);
      return hasStorage && hasRam && hasColor;
    });

    return variant?.stock || 0;
  };

  // Handle storage selection
  const handleStorageSelect = (storage) => {
    const newStorage = selectedStorage === storage ? null : storage;
    setSelectedStorage(newStorage);
    onAttributeChange?.("storage", newStorage);

    const newPrice = getVariantPrice(newStorage, selectedRam, selectedColor);
    const newStock = getVariantStock(newStorage, selectedRam, selectedColor);

    if (newPrice !== product?.price && onPriceChange) onPriceChange(newPrice);
    if (onStockChange) onStockChange(newStock);
    if (onVariantChange) {
      onVariantChange({
        storage: newStorage,
        ram: selectedRam,
        color: selectedColor,
        price: newPrice,
        stock: newStock,
      });
    }
  };

  // Handle RAM selection
  const handleRamSelect = (ram) => {
    const newRam = selectedRam === ram ? null : ram;
    setSelectedRam(newRam);
    onAttributeChange?.("ram", newRam);

    const newPrice = getVariantPrice(selectedStorage, newRam, selectedColor);
    const newStock = getVariantStock(selectedStorage, newRam, selectedColor);

    if (newPrice !== product?.price && onPriceChange) onPriceChange(newPrice);
    if (onStockChange) onStockChange(newStock);
    if (onVariantChange) {
      onVariantChange({
        storage: selectedStorage,
        ram: newRam,
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

    const newPrice = getVariantPrice(selectedStorage, selectedRam, newColor);
    const newStock = getVariantStock(selectedStorage, selectedRam, newColor);

    if (newPrice !== product?.price && onPriceChange) onPriceChange(newPrice);
    if (onStockChange) onStockChange(newStock);
    if (onVariantChange) {
      onVariantChange({
        storage: selectedStorage,
        ram: selectedRam,
        color: newColor,
        price: newPrice,
        stock: newStock,
      });
    }
  };

  // Get extra price text for option
  const getExtraPriceText = (option) => {
    if (option.extraPrice > 0) return `+Rs. ${option.extraPrice}`;
    if (option.extraPrice < 0) return `-Rs. ${Math.abs(option.extraPrice)}`;
    return null;
  };

  const currentPrice = getVariantPrice(
    selectedStorage,
    selectedRam,
    selectedColor,
  );
  const currentStock = getVariantStock(
    selectedStorage,
    selectedRam,
    selectedColor,
  );
  const inStock = currentStock > 0;
  const lowStock = currentStock > 0 && currentStock <= 3;

  // Build specs from product or selections
  const specs = {
    processor: product?.specs?.processor || "Octa-core",
    storage: selectedStorage || product?.specs?.storage || "128GB",
    ram: selectedRam || product?.specs?.ram || "8GB",
    battery: product?.specs?.battery || "4500mAh",
    camera: product?.specs?.camera || "50MP + 8MP + 2MP",
    display: product?.specs?.display || "6.5-inch AMOLED",
    operatingSystem: product?.specs?.os || "Android 14",
    connectivity: product?.specs?.connectivity || "5G, Wi-Fi 6, Bluetooth 5.3",
  };

  return (
    <div className="space-y-6">
      {/* Storage Selection */}
      {storageOptions && storageOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-sm font-semibold"
              style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
            >
              Storage:{" "}
              <span style={{ color: "#c9727a" }}>
                {selectedStorage || "Select"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {storageOptions.map((option) => {
              const name = typeof option === "string" ? option : option.name;
              const isSelected = selectedStorage === name;
              const extraPrice =
                typeof option === "string" ? 0 : option.extraPrice || 0;

              return (
                <button
                  key={name}
                  onClick={() => handleStorageSelect(name)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSelected ? "active-storage" : ""
                  }`}
                  style={{
                    border: "1.5px solid",
                    borderColor: isSelected ? "#c9727a" : "#e0c8c8",
                    background: isSelected ? "#c9727a" : "white",
                    color: isSelected ? "white" : "#5a3d3d",
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  {name}
                  {extraPrice !== 0 && (
                    <span
                      className={`ml-1 text-xs ${isSelected ? "text-white/80" : "text-green-600"}`}
                    >
                      {extraPrice > 0
                        ? `+$${extraPrice}`
                        : `-$${Math.abs(extraPrice)}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* RAM Selection */}
      {ramOptions && ramOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-sm font-semibold"
              style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}
            >
              RAM:{" "}
              <span style={{ color: "#c9727a" }}>
                {selectedRam || "Select"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {ramOptions.map((option) => {
              const name = typeof option === "string" ? option : option.name;
              const isSelected = selectedRam === name;
              const extraPrice =
                typeof option === "string" ? 0 : option.extraPrice || 0;

              return (
                <button
                  key={name}
                  onClick={() => handleRamSelect(name)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    border: "1.5px solid",
                    borderColor: isSelected ? "#c9727a" : "#e0c8c8",
                    background: isSelected ? "#c9727a" : "white",
                    color: isSelected ? "white" : "#5a3d3d",
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  {name}
                  {extraPrice !== 0 && (
                    <span
                      className={`ml-1 text-xs ${isSelected ? "text-white/80" : "text-green-600"}`}
                    >
                      {extraPrice > 0
                        ? `+$${extraPrice}`
                        : `-$${Math.abs(extraPrice)}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
              const textDark =
                typeof color === "string" ? true : color.textDark;
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

      {/* View Specs Button */}
      <button
        onClick={() => setShowSpecs(!showSpecs)}
        className="flex items-center gap-2 text-sm transition-all hover:opacity-70"
        style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
      >
        <InfoIcon />
        {showSpecs ? "Hide Full Specifications" : "View Full Specifications"}
      </button>

      {/* Specs Table */}
      {showSpecs && (
        <div className="mt-2">
          <SpecsTable specs={specs} />
        </div>
      )}

      {/* Selection guidance */}
      {(!selectedStorage || !selectedRam) && (
        <p
          className="text-xs"
          style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}
        >
          Please select all options to add to cart
        </p>
      )}
    </div>
  );
}
