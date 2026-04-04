import { body, query, ValidationChain } from 'express-validator';

/**
 * Validation rules for create admission type
 */
export const createAdmissionTypeValidator: ValidationChain[] = [
    body('code')
        .notEmpty()
        .withMessage('Code is required')
        .trim()
        .isLength({ max: 50 })
        .withMessage('Code must not exceed 50 characters'),

    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .trim()
        .isLength({ max: 100 })
        .withMessage('Name must not exceed 100 characters'),

    body('requires_hospitalization')
        .notEmpty()
        .withMessage('Requires hospitalization is required')
        .isBoolean()
        .withMessage('Requires hospitalization must be a boolean'),

    body('requires_package')
        .notEmpty()
        .withMessage('Requires package is required')
        .isBoolean()
        .withMessage('Requires package must be a boolean'),

    body('allows_transfer')
        .notEmpty()
        .withMessage('Allows transfer is required')
        .isBoolean()
        .withMessage('Allows transfer must be a boolean'),

    body('requires_immediate_payment')
        .notEmpty()
        .withMessage('Requires immediate payment is required')
        .isBoolean()
        .withMessage('Requires immediate payment must be a boolean'),

    body('category')
        .optional()
        .isIn(['E', 'P', 'NULL'])
        .withMessage('Category must be E, P, or NULL'),

    body('description')
        .optional()
        .trim()
        .isString()
        .withMessage('Description must be a string'),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('Is active must be a boolean'),
];

/**
 * Validation rules for update admission type
 */
export const updateAdmissionTypeValidator: ValidationChain[] = [
    body('code')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Code must not exceed 50 characters'),

    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Name must not exceed 100 characters'),

    body('requires_hospitalization')
        .optional()
        .isBoolean()
        .withMessage('Requires hospitalization must be a boolean'),

    body('requires_package')
        .optional()
        .isBoolean()
        .withMessage('Requires package must be a boolean'),

    body('allows_transfer')
        .optional()
        .isBoolean()
        .withMessage('Allows transfer must be a boolean'),

    body('requires_immediate_payment')
        .optional()
        .isBoolean()
        .withMessage('Requires immediate payment must be a boolean'),

    body('category')
        .optional()
        .isIn(['E', 'P', 'NULL'])
        .withMessage('Category must be E, P, or NULL'),

    body('description')
        .optional()
        .trim()
        .isString()
        .withMessage('Description must be a string'),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('Is active must be a boolean'),
];

/**
 * Validation rules for admission type list filters
 */
export const admissionTypeListValidator: ValidationChain[] = [
    query('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean'),

    query('category')
        .optional()
        .isIn(['E', 'P', 'NULL'])
        .withMessage('Category must be E, P, or NULL'),
];
