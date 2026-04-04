import { body, query, ValidationChain } from 'express-validator';

/**
 * Validation rules for create patient
 */
export const createPatientValidator: ValidationChain[] = [
    body('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),

    body('lastName')
        .notEmpty()
        .withMessage('Last name is required')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),

    body('identificationNumber')
        .optional()
        .trim()
        .isLength({ max: 30 })
        .withMessage('Identification number must not exceed 30 characters'),

    body('dateOfBirth')
        .notEmpty()
        .withMessage('Date of birth is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date of birth must be in format YYYY-MM-DD')
        .custom((value) => {
            const date = new Date(value);
            const now = new Date();
            if (date > now) {
                throw new Error('Date of birth cannot be in the future');
            }
            return true;
        }),

    body('gender')
        .notEmpty()
        .withMessage('Gender is required')
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('bloodType')
        .optional()
        .isIn(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])
        .withMessage('Invalid blood type'),

    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone must not exceed 20 characters'),

    body('mobile')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Mobile must not exceed 20 characters'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters'),

    body('allergies')
        .optional()
        .isArray()
        .withMessage('Allergies must be an array'),

    body('chronicConditions')
        .optional()
        .isArray()
        .withMessage('Chronic conditions must be an array'),

    body('currentMedications')
        .optional()
        .isArray()
        .withMessage('Current medications must be an array'),
];

/**
 * Validation rules for update patient
 */
export const updatePatientValidator: ValidationChain[] = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),

    body('identificationNumber')
        .optional()
        .trim()
        .isLength({ max: 30 })
        .withMessage('Identification number must not exceed 30 characters'),

    body('dateOfBirth')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date of birth must be in format YYYY-MM-DD'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('bloodType')
        .optional()
        .isIn(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])
        .withMessage('Invalid blood type'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
];

/**
 * Validation rules for patient list filters
 */
export const patientListValidator: ValidationChain[] = [
    query('search')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search term must be at least 2 characters'),

    query('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

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
