import { body, ValidationChain } from 'express-validator';

/**
 * Validation rules for create supplier
 */
export const createSupplierValidator: ValidationChain[] = [
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Supplier code is required')
        .isLength({ min: 1, max: 20 })
        .withMessage('Supplier code must be between 1 and 20 characters')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('Supplier code must contain only uppercase letters, numbers, and hyphens'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Supplier name is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Supplier name must be between 2 and 200 characters'),
    body('contactName')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Contact name must not exceed 200 characters'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters'),
    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone must not exceed 20 characters'),
    body('address')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Address must not exceed 300 characters'),
    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City must not exceed 100 characters'),
    body('country')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Country must not exceed 100 characters'),
    body('taxId')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Tax ID must not exceed 50 characters'),
    body('paymentTerms')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Payment terms must not exceed 100 characters'),
    body('creditLimit')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Credit limit must be a non-negative number')
];

/**
 * Validation rules for update supplier
 */
export const updateSupplierValidator: ValidationChain[] = [
    body('code')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Supplier code must be between 1 and 20 characters')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('Supplier code must contain only uppercase letters, numbers, and hyphens'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Supplier name must be between 2 and 200 characters'),
    body('contactName')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Contact name must not exceed 200 characters'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters'),
    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone must not exceed 20 characters'),
    body('address')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Address must not exceed 300 characters'),
    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City must not exceed 100 characters'),
    body('country')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Country must not exceed 100 characters'),
    body('taxId')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Tax ID must not exceed 50 characters'),
    body('paymentTerms')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Payment terms must not exceed 100 characters'),
    body('creditLimit')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Credit limit must be a non-negative number'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('Is active must be a boolean')
];
