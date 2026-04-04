/**
 * Standard success response format
 */
export const successResponse = <T>(data: T, message: string = 'Success') => {
    return {
        success: true,
        message,
        data
    };
};

/**
 * Standard error response format
 */
export const errorResponse = (message: string, errors?: any) => {
    return {
        success: false,
        message,
        ...(errors && { errors })
    };
};
