# Database Integration with Sequelize

## Overview

Se ha integrado exitosamente la base de datos PostgreSQL con Sequelize ORM, reemplazando los datos dummy por operaciones reales de base de datos para el sistema de autenticación.

## Cambios Realizados

### 1. Configuración de Base de Datos

#### `src/config/sequelize.ts` ✨ NUEVO
- Configuración TypeScript de Sequelize
- Gestión de conexión con PostgreSQL
- Pool de conexiones configurado (5 conexiones en dev, 10 en prod)
- Función `connectDatabase()` para inicializar la conexión
- Logging habilitado en development

#### `src/config/database.ts` ⚠️ MODIFICADO
- Mantiene configuración CommonJS para sequelize-cli
- Define configuraciones de development y production
- No se usa directamente en el código TypeScript

---

### 2. Inicialización de Modelos

#### `src/database/index.ts` ✨ NUEVO
- Importa y exporta todos los modelos de Sequelize
- Inicializa modelos del schema `core` usando `initModels()`
- Punto central de acceso a modelos de base de datos

#### `src/database/core/` 📁 GENERADOS
Modelos generados con `sequelize-auto`:
- `users.ts` - Modelo de usuarios
- `jwt_tokens.ts` - Tokens JWT
- `permissions.ts` - Permisos
- `role_permissions.ts` - Permisos por rol
- `user_permissions.ts` - Permisos por usuario
- `audit_logs.ts` - Logs de auditoría
- `init-models.ts` - Inicialización y relaciones

---

### 3. Refactorización del Repository

#### `src/api/v1/repositories/user.repository.ts` 🔄 REFACTORIZADO

**Antes (Dummy Data)**:
```typescript
static findByEmail(email: string): User | undefined {
    return dummyUsers.find(user => user.email === email);
}
```

**Después (Database)**:
```typescript
static async findByEmail(email: string): Promise<users | null> {
    const user = await models.users.findOne({
        where: { email, is_active: true }
    });
    return user;
}
```

**Métodos Actualizados**:
- ✅ `findByEmail()` - Ahora async, busca en BD
- ✅ `findById()` - Usa `findByPk()` de Sequelize
- ✅ `findByUsername()` - Busca por username en BD
- ✅ `create()` - Crea usuarios en BD
- ✅ `updatePassword()` - Actualiza y revoca tokens
- ✅ `updateLastLogin()` - Registra last_login
- ✅ `storeRefreshToken()` - Guarda en tabla `jwt_tokens`
- ✅ `verifyRefreshToken()` - Verifica en BD y revoca si expiró
- ✅ `removeAllRefreshTokens()` - Marca tokens como revoked

**Reset Tokens**:
- ⚠️ Aún en memoria (Map) - pendiente migrar a BD

---

### 4. Actualización del Service

#### `src/api/v1/services/auth.service.ts` 🔄 ACTUALIZADO

**Cambios Principales**:
1. **Imports**: Usa modelos de `src/database/core/users`
2. **Async/Await**: Todos los métodos ahora manejan promesas
3. **Mapeo de Campos**:
   - `user.password` → `user.password_hash`
   - `user.name` → `user.full_name`
   - `user.createdAt` → `user.created_at`
   - `user.updatedAt` → `user.updated_at`

**Métodos Actualizados**:
```typescript
// Antes
static async login(email: string, password: string): Promise<LoginResponse> {
    const user = UserRepository.findByEmail(email); // sync
    // ...
}

// Después
static async login(email: string, password: string): Promise<LoginResponse> {
    const user = await UserRepository.findByEmail(email); // async
    // ...
}
```

---

### 5. Actualización de App.ts

#### `src/app.ts` 🔄 ACTUALIZADO
- Import cambiado de `./config/database` a `./config/sequelize`
- Usa `connectDatabase()` de sequelize.ts
- Reescrito completo para evitar corrupción

---

## Estructura de Archivos

```
src/
├── config/
│   ├── sequelize.ts        ✨ NUEVO - Conexión TypeScript
│   └── database.ts         ⚙️ CommonJS para CLI
│
├── database/
│   ├── index.ts            ✨ NUEVO - Exporta modelos
│   └── core/               📁 Modelos generados
│       ├── users.ts
│       ├── jwt_tokens.ts
│       ├── permissions.ts
│       ├── role_permissions.ts
│       ├── user_permissions.ts
│       ├── audit_logs.ts
│       └── init-models.ts
│
├── api/v1/
│   ├── repositories/
│   │   └── user.repository.ts  🔄 Async + Sequelize
│   ├── services/
│   │   └── auth.service.ts     🔄 Async + mapeo de campos
│   └── models/
│       └── user.model.ts       ⚠️ YA NO SE USA (dummy data)
│
└── app.ts                   🔄 Usa sequelize.ts

```

---

## Configuración de Base de Datos

### Variables de Entorno (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=dev-cmdv
DB_USERNAME=admin
DB_PASSWORD=admin123

# Application
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=30d
```

---

## Comandos Sequelize-Auto Utilizados

```bash
# Generar modelos del schema core
npx sequelize-auto -h localhost -d dev-cmdv -u admin -x admin123 \
  -p 5432 --dialect postgres -o ./src/database/core -l ts \
  --schema core --camelCase --useDefine
```

---

## Testing

### Iniciar Servidor
```bash
npm run build
npm run start
```

### Verificar Conexión
El servidor mostrará:
```
✅ Database connection established successfully
📊 Connected to: dev-cmdv@localhost
🚀 Server is running on port 3000
```

### Probar Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "Admin123!"
  }'
```

> **Nota**: Usar el usuario admin creado en el schema SQL, no los dummy users anteriores.

---

## Próximos Pasos

### Pendientes
1. **Migrar Reset Tokens a BD**
   - Crear tabla o usar jwt_tokens
   - Eliminar Map en memoria

2. **Agregar más schemas**
   - `medical` - Pacientes, doctores, casos
   - `inventory` - Productos, almacén
   - `billing` - Facturación, pagos

3. **Seeders**
   - Crear seeders para datos iniciales
   - Roles, permisos, usuario admin

4. **Migrations**
   - Usar sequelize-cli migrations
   - Versionado de cambios de BD

5. **Optimizaciones**
   - Índices adicionales
   - Caching con Redis
   - Connection pooling tuning

---

## Problemas Resueltos

### ✅ Compilación TypeScript
- Archivos correctamente tipados
- Imports de Sequelize funcionando
- No hay errores de tipo

### ✅ Async/Await
- Todos los métodos del repository son async
- Service maneja promesas correctamente
- No hay race conditions

### ✅ Mapeo de Campos
- Nombres de BD (snake_case) mapeados correctamente
- DTOs usan camelCase
- Conversiones automáticas

---

## Resumen

✅ **Integración Completa** - PostgreSQL conectado con Sequelize  
✅ **Modelos Generados** - Schema `core` completo  
✅ **Repository Refactorizado** - Operaciones async en BD  
✅ **Service Actualizado** - Manejo correcto de promesas  
✅ **Build Exitoso** - Sin errores de compilación  
✅ **Listo para Testing** - API funcional con base de datos real

**Estado**: ✅ Integración exitosa, listo para crear usuarios y testear
