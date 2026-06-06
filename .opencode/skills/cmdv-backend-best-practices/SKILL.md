# CMDV-Backend Best Practices Skill

## Descripción
Esta skill define las convenciones, buenas prácticas y anti-patrones del proyecto CMDV-Backend. Úsala para:
- Consultar cómo trabajar correctamente con el proyecto
- Escanear código existente para identificar problemas
- Corregir deviations de las convenciones establecidas

## Stack Tecnológico
- **Runtime:** Node.js 20 Alpine
- **Lenguaje:** TypeScript 5.9.3
- **Framework:** Express 5.1.0
- **ORM:** Sequelize 6.37.7 con PostgreSQL
- **Auth:** JWT con refresh tokens
- **Validación:** express-validator 7.3.0
- **Seguridad:** Helmet, rate-limit, express-mongo-sanitize

## Estructura del Proyecto

```
src/
├── api/v1/
│   ├── routers/       # Definición de rutas
│   ├── controllers/   # Manejadores HTTP
│   ├── services/      # Lógica de negocio
│   ├── repositories/  # Acceso a datos
│   ├── dtos/          # Data Transfer Objects
│   └── validators/    # Validación de requests
├── middleware/        # Express middleware
├── database/          # Modelos Sequelize
├── config/            # Configuración
├── utils/             # Utilidades
└── types/             # Definiciones de tipos
```

## Arquitectura por Capas

```
routers → controllers → services → repositories → models
```

**Reglas:**
- Cada capa solo conoce la siguiente (routers llama controllers, nunca services directamente desde routers)
- Los controllers NO hacen lógica de negocio
- Los repositories NO retornan null en errores (lanzar excepciones)
- Usar DTOs para transferencia de datos entre capas

## Buenos Prácticas

### 1. Respuestas de API
Usar siempre el utilitario `response.utils.ts`:
```typescript
import { successResponse, errorResponse } from '@utils/response.utils';

successResponse(res, 200, 'Mensaje', data);
errorResponse(res, 404, 'Recurso no encontrado');
```

**Formato consistente:**
```json
{
  "success": true,
  "code": 200,
  "message": "Descripción",
  "data": { ... },
  "version": "1.0.0",
  "timestamp": "ISO-8601"
}
```

### 2. Validación de Requests
Usar `express-validator` en la capa de validators:
```typescript
// validators/product.validator.ts
import { body, param } from 'express-validator';

export const createProductValidator = [
  body('name').isString().notEmpty().trim(),
  body('sku').isString().notEmpty().isUppercase(),
  body('price').isFloat({ min: 0 }),
];
```

### 3. Autenticación y Autorización
- Extraer token del header `Authorization: Bearer <token>`
- Usar middleware `authMiddleware` para proteger rutas
- Usar `requireRole(...roles)` para control de acceso basado en roles
- No hacer llamadas a BD en middleware de roles (el rol ya viene en el token)

### 4. Contraseñas
- Usar `password.utils.ts` con bcrypt (10 salt rounds)
- Validar complejidad: mayúsculas, minúsculas, números, caracteres especiales
- Mínimo 8 caracteres

### 5. Logs
- Usar Winston (`utils/logger.ts`)
- Nunca usar `console.log` en código de producción
- El `secure-logger.utils.ts` redacta automáticamente campos sensibles

### 6. Variables de Entorno
```bash
PORT=3002
NODE_ENV=development|production
DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
JWT_SECRET, JWT_REFRESH_SECRET
CORS_ORIGINS
RATE_LIMIT_WINDOW, RATE_LIMIT_MAX
AUTH_RATE_LIMIT_WINDOW, AUTH_RATE_LIMIT_MAX
```

### 7. Nombres de Archivos y Variables
- **Archivos:** kebab-case (`product-controller.ts`, `auth-routes.ts`)
- **Variables/funciones:** camelCase
- **Clases:** PascalCase
- **Constantes:** UPPER_SNAKE_CASE
- **Tablas/columnas DB:** snake_case (manejado por Sequelize)

