import { body, query, ValidationChain } from 'express-validator';

/**
 * Validation rules for create product
 */
export const createProductValidator: ValidationChain[] = [
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Product code is required')
        .isLength({ min: 1, max: 50 })
        .withMessage('Product code must be between 1 and 50 characters')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('Product code must contain only uppercase letters, numbers, and hyphens'),
    body('barcode')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Barcode must not exceed 100 characters'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Product name must be between 2 and 200 characters'),
    body('categoryId')
        .notEmpty()
        .withMessage('Category ID is required')
        .isUUID()
        .withMessage('Category ID must be a valid UUID'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Description must not exceed 5000 characters'),
    body('unitOfMeasure')
        .trim()
        .notEmpty()
        .withMessage('Unit of measure is required')
        .isLength({ max: 50 })
        .withMessage('Unit of measure must not exceed 50 characters'),
    body('minimumStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum stock must be a non-negative integer'),
    body('maximumStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Maximum stock must be a non-negative integer'),
    body('reorderPoint')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Reorder point must be a non-negative integer'),
    body('unitCost')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Unit cost must be a non-negative number'),
    body('sellingPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Selling price must be a non-negative number'),
    body('requiresPrescription')
        .optional()
        .isBoolean()
        .withMessage('Requires prescription must be a boolean'),
    body('requiresRefrigeration')
        .optional()
        .isBoolean()
        .withMessage('Requires refrigeration must be a boolean'),
    body('expirationAlertDays')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Expiration alert days must be between 1 and 365')
];

/**
 * Validation rules for update product
 */
export const updateProductValidator: ValidationChain[] = [
    body('code')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Product code must be between 1 and 50 characters')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('Product code must contain only uppercase letters, numbers, and hyphens'),
    body('barcode')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Barcode must not exceed 100 characters'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Product name must be between 2 and 200 characters'),
    body('categoryId')
        .optional()
        .isUUID()
        .withMessage('Category ID must be a valid UUID'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Description must not exceed 5000 characters'),
    body('unitOfMeasure')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Unit of measure must not exceed 50 characters'),
    body('minimumStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum stock must be a non-negative integer'),
    body('maximumStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Maximum stock must be a non-negative integer'),
    body('reorderPoint')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Reorder point must be a non-negative integer'),
    body('unitCost')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Unit cost must be a non-negative number'),
    body('sellingPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Selling price must be a non-negative number'),
    body('requiresPrescription')
        .optional()
        .isBoolean()
        .withMessage('Requires prescription must be a boolean'),
    body('requiresRefrigeration')
        .optional()
        .isBoolean()
        .withMessage('Requires refrigeration must be a boolean'),
    body('expirationAlertDays')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Expiration alert days must be between 1 and 365'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('Is active must be a boolean')
];

/**
 * Validation rules for product list filters
 */
export const productListValidator: ValidationChain[] = [
    query('categoryId')
        .optional()
        .isUUID()
        .withMessage('Category ID must be a valid UUID'),
    query('isActive')
        .optional()
        .isBoolean()
        .withMessage('Is active must be a boolean'),
    query('requiresPrescription')
        .optional()
        .isBoolean()
        .withMessage('Requires prescription must be a boolean'),
    query('lowStock')
        .optional()
        .isBoolean()
        .withMessage('Low stock must be a boolean'),
    query('search')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Search term must not exceed 200 characters'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];
