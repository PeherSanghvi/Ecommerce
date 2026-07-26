/**
 * Currency formatting utilities for INR
 * All prices in the backend are stored as price_minor (cents)
 */

/**
 * Convert cents to INR currency string
 * @param {number} cents - Price in cents
 * @returns {string} Formatted price in INR (e.g., "₹2,499")
 */
export const formatINR = (cents) => {
  if (cents === undefined || cents === null) return '₹0';
  
  const rupees = cents / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
};

/**
 * Convert cents to plain number (for calculations)
 * @param {number} cents - Price in cents
 * @returns {number} Price in rupees as number
 */
export const centsToRupees = (cents) => {
  return (cents || 0) / 100;
};

/**
 * Get price with safe fallback checking multiple fields
 * @param {object} product - Product object
 * @returns {number} Price in cents
 */
export const getPrice = (product) => {
  return product?.price_minor ?? product?.effectivePriceCents ?? product?.priceCents ?? 0;
};

/**
 * Calculate discount percentage
 * @param {number} originalCents - Original price in cents
 * @param {number} discountedCents - Discounted price in cents
 * @returns {number} Discount percentage (0-100)
 */
export const calculateDiscount = (originalCents, discountedCents) => {
  if (originalCents === 0) return 0;
  return Math.round(((originalCents - discountedCents) / originalCents) * 100);
};
