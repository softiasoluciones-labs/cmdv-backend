import { body, param, ValidationChain } from 'express-validator';

/**
 * Validation rules for create purchase order
 */
export const createPurchaseOrderValidator: ValidationChain[] = [
    body('supplierId')
        .notEmpty()
        .withMessage('Supplier ID is required')
        .isUUID()
        .withMessage('Supplier ID must be a valid UUID'),
    body('warehouseId')
        .notEmpty()
        .withMessage('Warehouse ID is required')
        .isUUID()
        .withMessage('Warehouse ID must be a valid UUID'),
    body('expectedDate')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Expected date must be in format YYYY-MM-DD'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
    body('items')
        .isArray({ min: 1 })
        .withMessage('Items must be a non-empty array'),
    body('items.*.productId')
        .notEmpty()
        .withMessage('Product ID is required for each item')
        .isUUID()
        .withMessage('Product ID must be a valid UUID'),
    body('items.*.quantity')
        .notEmpty()
        .withMessage('Quantity is required for each item')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    body('items.*.unitCost')
        .notEmpty()
        .withMessage('Unit cost is required for each item')
        .isFloat({ min: 0 })
        .withMessage('Unit cost must be a non-negative number')
];

/**
 * Validation rules for update purchase order
 */
export const updatePurchaseOrderValidator: ValidationChain[] = [
    body('supplierId')
        .optional()
        .isUUID()
        .withMessage('Supplier ID must be a valid UUID'),
    body('warehouseId')
        .optional()
        .isUUID()
        .withMessage('Warehouse ID must be a valid UUID'),
    body('expectedDate')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Expected date must be in format YYYY-MM-DD'),
    body('status')
        .optional()
        .isIn(['draft', 'pending', 'approved', 'received', 'cancelled'])
        .withMessage('Invalid status'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
    body('items')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Items must be a non-empty array if provided'),
    body('items.*.productId')
        .optional()
        .isUUID()
        .withMessage('Product ID must be a valid UUID'),
    body('items.*.quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    body('items.*.unitCost')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Unit cost must be a non-negative number')
];

/**
 * Validation rules for receive purchase order
 */
export const receivePurchaseOrderValidator: ValidationChain[] = [
    body('receivedItems')
        .isArray({ min: 1 })
        .withMessage('Received items must be a non-empty array'),
    body('receivedItems.*.productId')
        .notEmpty()
        .withMessage('Product ID is required for each item')
        .isUUID()
        .withMessage('Product ID must be a valid UUID'),
    body('receivedItems.*.quantity')
        .notEmpty()
        .withMessage('Quantity is required for each item')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    body('receivedItems.*.batchNumber')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Batch number must not exceed 100 characters'),
    body('receivedItems.*.expirationDate')
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
 * Validation rule for delete item detail of purchase order 
 */
export const deletePurchaseOrderItemValidator: ValidationChain[] = [
    param('detailId')
        .notEmpty()
        .withMessage('Detail ID is required')
        .isUUID()
        .withMessage('Detail ID must be a valid UUID'),
    param('orderId')
        .notEmpty()
        .withMessage('Order ID is required')
        .isUUID()
        .withMessage('Order ID must be a valid UUID')
];

/**
 * Validation rules for update purchase order status
 */
export const updateStatusValidator: ValidationChain[] = [
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['draft', 'pending', 'approved', 'received', 'cancelled'])
        .withMessage('Status must be one of: draft, pending, approved, received, cancelled')
];

