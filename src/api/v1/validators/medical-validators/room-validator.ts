import { body, query, ValidationChain } from 'express-validator';

/**
 * Validation rules for list filters of rooms 
 */

export const roomListValidator: ValidationChain[] = [
    query('search')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search term must be at least 2 characters'),

    query('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];
