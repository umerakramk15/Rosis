const Category = require('../models/Category');
const { sendError } = require('../utils/responseHelper');

/**
 * Validate that product attributes match category requirements
 * Use this middleware when creating/updating products
 */
const validateProductAttributes = async (req, res, next) => {
  try {
    const { categoryId, availableAttributes, variants } = req.body;
    
    // Parse if JSON strings
    let parsedAttributes = availableAttributes;
    let parsedVariants = variants;
    
    if (availableAttributes && typeof availableAttributes === 'string') {
      parsedAttributes = JSON.parse(availableAttributes);
    }
    if (variants && typeof variants === 'string') {
      parsedVariants = JSON.parse(variants);
    }
    
    // Get category
    let category = null;
    if (categoryId) {
      category = await Category.findById(categoryId);
    } else if (req.body.category) {
      category = await Category.findOne({ slug: req.body.category.toLowerCase() });
    }
    
    if (!category) {
      return sendError(res, 400, 'Valid category is required');
    }
    
    // Store category on req for later use
    req.validatedCategory = category;
    
    // If no attributes provided, skip validation
    if (!parsedAttributes && !parsedVariants) {
      return next();
    }
    
    // Get required attributes from category
    const requiredAttrs = category.attributes.filter(attr => attr.required);
    const allCategoryAttrs = category.attributes.map(attr => attr.name);
    
    // Check if all required attributes are present
    if (parsedAttributes) {
      const providedAttrNames = Object.keys(parsedAttributes);
      
      for (const required of requiredAttrs) {
        if (!providedAttrNames.includes(required.name)) {
          return sendError(res, 400, `Missing required attribute: ${required.label}`);
        }
      }
      
      // Validate attribute values against category options (if options exist)
      for (const [attrName, attrValue] of Object.entries(parsedAttributes)) {
        const categoryAttr = category.attributes.find(a => a.name === attrName);
        if (categoryAttr && categoryAttr.options && categoryAttr.options.length > 0) {
          const validValues = categoryAttr.options.map(opt => opt.value);
          if (Array.isArray(attrValue)) {
            for (const val of attrValue) {
              if (!validValues.includes(val)) {
                return sendError(res, 400, `Invalid value "${val}" for attribute ${attrName}`);
              }
            }
          } else {
            if (!validValues.includes(attrValue)) {
              return sendError(res, 400, `Invalid value "${attrValue}" for attribute ${attrName}`);
            }
          }
        }
      }
    }
    
    // Validate variants if present
    if (parsedVariants && parsedVariants.length > 0) {
      for (const variant of parsedVariants) {
        if (!variant.attributes || variant.attributes.length === 0) {
          return sendError(res, 400, 'Each variant must have attributes');
        }
        
        // Check that variant attributes are valid for this category
        for (const attr of variant.attributes) {
          if (!allCategoryAttrs.includes(attr.name)) {
            return sendError(res, 400, `Invalid attribute "${attr.name}" for category ${category.name}`);
          }
        }
        
        // Validate stock
        if (variant.stock !== undefined && (variant.stock < 0 || isNaN(variant.stock))) {
          return sendError(res, 400, 'Variant stock must be a non-negative number');
        }
        
        // Validate price
        if (variant.price !== undefined && (variant.price < 0 || isNaN(variant.price))) {
          return sendError(res, 400, 'Variant price must be a non-negative number');
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Attribute validation error:', error);
    return sendError(res, 500, 'Error validating product attributes');
  }
};

/**
 * Validate that review attributes match product's category
 * (For reviews that include size/color info)
 */
const validateReviewAttributes = async (req, res, next) => {
  try {
    const { size, color } = req.body;
    const productId = req.params.id;
    
    if (!size && !color) {
      return next(); // No attributes to validate
    }
    
    const Product = require('../models/Product');
    const product = await Product.findById(productId).populate('categoryId');
    
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }
    
    const category = product.categoryId;
    if (!category) {
      return next(); // No category, skip validation
    }
    
    // Check if size attribute is valid
    if (size) {
      const sizeAttr = category.attributes.find(a => a.name === 'size');
      if (sizeAttr && sizeAttr.options && sizeAttr.options.length > 0) {
        const validSizes = sizeAttr.options.map(opt => opt.value);
        if (!validSizes.includes(size)) {
          return sendError(res, 400, `Invalid size "${size}". Valid sizes: ${validSizes.join(', ')}`);
        }
      }
    }
    
    // Check if color attribute is valid
    if (color) {
      const colorAttr = category.attributes.find(a => a.name === 'color');
      if (colorAttr && colorAttr.options && colorAttr.options.length > 0) {
        const validColors = colorAttr.options.map(opt => opt.value);
        if (!validColors.includes(color)) {
          return sendError(res, 400, `Invalid color "${color}". Valid colors: ${validColors.join(', ')}`);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Review attribute validation error:', error);
    return sendError(res, 500, 'Error validating review attributes');
  }
};

/**
 * Filter products by dynamic attributes (for GET requests)
 * Parses query params like ?color=Red&size=M
 */
const parseAttributeFilters = (req, res, next) => {
  const excludedParams = ['page', 'limit', 'sortBy', 'order', 'category', 'minPrice', 'maxPrice', 'search'];
  
  const attributeFilters = {};
  
  for (const [key, value] of Object.entries(req.query)) {
    if (!excludedParams.includes(key) && value) {
      attributeFilters[`availableAttributes.${key}`] = value;
    }
  }
  
  req.attributeFilters = attributeFilters;
  next();
};

/**
 * Build variant selection options for frontend
 * Takes a product and returns available attribute combinations
 */
const buildVariantOptions = (product, variants) => {
  const options = {};
  
  if (!variants || variants.length === 0) return options;
  
  // Get all unique attribute names
  const attrNames = new Set();
  variants.forEach(variant => {
    variant.attributes.forEach(attr => {
      attrNames.add(attr.name);
    });
  });
  
  // Build available values for each attribute
  attrNames.forEach(attrName => {
    const values = new Set();
    variants.forEach(variant => {
      const attr = variant.attributes.find(a => a.name === attrName);
      if (attr) values.add(attr.value);
    });
    options[attrName] = Array.from(values);
  });
  
  // Build price map for combinations
  const priceMap = {};
  variants.forEach(variant => {
    const key = variant.attributes.map(a => `${a.name}:${a.value}`).join('|');
    priceMap[key] = {
      price: variant.price,
      stock: variant.stock,
      sku: variant.sku,
    };
  });
  
  return { options, priceMap };
};

module.exports = {
  validateProductAttributes,
  validateReviewAttributes,
  parseAttributeFilters,
  buildVariantOptions,
};