### 8. Modelos de Datos
- Usar UUIDs como primary keys
- Timestamps automáticos (`createdAt`, `updatedAt`)
- Soft deletes donde aplique (`deletedAt`)

## Malos Prácticas (Anti-Patrones)

### 1. NO USAR `any`
❌ Incorrecto:
```typescript
updateData: any = {}
const filters: any = {}
req: any
```

✅ Correcto:
```typescript
updateData: Partial<IProduct> = {}
const filters: WhereOptions<Product> = {}
// Si no hay tipo, crear uno en types/
```

### 2. NO USAR `console.log`
❌ Incorrecto:
```typescript
console.log('✅ Medical routes module loaded')
console.log(filters)
```

✅ Correcto:
```typescript
import logger from '@utils/logger';
logger.info('Medical routes module loaded', { module: 'medical' });
```

### 3. NO Retornar `null` en Repositories
❌ Incorrecto:
```typescript
async findById(id: string) {
  try {
    return await Model.findByPk(id);
  } catch (error) {
    return null; // NO HACER ESTO
  }
}
```

✅ Correcto:
```typescript
async findById(id: string) {
  try {
    return await Model.findByPk(id);
  } catch (error) {
    logger.error('Error finding record', { id, error });
    throw new Error('Error al obtener el registro');
  }
}
```

### 4. NO Operaciones Asíncronas sin `await`
❌ Incorrecto:
```typescript
async forgotPassword(email: string) {
  const token = generateResetToken();
  storeResetToken(token, email); // Puede no esperar
  return successResponse(res, 200, 'Email enviado');
}
```

✅ Correcto:
```typescript
async forgotPassword(email: string) {
  const token = generateResetToken();
  await storeResetToken(token, email);
  return successResponse(res, 200, 'Email enviado');
}
```

### 5. NO Hardcodear Credenciales
❌ Incorrecto:
```typescript
{
  "host": "localhost",
  "password": "mi_password"
}
```

✅ Correcto:
```typescript
{
  "host": process.env.DB_HOST,
  "password": process.env.DB_PASSWORD
}
```

### 6. NO Respuestas Manuales en Controllers
❌ Incorrecto:
```typescript
res.status(200).json({
  success: true,
  code: 200,
  message: 'Producto actualizado',
  data: product,
  version: '1.0.0',
  timestamp: new Date().toISOString()
});
```

✅ Correcto:
```typescript
successResponse(res, 200, 'Producto actualizado', product);
```

### 7. NO Llamadas a BD en Middleware de Roles
El middleware `requireRole` debe verificar el rol del token, no hacer queries a la BD.

### 8. NO Crear Transacciones Incompletas
Para operaciones que afectan múltiples tablas, usar transacciones:
```typescript
const transaction = await sequelize.transaction();
try {
  await repository1.create(data1, { transaction });
  await repository2.create(data2, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## Scanner de Código

Para escanear el proyecto en busca de problemas, ejecutar:

```bash
# Buscar uso de any
rg '\bany\b' src/ --type ts -l

# Buscar console.log
rg 'console\.log' src/ --type ts -l

# Buscar retornos null en repositories
rg 'return null' src/api/v1/repositories/ --type ts -l

# Buscar respuestas manuales en controllers
rg 'res\.status.*\.json' src/api/v1/controllers/ --type ts -l
```

## Reglas de Commits

Usar commit convencionales:
- `feat:` Nuevas funcionalidades
- `fix:` Corrección de bugs
- `docs:` Documentación
- `refactor:` Refactorización de código
- `test:` Tests
- `chore:` Mantenimiento

## Testing

⚠️ **Pendiente:** El proyecto actualmente no tiene tests configurados.

Para agregar Jest:
```bash
npm install --save-dev jest ts-jest @types/jest
npx ts-jest config:init
```

Mínimo requerido:
- Tests unitarios para services
- Tests de integración para repositories
- Tests E2E para endpoints críticos de auth

## Docker

- Puerto estándar: 3000 (Dockerfile) pero la app usa 3002 por defecto
- Usuario no-root: `expressjs`
- Health check en `/health`