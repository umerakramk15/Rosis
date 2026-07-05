import React from 'react';
import FashionAttributes from './FashionAttributes';
import TechAttributes from './TechAttributes';
import FurnitureAttributes from './FurnitureAttributes';
import BooksAttributes from './BooksAttributes';

/**
 * DynamicAttributes - Renders the correct attribute selector based on category
 * 
 * @param {Object} props
 * @param {Object} props.product - Full product object
 * @param {Object} props.category - Category object with uiTemplate
 * @param {Function} props.onAttributeChange - Callback when attributes change
 * @param {Object} props.selectedAttributes - Currently selected attributes
 * @param {Function} props.onPriceChange - Callback when price changes (for variants)
 */
const DynamicAttributes = ({ 
  product, 
  category, 
  onAttributeChange, 
  selectedAttributes = {},
  onPriceChange,
  onStockChange,
}) => {
  
  // Get UI template from category or product
  const uiTemplate = category?.uiTemplate || product?.categoryId?.uiTemplate || 'default';
  
  // If no category or product, show loading or default
  if (!product && !category) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  // Route to appropriate component based on uiTemplate
  switch (uiTemplate) {
    case 'fashion':
      return (
        <FashionAttributes
          product={product}
          category={category}
          onAttributeChange={onAttributeChange}
          selectedAttributes={selectedAttributes}
          onPriceChange={onPriceChange}
          onStockChange={onStockChange}
        />
      );
      
    case 'electronics':
      return (
        <TechAttributes
          product={product}
          category={category}
          onAttributeChange={onAttributeChange}
          selectedAttributes={selectedAttributes}
          onPriceChange={onPriceChange}
          onStockChange={onStockChange}
        />
      );
      
    case 'furniture':
      return (
        <FurnitureAttributes
          product={product}
          category={category}
          onAttributeChange={onAttributeChange}
          selectedAttributes={selectedAttributes}
          onPriceChange={onPriceChange}
          onStockChange={onStockChange}
        />
      );
      
    case 'books':
      return (
        <BooksAttributes
          product={product}
          category={category}
          onAttributeChange={onAttributeChange}
          selectedAttributes={selectedAttributes}
          onPriceChange={onPriceChange}
          onStockChange={onStockChange}
        />
      );
      
    default:
      // Default: show basic attributes or nothing
      return (
        <div className="mb-6">
          {product?.availableAttributes && Object.keys(product.availableAttributes).length > 0 && (
            <div className="space-y-4">
              {Object.entries(product.availableAttributes).map(([attrName, attrValues]) => (
                <div key={attrName}>
                  <label className="block text-sm font-semibold mb-2 capitalize" style={{ color: '#2d1a1a' }}>
                    {attrName}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {attrValues.map((value) => (
                      <button
                        key={value}
                        onClick={() => onAttributeChange(attrName, value)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          selectedAttributes[attrName] === value
                            ? 'bg-[#c9727a] text-white'
                            : 'bg-white border border-[#e0c8c8] text-[#5a3d3d] hover:border-[#c9727a]'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
  }
};

export default DynamicAttributes;