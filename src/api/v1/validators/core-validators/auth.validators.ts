import { body, ValidationChain } from 'express-validator';

/**
 * Validation rules for login endpoint
 */
export const loginValidator: ValidationChain[] = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ max: 128 })
        .withMessage('Password must not exceed 128 characters')
];

/**
 * Validation rules for refresh token endpoint
 */
export const refreshTokenValidator: ValidationChain[] = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
];

/**
 * Validation rules for forgot password endpoint
 */
export const forgotPasswordValidator: ValidationChain[] = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters')
];

/**
 * Validation rules for reset password endpoint
 */
export const resetPasswordValidator: ValidationChain[] = [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required')
        .isLength({ min: 64, max: 64 })
        .withMessage('Invalid token format')
        .matches(/^[a-f0-9]+$/)
        .withMessage('Token must be hexadecimal'),
    body('newPassword')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character')
];

/**
 * Validation rules for change password endpoint
 */
export const changePasswordValidator: ValidationChain[] = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required')
        .isLength({ max: 128 })
        .withMessage('Password must not exceed 128 characters'),
    body('newPassword')
        .isLength({ min: 8, max: 128 })
        .withMessage('New password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        })
];

/**
 * Validation rules for create user by admin endpoint
 */
export const createUserByAdminValidator: ValidationChain[] = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters'),
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['super_admin', 'admin', 'doctor', 'nurse', 'pharmacist', 'receptionist', 'lab_technician', 'billing_staff', 'warehouse_manager'])
        .withMessage('Invalid role')
];
