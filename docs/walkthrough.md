# Authentication API - Walkthrough

## Overview

Se ha implementado exitosamente un sistema completo de autenticación con JWT para la API backend, incluyendo todas las funcionalidades solicitadas:

- ✅ **Login** (email + password)
- ✅ **Refresh Token** (renovación de access token)
- ✅ **Forgot Password** (solicitar reset)
- ✅ **Reset Password** (resetear con token)
- ✅ **Change Password** (cambiar contraseña autenticado)
- ✅ **Get Current User** (obtener usuario autenticado)

> [!NOTE]
> El sistema utiliza **datos dummy** simulados en memoria ya que no hay base de datos configurada. Los refresh tokens y reset tokens se almacenan temporalmente en memoria y se perderán al reiniciar el servidor.

## Server Status

🚀 **Server Running**: `http://localhost:3000`  
📚 **API v1**: `http://localhost:3000/api/v1`  
❤️ **Health Check**: `http://localhost:3000/health`

---

## Authentication Endpoints

### 📋 Endpoints Summary

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/api/v1/auth/login` | ❌ | Iniciar sesión |
| POST | `/api/v1/auth/refresh` | ❌ | Refrescar access token |
| POST | `/api/v1/auth/forgot-password` | ❌ | Solicitar reset de contraseña |
| POST | `/api/v1/auth/reset-password` | ❌ | Resetear contraseña con token |
| POST | `/api/v1/auth/change-password` | ✅ | Cambiar contraseña (autenticado) |
| GET | `/api/v1/auth/me` | ✅ | Obtener usuario actual |

---

## Test Credentials

### Dummy Users

```
👤 Admin User
Email: admin@example.com
Password: admin123
Role: admin

👤 User One
Email: user1@example.com
Password: password123
Role: user

👤 User Two
Email: user2@example.com
Password: password456
Role: user

👤 John Doe
Email: john.doe@example.com
Password: johndoe123
Role: user
```

---

## Testing Examples

### 1. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 2. Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Current User (Protected)

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Response**:
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "1",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Forgot Password

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com"
  }'
```

**Response** (development mode shows token):
```json
{
  "success": true,
  "message": "Password reset initiated",
  "data": {
    "message": "If the email exists, a reset token has been sent",
    "resetToken": "123456"
  }
}
```

> [!IMPORTANT]
> En producción, el `resetToken` no se devuelve en la respuesta - solo se muestra en development mode. En una app real, este token se enviaría por email.

---

### 5. Reset Password

```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456",
    "newPassword": "newpassword123"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

---

### 6. Change Password (Protected)

```bash
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newadmin456"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

---

## Implementation Details

### Project Structure

```
src/
├── api/v1/
│   ├── controllers/      → auth.controller.ts
│   ├── services/         → auth.service.ts
│   ├── models/          → user.model.ts (dummy data)
│   ├── repositories/    → user.repository.ts
│   ├── routers/         → auth.routes.ts
│   ├── dtos/            → auth.dtos.ts
│   ├── validators/      → auth.validators.ts
│   └── routes.ts        → v1 router
├── middleware/
│   ├── auth.middleware.ts      → JWT verification
│   ├── error-handler.middleware.ts
│   ├── logger.middleware.ts
│   ├── cors.middleware.ts
│   └── index.ts
├── utils/
│   ├── jwt.utils.ts      → Token generation/verification
│   ├── password.utils.ts → Bcrypt hashing
│   ├── response.utils.ts → Standardized responses
│   └── logger.ts
├── config/
│   ├── config.ts         → Configuration
│   └── database.ts       → Database setup (disabled)
├── types/
│   └── express.d.ts      → Type extensions
├── app.ts
└── server.ts
```

### Technologies Used

- **Express 5**: Web framework
- **TypeScript**: Type safety
- **JWT (jsonwebtoken)**: Token-based authentication
- **Bcrypt**: Password hashing
- **Express-validator**: Request validation
- **Winston**: Logging
- **Morgan**: HTTP logging
- **CORS**: Cross-origin support
- **Helmet**: Security headers (ready to integrate)

### Security Features

✅ Password hashing with bcrypt (10 rounds)  
✅ JWT access tokens (7 days expiration)  
✅ JWT refresh tokens (30 days expiration)  
✅ Token verification middleware  
✅ Input validation on all endpoints  
✅ Standardized error handling  
✅ Security-conscious response messages  
✅ Password reset token expiration (30 minutes)

---

## Error Handling

La API maneja errores de forma consistente:

**401 Unauthorized** - Token inválido o no proporcionado
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**400 Bad Request** - Validación fallida
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Please provide a valid email address",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized** - Credenciales incorrectas
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Next Steps

### Para usar con base de datos real:

1. **Configurar variables de entorno** en `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-super-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   ```

2. **Modificar** `user.repository.ts` para usar Sequelize/TypeORM

3. **Implementar** envío de emails para reset password

4. **Agregar** más validaciones y reglas de negocio

5. **Implementar** rate limiting

6. **Agregar** Swagger documentation

---

## Summary

✅ Sistema de autenticación completo implementado  
✅ 6 endpoints funcionando correctamente  
✅ Datos dummy para testing  
✅ Validaciones en todos los endpoints  
✅ Middleware de autenticación  
✅ Manejo de errores centralizado  
✅ Logging HTTP y de aplicación  
✅ Estructura modular y escalable  
✅ TypeScript con tipos seguros  
✅ Servidor corriendo en puerto 3000

**Estado**: ✅ Todo funcionando correctamente con datos simulados
