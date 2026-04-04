import { body, ValidationChain } from 'express-validator';

/**
 * Validation rules for create warehouse
 */
export const createWarehouseValidator: ValidationChain[] = [
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Warehouse code is required')
        .isLength({ min: 1, max: 20 })
        .withMessage('Warehouse code must be between 1 and 20 characters')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('Warehouse code must contain only uppercase letters, numbers, and hyphens'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Warehouse name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Warehouse name must be between 2 and 100 characters'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Location must not exceed 200 characters'),
    body('managerId')
        .optional()
        .isUUID()
        .withMessage('Manager ID must be a valid UUID'),
    body('capacityM3')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Capacity must be a non-negative number'),
    body('temperatureControlled')
        .optional()
        .isBoolean()
        .withMessage('Temperature controlled must be a boolean')
];

/**
 * Validation rules for update warehouse
 */
export const updateWarehouseValidator: ValidationChain[] = [
    body('code')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Warehouse code must be between 1 and 20 characters')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('Warehouse code must contain only uppercase letters, numbers, and hyphens'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Warehouse name must be between 2 and 100 characters'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Location must not exceed 200 characters'),
    body('managerId')
        .optional()
        .isUUID()
        .withMessage('Manager ID must be a valid UUID'),
    body('capacityM3')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Capacity must be a non-negative number'),
    body('temperatureControlled')
        .optional()
        .isBoolean()
        .withMessage('Temperature controlled must be a boolean'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('Is active must be a boolean')
];
