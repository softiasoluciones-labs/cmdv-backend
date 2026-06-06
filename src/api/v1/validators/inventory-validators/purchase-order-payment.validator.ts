import { body, param } from 'express-validator';

const paymentMethods = ['cash', 'bank_transfer', 'deposit', 'check', 'credit_card', 'debit_card'];

export const createPaymentValidator = [
  param('orderId').isUUID().withMessage('Invalid order ID'),
  body('paymentDate')
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Payment date must be a valid date in YYYY-MM-DD format'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('paymentMethod')
    .isIn(paymentMethods)
    .withMessage(`Payment method must be one of: ${paymentMethods.join(', ')}`),
  body('bank')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Bank must be a string with max 100 characters'),
  body('referenceNumber')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference number must be a string with max 100 characters'),
  body('authorizationCode')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Authorization code must be a string with max 100 characters'),
  body('documentType')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Document type must be a string with max 50 characters'),
  body('documentNumber')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Document number must be a string with max 100 characters'),
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be a string with max 1000 characters'),
  body('isMixed')
    .optional()
    .isBoolean()
    .withMessage('isMixed must be a boolean'),
  body('paymentDetails')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Payment details must be an array with at least 1 item'),
  body('paymentDetails.*.paymentMethod')
    .if(body('paymentDetails').exists())
    .isIn(paymentMethods)
    .withMessage('Payment detail method must be a valid payment method'),
  body('paymentDetails.*.amount')
    .if(body('paymentDetails').exists())
    .isFloat({ min: 0.01 })
    .withMessage('Payment detail amount must be a positive number'),
  body('paymentDetails.*.bank')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 }),
  body('paymentDetails.*.referenceNumber')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 }),
  body('paymentDetails.*.authorizationCode')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
];

export const paymentIdValidator = [
  param('orderId').isUUID().withMessage('Invalid order ID'),
  param('paymentId').isUUID().withMessage('Invalid payment ID')
];

export const orderIdValidator = [
  param('orderId').isUUID().withMessage('Invalid order ID')
];