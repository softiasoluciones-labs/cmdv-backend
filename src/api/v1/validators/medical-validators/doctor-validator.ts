import { body, query, ValidationChain } from 'express-validator';

/**
 * Validation rules for creating a new doctor
 */
export const createDoctorValidator: ValidationChain[] = [
    body('medical_license')
        .trim()
        .notEmpty()
        .withMessage('Medical license is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Medical license must be between 3 and 50 characters'),

    body('doctor_type')
        .notEmpty()
        .withMessage('Doctor type is required')
        .isIn(['internal', 'external'])
        .withMessage('Doctor type must be either internal or external'),

    body('user_id')
        .optional()
        .isUUID()
        .withMessage('User ID must be a valid UUID'),

    body('specialty_id')
        .optional()
        .isUUID()
        .withMessage('Specialty ID must be a valid UUID'),

    body('consultation_fee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Consultation fee must be a positive number'),

    body('surgery_fee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Surgery fee must be a positive number'),

    body('identification_number')
        .optional()
        .trim()
        .isLength({ max: 30 })
        .withMessage('Identification number must not exceed 30 characters'),

    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone must not exceed 20 characters')
        .matches(/^[0-9\s\-\+\(\)]+$/)
        .withMessage('Phone must contain only numbers and valid phone characters'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Email must be a valid email address')
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters')
        .normalizeEmail(),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Address must not exceed 500 characters'),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean value'),
];

/**
 * Validation rules for updating a doctor
 */
export const updateDoctorValidator: ValidationChain[] = [
    body('medical_license')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Medical license must be between 3 and 50 characters'),

    body('doctor_type')
        .optional()
        .isIn(['internal', 'external'])
        .withMessage('Doctor type must be either internal or external'),

    body('user_id')
        .optional()
        .isUUID()
        .withMessage('User ID must be a valid UUID'),

    body('specialty_id')
        .optional()
        .isUUID()
        .withMessage('Specialty ID must be a valid UUID'),

    body('consultation_fee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Consultation fee must be a positive number'),

    body('surgery_fee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Surgery fee must be a positive number'),

    body('identification_number')
        .optional()
        .trim()
        .isLength({ max: 30 })
        .withMessage('Identification number must not exceed 30 characters'),

    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone must not exceed 20 characters')
        .matches(/^[0-9\s\-\+\(\)]+$/)
        .withMessage('Phone must contain only numbers and valid phone characters'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Email must be a valid email address')
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters')
        .normalizeEmail(),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Address must not exceed 500 characters'),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean value'),
];

/**
 * Validation rules for doctor list filters
 */
export const doctorListValidator: ValidationChain[] = [
    query('search')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search term must be at least 2 characters'),

    query('doctor_type')
        .optional()
        .isIn(['internal', 'external'])
        .withMessage('Doctor type must be either internal or external'),

    query('specialty_id')
        .optional()
        .isUUID()
        .withMessage('Specialty ID must be a valid UUID'),

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