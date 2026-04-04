import { body, query, ValidationChain } from 'express-validator';

/**
 * Validation rules for create stock movement
 */
export const createStockMovementValidator: ValidationChain[] = [
    body('movementType')
        .notEmpty()
        .withMessage('Movement type is required')
        .isIn(['purchase', 'sale', 'adjustment', 'transfer', 'return', 'dispatch', 'reception'])
        .withMessage('Invalid movement type'),
    body('warehouseId')
        .notEmpty()
        .withMessage('Warehouse ID is required')
        .isUUID()
        .withMessage('Warehouse ID must be a valid UUID'),
    body('productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isUUID()
        .withMessage('Product ID must be a valid UUID'),
    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    body('unitCost')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Unit cost must be a non-negative number'),
    body('referenceType')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Reference type must not exceed 50 characters'),
    body('referenceId')
        .optional()
        .isUUID()
        .withMessage('Reference ID must be a valid UUID'),
    body('batchNumber')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Batch number must not exceed 100 characters'),
    body('expirationDate')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Expiration date must be in format YYYY-MM-DD'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters')
];

/**
 * Validation rules for stock movement filters
 */
export const stockMovementFiltersValidator: ValidationChain[] = [
    query('warehouseId')
        .optional()
        .isUUID()
        .withMessage('Warehouse ID must be a valid UUID'),
    query('productId')
        .optional()
        .isUUID()
        .withMessage('Product ID must be a valid UUID'),
    query('movementType')
        .optional()
        .isIn(['purchase', 'sale', 'adjustment', 'transfer', 'return', 'dispatch', 'reception'])
        .withMessage('Invalid movement type'),
    query('dateFrom')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date from must be in format YYYY-MM-DD'),
    query('dateTo')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date to must be in format YYYY-MM-DD'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];
