/**
 * Data Transfer Objects (DTOs) for Authentication
 */

// Login
export interface LoginRequest {
    email: string;
    password: string;
}

export interface Permission {
    resource: string;
    actions: string[];
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
}

// Refresh Token
export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
}

// Forgot Password
export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
    resetToken?: string | undefined; // Only for testing/development
}

// Reset Password
export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

// Change Password
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// User Response (without password)
export interface UserResponse {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions?: Permission[];
    createdAt: Date;
    updatedAt: Date;
}

// Create User by Admin
export interface UserCreateByAdminRequest {
    email: string;
    password: string;
    name: string;
    role: string;
}
