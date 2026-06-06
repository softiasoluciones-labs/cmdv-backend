import { body, param, query, ValidationChain } from 'express-validator';
import { ScheduledOperationStatus, OperationTeamRole } from '../../dtos/medical-dtos/scheduled-operation.dto';

export const createScheduledOperationValidator: ValidationChain[] = [
    body('case_file_id')
        .notEmpty()
        .withMessage('Case file ID is required')
        .isUUID()
        .withMessage('Case file ID must be a valid UUID'),

    body('operation_type_id')
        .notEmpty()
        .withMessage('Operation type ID is required')
        .isUUID()
        .withMessage('Operation type ID must be a valid UUID'),

    body('primary_surgeon_id')
        .notEmpty()
        .withMessage('Primary surgeon ID is required')
        .isUUID()
        .withMessage('Primary surgeon ID must be a valid UUID'),

    body('anesthesiologist_id')
        .optional()
        .isUUID()
        .withMessage('Anesthesiologist ID must be a valid UUID'),

    body('scheduled_date')
        .notEmpty()
        .withMessage('Scheduled date is required')
        .isISO8601()
        .withMessage('Scheduled date must be a valid ISO 8601 date'),

    body('estimated_duration_minutes')
        .notEmpty()
        .withMessage('Estimated duration is required')
        .isInt({ min: 15, max: 720 })
        .withMessage('Estimated duration must be between 15 and 720 minutes'),

    body('operating_room')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Operating room must not exceed 50 characters'),

    body('pre_operative_notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Pre-operative notes must not exceed 2000 characters'),
];

export const updateScheduledOperationValidator: ValidationChain[] = [
    body('scheduled_date')
        .optional()
        .isISO8601()
        .withMessage('Scheduled date must be a valid ISO 8601 date'),

    body('estimated_duration_minutes')
        .optional()
        .isInt({ min: 15, max: 720 })
        .withMessage('Estimated duration must be between 15 and 720 minutes'),

    body('operating_room')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Operating room must not exceed 50 characters'),

    body('pre_operative_notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Pre-operative notes must not exceed 2000 characters'),

    body('status')
        .optional()
        .isIn(Object.values(ScheduledOperationStatus))
        .withMessage(`Status must be one of: ${Object.values(ScheduledOperationStatus).join(', ')}`),
];

export const updateScheduledOperationStatusValidator: ValidationChain[] = [
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(Object.values(ScheduledOperationStatus))
        .withMessage(`Status must be one of: ${Object.values(ScheduledOperationStatus).join(', ')}`),

    body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Reason must not exceed 500 characters'),
];

export const addTeamMemberValidator: ValidationChain[] = [
    body('doctor_id')
        .notEmpty()
        .withMessage('Doctor ID is required')
        .isUUID()
        .withMessage('Doctor ID must be a valid UUID'),

    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(Object.values(OperationTeamRole))
        .withMessage(`Role must be one of: ${Object.values(OperationTeamRole).join(', ')}`),
];

export const scheduledOperationListValidator: ValidationChain[] = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('case_file_id')
        .optional()
        .isUUID()
        .withMessage('Case file ID must be a valid UUID'),

    query('status')
        .optional()
        .isIn(Object.values(ScheduledOperationStatus))
        .withMessage(`Status must be one of: ${Object.values(ScheduledOperationStatus).join(', ')}`),

    query('from_date')
        .optional()
        .isISO8601()
        .withMessage('From date must be a valid ISO 8601 date'),

    query('to_date')
        .optional()
        .isISO8601()
        .withMessage('To date must be a valid ISO 8601 date'),
];

export const scheduledOperationIdValidator: ValidationChain[] = [
    param('id')
        .notEmpty()
        .withMessage('Operation ID is required')
        .isUUID()
        .withMessage('Operation ID must be a valid UUID'),
];

export const teamMemberIdValidator: ValidationChain[] = [
    param('memberId')
        .notEmpty()
        .withMessage('Team member ID is required')
        .isUUID()
        .withMessage('Team member ID must be a valid UUID'),
];