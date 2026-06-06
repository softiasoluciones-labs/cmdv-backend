import { Response } from 'express';

export const successResponse = <T>(res: Response, code: number, message: string, data?: T): Response => {
    return res.status(code).json({
        success: true,
        code,
        message,
        data,
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
};

export const errorResponse = (res: Response, code: number, message: string, errors?: unknown): Response => {
    const response: Record<string, unknown> = {
        success: false,
        code,
        message,
        version: '1.0.0',
        timestamp: new Date().toISOString()
    };
    if (errors) {
        response.errors = errors;
    }
    return res.status(code).json(response);
};
