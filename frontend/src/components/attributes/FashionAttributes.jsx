import { useState, useEffect } from 'react';

// ─── ICONS ────────────────────────────────────────────────────────────────────
const RulerIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
);

const ChevronDown = ({ open }) => (
  <svg 
    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
  </svg>
);

// ─── SIZE GUIDE MODAL ─────────────────────────────────────────────────────────
function SizeGuideModal({ onClose, sizeGuide, selectedSize, sizes, stockPerSize }) {
  // Standard size chart if no custom guide provided
  const defaultSizeGuide = {
    XS: { uk: "UK 6", us: "US 2", bust: "82", waist: "62", hip: "88" },
    S:  { uk: "UK 8", us: "US 4", bust: "86", waist: "66", hip: "92" },
    M:  { uk: "UK 10", us: "US 6", bust: "90", waist: "70", hip: "96" },
    L:  { uk: "UK 12", us: "US 8", bust: "94", waist: "74", hip: "100" },
    XL: { uk: "UK 14", us: "US 10", bust: "98", waist: "78", hip: "104" },
    XXL: { uk: "UK 16", us: "US 12", bust: "102", waist: "82", hip: "108" },
  };

  const guide = sizeGuide || defaultSizeGuide;
  const sizeList = sizes || ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ border: "1.5px solid #f5e0e0" }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ background: "#fde8e8", borderColor: "#f0d8d8" }}>
          <h3 className="display-font font-semibold text-lg" style={{ color: "#2d1a1a" }}>Size Guide</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors"
            style={{ color: "#c9727a" }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(85vh - 70px)" }}>
          {/* How to measure */}
          <div className="mb-5">
            <p className="text-xs font-semibold mb-2" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif", letterSpacing: "0.08em" }}>
              HOW TO MEASURE
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Bust", desc: "Measure around the fullest part of your chest" },
                { label: "Waist", desc: "Measure around the narrowest part of your waist" },
                { label: "Hip", desc: "Measure around the fullest part of your hips" },
              ].map(m => (
                <div key={m.label} className="p-2 rounded-xl" style={{ background: "#fdf0f0", border: "1px solid #f5e0e0" }}>
                  <p className="font-bold text-sm" style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}>{m.label}</p>
                  <p className="text-xs mt-1" style={{ color: "#a07070", fontFamily: "Jost, sans-serif", lineHeight: 1.4 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Size Chart */}
          <p className="text-xs font-semibold mb-3" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif", letterSpacing: "0.08em" }}>
            SIZE CHART (cm)
          </p>
          
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr style={{ background: "#fdf0f0", borderBottom: "1.5px solid #f5e0e0" }}>
                <th className="py-3 px-2 text-xs font-semibold" style={{ color: "#8b3a4a", fontFamily: "Jost, sans-serif" }}>Size</th>
                <th className="py-3 px-2 text-xs font-semibold" style={{ color: "#8b3a4a", fontFamily: "Jost, sans-serif" }}>UK</th>
                <th className="py-3 px-2 text-xs font-semibold" style={{ color: "#8b3a4a", fontFamily: "Jost, sans-serif" }}>US</th>
                <th className="py-3 px-2 text-xs font-semibold" style={{ color: "#8b3a4a", fontFamily: "Jost, sans-serif" }}>Bust</th>
                <th className="py-3 px-2 text-xs font-semibold" style={{ color: "#8b3a4a", fontFamily: "Jost, sans-serif" }}>Waist</th>
                <th className="py-3 px-2 text-xs font-semibold" style={{ color: "#8b3a4a", fontFamily: "Jost, sans-serif" }}>Hip</th>
              </tr>
            </thead>
            <tbody>
              {sizeList.map((size) => {
                const row = guide[size] || guide[size.toUpperCase()] || defaultSizeGuide[size];
                const isSelected = selectedSize === size;
                const stock = stockPerSize?.[size] ?? 0;
                const outOfStock = stock === 0;
                
                return (
                  <tr 
                    key={size} 
                    className="border-b transition-colors"
                    style={{ 
                      borderColor: "#f5e0e0",
                      background: isSelected ? "#fde8e8" : "white",
                      opacity: outOfStock ? 0.4 : 1
                    }}
                  >
                    <td className="py-2.5 px-2 font-semibold" style={{ color: isSelected ? "#c9727a" : "#2d1a1a" }}>{size}</td>
                    <td className="py-2.5 px-2" style={{ color: "#5a3d3d" }}>{row?.uk || "—"}</td>
                    <td className="py-2.5 px-2" style={{ color: "#5a3d3d" }}>{row?.us || "—"}</td>
                    <td className="py-2.5 px-2" style={{ color: "#5a3d3d" }}>{row?.bust || "—"}</td>
                    <td className="py-2.5 px-2" style={{ color: "#5a3d3d" }}>{row?.waist || "—"}</td>
                    <td className="py-2.5 px-2" style={{ color: "#5a3d3d" }}>{row?.hip || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Fit note */}
          <div className="mt-5 p-3 rounded-xl" style={{ background: "#fdf0f0", border: "1px solid #f5e0e0" }}>
            <p className="text-xs" style={{ color: "#8a6060", fontFamily: "Jost, sans-serif", lineHeight: 1.6 }}>
              <span className="font-semibold" style={{ color: "#c9727a" }}>✿ Fit Note:</span> This style runs true to size. For a relaxed fit, we recommend sizing up. 
              For questions about fit, contact our style advisors at hello@rosee.shop
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN FASHION ATTRIBUTES COMPONENT ────────────────────────────────────────
export default function FashionAttributes({ 
  product, 
  category, 
  onAttributeChange, 
  selectedAttributes = {},
  onPriceChange,
  onStockChange,
  onVariantChange
}) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedColor, setSelectedColor] = useState(selectedAttributes?.color || null);
  const [selectedSize, setSelectedSize] = useState(selectedAttributes?.size || null);
  
  // Extract available colors from product or category
  const availableColors = product?.availableAttributes?.color || 
                          product?.colors || 
                          category?.attributes?.find(a => a.name === 'color')?.options || [];
  
  // Extract available sizes from product or category
  const availableSizes = product?.availableAttributes?.size || 
                         product?.sizes || 
                         ['XS', 'S', 'M', 'L', 'XL'];
  
  // Stock per size (from product variants)
  const stockPerSize = {};
  if (product?.variants && product.variants.length > 0) {
    product.variants.forEach(variant => {
      const sizeAttr = variant.attributes?.find(a => a.name === 'size');
      if (sizeAttr) {
        stockPerSize[sizeAttr.value] = variant.stock;
      }
    });
  } else if (product?.stockPerSize) {
    Object.assign(stockPerSize, product.stockPerSize);
  }
  
  // Get variant price based on selected color + size
  const getVariantPrice = (color, size) => {
    if (!product?.variants || product.variants.length === 0) {
      return product?.price;
    }
    
    const variant = product.variants.find(v => {
      const hasColor = v.attributes?.some(a => a.name === 'color' && a.value === color);
      const hasSize = v.attributes?.some(a => a.name === 'size' && a.value === size);
      return (!color || hasColor) && (!size || hasSize);
    });
    
    return variant?.price || product?.price;
  };
  
  // Get variant stock
  const getVariantStock = (color, size) => {
    if (!product?.variants || product.variants.length === 0) {
      return product?.stock;
    }
    
    const variant = product.variants.find(v => {
      const hasColor = v.attributes?.some(a => a.name === 'color' && a.value === color);
      const hasSize = v.attributes?.some(a => a.name === 'size' && a.value === size);
      return (!color || hasColor) && (!size || hasSize);
    });
    
    return variant?.stock || 0;
  };
  
  // Handle color selection
  const handleColorSelect = (color) => {
    const newColor = selectedColor === color ? null : color;
    setSelectedColor(newColor);
    
    // Update parent component
    onAttributeChange?.('color', newColor);
    
    // Update price and stock based on selection
    const newPrice = getVariantPrice(newColor, selectedSize);
    const newStock = getVariantStock(newColor, selectedSize);
    
    if (newPrice !== product?.price && onPriceChange) {
      onPriceChange(newPrice);
    }
    
    if (onStockChange) {
      onStockChange(newStock);
    }
    
    if (onVariantChange) {
      onVariantChange({ color: newColor, size: selectedSize, price: newPrice, stock: newStock });
    }
  };
  
  // Handle size selection
  const handleSizeSelect = (size) => {
    if (stockPerSize[size] === 0) return; // Out of stock
    
    const newSize = selectedSize === size ? null : size;
    setSelectedSize(newSize);
    
    // Update parent component
    onAttributeChange?.('size', newSize);
    
    // Update price and stock based on selection
    const newPrice = getVariantPrice(selectedColor, newSize);
    const newStock = getVariantStock(selectedColor, newSize);
    
    if (newPrice !== product?.price && onPriceChange) {
      onPriceChange(newPrice);
    }
    
    if (onStockChange) {
      onStockChange(newStock);
    }
    
    if (onVariantChange) {
      onVariantChange({ color: selectedColor, size: newSize, price: newPrice, stock: newStock });
    }
  };
  
  // Get current stock for display
  const currentStock = getVariantStock(selectedColor, selectedSize);
  const currentPrice = getVariantPrice(selectedColor, selectedSize);
  const lowStock = currentStock > 0 && currentStock <= 5;
  
  return (
    <div className="space-y-6">
      {/* Color Selection */}
      {availableColors && availableColors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}>
              Colour: <span style={{ color: "#c9727a" }}>{selectedColor || "Select"}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {availableColors.map((color) => {
              // Handle both string colors and object colors
              const colorName = typeof color === 'string' ? color : color.name;
              const colorHex = typeof color === 'string' ? null : color.hex;
              const textDark = typeof color === 'string' ? true : color.textDark;
              const isSelected = selectedColor === colorName;
              const isOutOfStock = getVariantStock(colorName, selectedSize) === 0 && selectedSize;
              
              return (
                <button
                  key={colorName}
                  onClick={() => !isOutOfStock && handleColorSelect(colorName)}
                  title={colorName}
                  disabled={isOutOfStock}
                  className="relative transition-all duration-200 flex items-center justify-center"
                  style={{
                    width: colorHex ? "44px" : "auto",
                    minWidth: colorHex ? "44px" : "auto",
                    height: "44px",
                    padding: colorHex ? "0" : "10px 20px",
                    borderRadius: "12px",
                    background: colorHex || "white",
                    border: "1.5px solid",
                    borderColor: isSelected ? "#c9727a" : (isOutOfStock ? "#e0d0d0" : "#e0c8c8"),
                    opacity: isOutOfStock ? 0.4 : 1,
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
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
                      style={{ 
                        color: isSelected ? "#c9727a" : "#5a3d3d",
                        fontFamily: "Jost, sans-serif"
                      }}
                    >
                      {colorName}
                    </span>
                  )}
                  {isOutOfStock && !colorHex && (
                    <span className="absolute -top-2 -right-2 text-xs" style={{ color: "#ef4444" }}>✕</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Size Selection */}
      {availableSizes && availableSizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#2d1a1a", fontFamily: "Jost, sans-serif" }}>
              Size: {selectedSize && <span style={{ color: "#c9727a" }}>{selectedSize}</span>}
            </p>
            <button
              onClick={() => setShowSizeGuide(true)}
              className="flex items-center gap-1.5 text-xs transition-all hover:opacity-70"
              style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}
            >
              <RulerIcon /> Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {availableSizes.map((size) => {
              const stock = stockPerSize[size] ?? 5; // Default stock if not specified
              const isOutOfStock = stock === 0;
              const isSelected = selectedSize === size;
              const isLowStock = stock > 0 && stock <= 3;
              
              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  disabled={isOutOfStock}
                  className="relative min-w-[56px] h-12 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    border: "1.5px solid",
                    borderColor: isSelected ? "#2d1a1a" : (isOutOfStock ? "#e0d0d0" : "#e0c8c8"),
                    background: isSelected ? "#2d1a1a" : "white",
                    color: isSelected ? "white" : (isOutOfStock ? "#c0b0b0" : "#5a3d3d"),
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                    opacity: isOutOfStock ? 0.5 : 1,
                    fontFamily: "Jost, sans-serif",
                  }}
                >
                  {size}
                  {isLowStock && !isOutOfStock && !isSelected && (
                    <span 
                      className="absolute -top-2 -right-2 w-3 h-3 rounded-full"
                      style={{ background: "#f59e0b", border: "2px solid white" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Low stock warning */}
          {lowStock && currentStock > 0 && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "#f59e0b", fontFamily: "Jost, sans-serif" }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} />
              Only {currentStock} left in stock — order soon
            </p>
          )}
          
          {!selectedSize && (
            <p className="text-xs mt-2" style={{ color: "#a07070", fontFamily: "Jost, sans-serif" }}>
              Please select a size to continue
            </p>
          )}
        </div>
      )}
      
      {/* Current price display (for variant-specific pricing) */}
      {currentPrice !== product?.price && currentPrice && (
        <div className="mt-2">
          <span className="text-xs line-through mr-2" style={{ color: "#c0a0a0", fontFamily: "Jost, sans-serif" }}>
            Rs. {product?.price?.toLocaleString()}
          </span>
          <span className="font-bold text-lg" style={{ color: "#c9727a", fontFamily: "Jost, sans-serif" }}>
            Rs. {currentPrice?.toLocaleString()}
          </span>
        </div>
      )}
      
      {/* Size Guide Modal */}
      {showSizeGuide && (
        <SizeGuideModal
          onClose={() => setShowSizeGuide(false)}
          sizeGuide={product?.sizeGuide}
          selectedSize={selectedSize}
          sizes={availableSizes}
          stockPerSize={stockPerSize}
        />
      )}
    </div>
  );
}