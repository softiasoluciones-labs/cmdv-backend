import { body, param, query, ValidationChain } from 'express-validator';

/**
 * Validation rules for create dispatch
 */
export const createDispatchValidator: ValidationChain[] = [
    body('source_warehouse_id')
        .notEmpty()
        .withMessage('Source warehouse ID is required')
        .isUUID()
        .withMessage('Source warehouse ID must be a valid UUID'),
    body('destination_warehouse_id')
        .notEmpty()
        .withMessage('Destination warehouse ID is required')
        .isUUID()
        .withMessage('Destination warehouse ID must be a valid UUID'),
    body('requester_name')
        .notEmpty()
        .withMessage('Requester name is required')
        .trim()
        .isLength({ max: 200 })
        .withMessage('Requester name must not exceed 200 characters'),
    body('requester_user_id')
        .optional()
        .isUUID()
        .withMessage('Requester user ID must be a valid UUID'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
    body('items')
        .isArray({ min: 1 })
        .withMessage('Items must be a non-empty array'),
    body('items.*.product_id')
        .notEmpty()
        .withMessage('Product ID is required')
        .isUUID()
        .withMessage('Product ID must be a valid UUID'),
    body('items.*.quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    body('items.*.notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Detail notes must not exceed 500 characters')
];

/**
 * Validation rules for dispatch ID
 */
export const dispatchIdValidator: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Dispatch ID must be a valid UUID')
];

/**
 * Validation rules for dispatch filters
 */
export const dispatchFiltersValidator: ValidationChain[] = [
    query('sourceWarehouseId')
        .optional()
        .isUUID()
        .withMessage('Source warehouse ID must be a valid UUID'),
    query('destinationWarehouseId')
        .optional()
        .isUUID()
        .withMessage('Destination warehouse ID must be a valid UUID'),
    query('status')
        .optional()
        .isIn(['pending', 'approved', 'dispatched', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
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

/**
 * Validation rules for cancel dispatch
 */
export const cancelDispatchValidator: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Dispatch ID must be a valid UUID'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters')
];

/**
 * Validation rules for execute dispatch
 */
export const executeDispatchValidator: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Dispatch ID must be a valid UUID'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters')
];