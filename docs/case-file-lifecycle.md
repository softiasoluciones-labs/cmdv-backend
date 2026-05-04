# Ciclo de Vida del Expediente Médico (Case File)

## Descripción General

El sistema de gestión de expedientes médicos (Case Files) es el núcleo del sistema médico para clínicas y hospitales privados. Este documento describe el proceso completo, las relaciones, validaciones y el ciclo de vida de un expediente médico.

---

## 1. Estructura del Expediente Médico

### 1.1 Campos Principales (`case_files`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del expediente |
| `case_number` | STRING(30) | Número único generado automáticamente (ej: `TIP-20240115-0001`) |
| `patient_id` | UUID | Referencia al paciente |
| `admission_date` | DATE | Fecha de admisión (auto-generada) |
| `discharge_date` | DATE | Fecha de alta (opcional) |
| `admission_type` | STRING | Tipo de admisión (código legacy) |
| `chief_complaint` | TEXT | Motivo principal de consulta |
| `initial_diagnosis` | TEXT | Diagnóstico inicial (opcional) |
| `final_diagnosis` | TEXT | Diagnóstico final (opcional) |
| `case_status` | ENUM | Estado clínico del caso |
| `total_cost` | DECIMAL | Costo total acumulado |
| `shift_type` | ENUM | Turno (daytime/nighttime) |
| `current_status_flow` | ENUM | Estado en el flujo de trabajo |
| `is_transfer` | BOOLEAN | Indica si es transferencia |
| `transfer_from_case_id` | UUID | Expediente origen (si es transferencia) |
| `notes` | TEXT | Notas adicionales |
| `created_by` | UUID | Usuario que creó el expediente |
| `admission_type_id` | UUID | Referencia al tipo de admisión |

### 1.2 Estados del Caso

#### CaseStatus (Estado Clínico)
- `active` - Activo
- `in_treatment` - En tratamiento
- `hospitalized` - Hospitalizado
- `surgery_scheduled` - Cirugía programada
- `recovering` - Recuperándose
- `discharged` - Dado de alta
- `transferred` - Transferido
- `deceased` - Fallecido

#### CaseStatusFlow (Flujo de Trabajo)
| Código | Descripción |
|--------|-------------|
| `C1_CREACION` | Creación del expediente |
| `C2_CANCELACION` | Cancelación del expediente |
| `C3_CERRADO` | Cierre del expediente |
| `CE_CARGOS_EXPEDIENTE` | Cargos aplicados al expediente |
| `CC_CONFIRMACION_CARGOS` | Confirmación de cargos |
| `TR_TRASLADO_PROCEDIMIENTO` | Traslado a procedimiento |
| `RA_REAPERTURA` | Reapertura del expediente |
| `EX_EXTORNO` | Expediente retornado |

#### ShiftType (Turno)
- `daytime` - Turno diurno
- `nighttime` - Turno nocturno

---

## 2. Modelo de Datos y Relaciones

### 2.1 Diagrama de Relaciones

```
┌─────────────────┐
│   patients      │
│  (Pacientes)    │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐      1:N      ┌──────────────────┐
│  case_files     │──────────────▶│ case_status_     │
│  (Expedientes)  │               │ history          │
└─────────────────┘               └──────────────────┘
         │
         │ 1:N
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                   ┌──────────────────┐
│ case_rooms      │                   │ case_package_    │
│ (Habitaciones)  │                   │ assignments      │
└─────────────────┘                   │ (Paquetes)       │
                                      └──────────────────┘
         │
         ▼
┌─────────────────┐
│ case_timeline   │
│ (Línea tiempo)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ case_services   │
│ (Servicios)     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ case_doctors    │
│ (Médicos)       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ case_transfers  │
│ (Transferencias)│
└─────────────────┘
```

### 2.2 Tablas Relacionadas

#### admission_types (Tipos de Admisión)
Define las reglas para cada tipo de expediente:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `code` | STRING | Código único (ej: `TIP`, `HOSP`, `CONS`) |
| `name` | STRING | Nombre descriptivo |
| `requires_hospitalization` | BOOLEAN | Requiere habitación |
| `requires_package` | BOOLEAN | Requiere paquete de servicios |
| `allows_transfer` | BOOLEAN | Permite transferencias |
| `requires_immediate_payment` | BOOLEAN | Requiere pago inmediato |
| `category` | ENUM | `E` (Estudios), `P` (Procedimientos), `NULL` |
| `is_active` | BOOLEAN | Tipo activo |

#### case_rooms (Habitaciones Asignadas)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `case_file_id` | UUID | Referencia al expediente |
| `room_id` | UUID | Referencia a habitación |
| `check_in` | DATE | Fecha de ingreso |
| `check_out` | DATE | Fecha de salida |
| `daily_rate` | DECIMAL | Tarifa diaria |

#### case_package_assignments (Paquetes Asignados)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `case_file_id` | UUID | Referencia al expediente |
| `package_id` | UUID | Referencia al paquete |
| `doctor_id` | UUID | Referencia al médico |
| `doctor_type_used` | ENUM | `internal`/`external` |
| `price_applied` | DECIMAL | Precio aplicado |
| `assigned_date` | DATE | Fecha de asignación |
| `inventory_deducted` | BOOLEAN | Inventario descontado |

#### case_timeline (Línea de Tiempo)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `case_file_id` | UUID | Referencia al expediente |
| `stage` | STRING | Etapa del proceso |
| `service_type_id` | UUID | Tipo de servicio |
| `started_at` | DATE | Inicio |
| `ended_at` | DATE | Fin |
| `status_flow` | ENUM | Estado en el flujo |
| `shift_type` | ENUM | Turno |

#### case_status_history (Historial de Estados)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `case_file_id` | UUID | Referencia al expediente |
| `from_status` | ENUM | Estado anterior |
| `to_status` | ENUM | Estado nuevo |
| `transition_date` | DATE | Fecha de transición |
| `reason` | TEXT | Razón del cambio |
| `performed_by` | UUID | Usuario que realizó el cambio |

#### case_services (Servicios Aplicados)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `case_file_id` | UUID | Referencia al expediente |
| `service_id` | UUID | Referencia al servicio |
| `quantity` | INTEGER | Cantidad |
| `unit_price` | DECIMAL | Precio unitario |
| `total_price` | DECIMAL | Precio total |
| `applied_by` | UUID | Usuario que aplicó |

#### case_doctors (Médicos Asignados)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `case_file_id` | UUID | Referencia al expediente |
| `doctor_id` | UUID | Referencia al médico |
| `role` | STRING | Rol del médico |
| `assigned_at` | DATE | Fecha asignación |
| `removed_at` | DATE | Fecha remoción |

#### case_transfers (Transferencias)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `original_case_id` | UUID | Expediente original |
| `transferred_case_id` | UUID | Nuevo expediente |
| `transfer_date` | DATE | Fecha transferencia |
| `transfer_reason` | TEXT | Razón |
| `from_department` | STRING | Departamento origen |
| `to_department` | STRING | Departamento destino |
| `approved_by` | UUID | Aprobado por |

---

## 3. Ciclo de Vida del Expediente

### 3.1 Fases del Ciclo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DEL EXPEDIENTE                     │
└─────────────────────────────────────────────────────────────────────┘

    [CREACIÓN] ──────────────────────────────────────────┐
        │                                                 │
        ▼                                                 │
    [VALIDACIÓN] ──► ¿Requiere habitación? ──► [ASIGNAR] │
        │                                                 │
        ▼                                                 │
    [VALIDACIÓN] ──► ¿Requiere paquete? ──────► [ASIGNAR] │
        │                                                 │
        ▼                                                 │
    [ESTADO ACTIVO] ◄─────────────────────────────────────┘
        │
        ▼
    [EN TRATAMIENTO]
        │
        ├─────────────┐
        │             │
        ▼             ▼
    [HOSPITALIZADO]  [TRANSFERENCIA]
        │             │
        ▼             ▼
    [CIRUGÍA]     [NUEVO EXPEDIENTE]
        │
        ▼
    [RECUPERACIÓN]
        │
        ▼
    [CARGOS APLICADOS]
        │
        ▼
    [CARGOS CONFIRMADOS]
        │
        ├──────────────────┐
        │                  │
        ▼                  ▼
    [ALTA]            [CANCELACIÓN]
        │                  │
        ▼                  ▼
    [CERRADO]        [CERRADO]

```

### 3.2 Estados Detallados

#### Fase 1: Creación (C1_CREACION)
1. **Recepción del paciente**
   - Verificar existencia del paciente
   - Seleccionar tipo de admisión

2. **Validaciones del tipo de admisión**
   - `requires_hospitalization`: Debe asignar habitación
   - `requires_package`: Debe asignar paquete y médico
   - `allows_transfer`: Permite transferencia si aplica
   - `requires_immediate_payment`: Requiere pago (pendiente integración)

3. **Generación del número de caso**
   - Formato: `{CODE}-{YYYYMMDD}-{SEQ}`
   - Ejemplo: `TIP-20240115-0001`

4. **Creación del expediente**
   - Estado inicial: `C1_CREACION`
   - Case status: `active`
   - Registro en timeline: "Case Created"

#### Fase 2: Validación y Asignación
Según el tipo de admisión:

**Si requiere hospitalización:**
- Asignar habitación (`case_rooms`)
- Registrar check-in
- Definir tarifa diaria

**Si requiere paquete:**
- Asignar paquete (`case_package_assignments`)
- Asignar médico responsable
- Definir tipo de médico (interno/externo)
- Establecer precio aplicado

#### Fase 3: Tratamiento
El expediente puede pasar por múltiples estados:

1. **Active** → En espera de atención
2. **In Treatment** → Recibiendo atención
3. **Hospitalized** → Requiere estadía
4. **Surgery Scheduled** → Programado para cirugía
5. **Recovering** → En recuperación

Cada cambio de estado:
- Registra en `case_status_history`
- Actualiza `current_status_flow`
- Crea entrada en `case_timeline`

#### Fase 4: Servicios Adicionales
Durante el tratamiento se pueden agregar:

- **Servicios** (`case_services`)
  - Laboratorios
  - Estudios de imagen
  - Procedimientos menores

- **Médicos adicionales** (`case_doctors`)
  - Especialistas
  - Médicos de guardia

#### Fase 5: Transferencia (Opcional)
Si el tipo de admisión lo permite:

1. Validar que esté en estado transferible
2. Crear nuevo expediente
3. Vincular con `case_transfers`
4. Transferir información relevante

#### Fase 6: Cierre
El expediente puede cerrar por:

1. **Alta** (`discharged`)
   - El paciente egresa
   - Se genera fecha de alta

2. **Cancelación** (`C2_CANCELACION`)
   - El paciente no continuó
   - Se registra motivo

3. **Cierre** (`C3_CERRADO`)
   - Caso resuelto
   - Validar pagos (si aplica)

---

## 4. Reglas de Negocio

### 4.1 Validaciones de Creación

| Tipo de Admisión | Requiere | Valida |
|-----------------|----------|--------|
| Hospitalización | Habitación | `room_id` obligatorio |
| Con paquete | Paquete + Médico | `package_id` + `doctor_id` |
| Transferencia | `allows_transfer=true` | `transfer_from_case_id` |
| Con pago | Pago inmediato | Integración billing (pendiente) |

### 4.2 Transiciones de Estado Válidas

```
Válido:                        Inválido:
C1_CREACION → C2_CANCELACION   C3_CERRADO → C1_CREACION
C1_CREACION → C3_CERRADO       C2_CANCELACION → C1_CREACION
C1_CREACION → CE_CARGOS        Cualquier estado → C1_CREACION
CE_CARGOS → CC_CONFIRMACION    (No se puede regresar a creación)
CC_CONFIRMACION → C3_CERRADO
```

### 4.3 Reglas de Transferencia

1. Solo si `admission_type.allows_transfer = true`
2. Estados transferibles:
   - `CE_CARGOS_EXPEDIENTE`
   - `CC_CONFIRMACION_CARGOS`
3. Genera nuevo expediente
4. Mantiene trazabilidad con `case_transfers`

### 4.4 Reglas de Eliminación

- Solo se puede eliminar en estado `C1_CREACION`
- No debe tener servicios aplicados
- No debe tener historial de transferencias

---

## 5. API Endpoints

### 5.1 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/medical/case-files` | Listar expedientes |
| `GET` | `/api/v1/medical/case-files/:id` | Obtener por ID |
| `GET` | `/api/v1/medical/case-files/case-number/:caseNumber` | Obtener por número |
| `POST` | `/api/v1/medical/case-files` | Crear expediente |
| `PUT` | `/api/v1/medical/case-files/:id` | Actualizar expediente |
| `PATCH` | `/api/v1/medical/case-files/:id/status` | Cambiar estado |
| `DELETE` | `/api/v1/medical/case-files/:id` | Eliminar expediente |

### 5.2 Endpoints de Validación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/medical/case-files/:id/validation` | Validar cumplimiento |
| `GET` | `/api/v1/medical/case-files/:id/can-transfer` | Verificar transferencia |
| `GET` | `/api/v1/medical/case-files/:id/can-close` | Verificar cierre |

### 5.3 Parámetros de Filtrado

```typescript
interface CaseFileFilters {
  page?: number;
  limit?: number;
  patient_id?: string;
  admission_type_id?: string;
  case_status?: CaseStatus;
  status_flow?: CaseStatusFlow;
  shift_type?: ShiftType;
  from_date?: Date;
  to_date?: Date;
}
```

---

## 6. Estructura de Capas

### 6.1 Capa de Controladores
**Archivo:** `src/api/v1/controllers/medical-controllers/case-file-controller.ts`

Responsabilidades:
- Recibir peticiones HTTP
- Validar datos de entrada
- Llamar al servicio correspondiente
- Retornar respuestas estandarizadas

### 6.2 Capa de Servicios
**Archivo:** `src/api/v1/services/medical-services/case-file-service.ts`

Responsabilidades:
- Lógica de negocio
- Validaciones complejas
- Orquestación de repositorios
- Transformación de DTOs

### 6.3 Capa de Repositorios
**Archivo:** `src/api/v1/repositories/medical-repositories/case-file-repository.ts`

Responsabilidades:
- Acceso a base de datos
- Consultas con Sequelize
- Manejo de relaciones
- Paginación

### 6.4 Capa de Validadores
**Archivo:** `src/api/v1/validators/medical-validators/case-file.validator.ts`

Responsabilidades:
- Validar reglas de negocio
- Validar transiciones de estado
- Retornar errores descriptivos

### 6.5 Capa de DTOs
**Archivo:** `src/api/v1/dtos/medical-dtos/case-file.dto.ts`

Interfaces definidas:
- `CreateCaseFileRequest`
- `UpdateCaseFileRequest`
- `UpdateCaseStatusRequest`
- `CaseFileResponse`
- `CaseFileListResponse`
- `CaseValidationResponse`

---

## 7. Ejemplos de Uso

### 7.1 Crear Expediente de Consulta

```json
POST /api/v1/medical/case-files
{
  "patient_id": "uuid-del-paciente",
  "admission_type_id": "uuid-de-consulta",
  "chief_complaint": "Dolor de cabeza",
  "initial_diagnosis": "Cefalea tensional",
  "shift_type": "daytime"
}
```

### 7.2 Crear Expediente con Hospitalización

```json
POST /api/v1/medical/case-files
{
  "patient_id": "uuid-del-paciente",
  "admission_type_id": "uuid-de-hospitalizacion",
  "chief_complaint": "Dolor abdominal agudo",
  "room_id": "uuid-de-habitacion",
  "shift_type": "nighttime"
}
```

### 7.3 Cambiar Estado

```json
PATCH /api/v1/medical/case-files/:id/status
{
  "status": "C3_CERRADO",
  "reason": "Alta médica",
  "notes": "Paciente recuperado sin complicaciones"
}
```

### 7.4 Transferir Expediente

```json
// Primero verificar si puede transferirse
GET /api/v1/medical/case-files/:id/can-transfer

// Luego crear nuevo expediente con transferencia
POST /api/v1/medical/case-files
{
  "patient_id": "uuid-del-paciente",
  "admission_type_id": "nuevo-tipo",
  "chief_complaint": "Continuidad de tratamiento",
  "is_transfer": true,
  "transfer_from_case_id": "uuid-expediente-original"
}
```

---

## 8. Consideraciones Técnicas

### 8.1 Manejo de Errores

| Código | Escenario |
|--------|-----------|
| 400 | Datos requeridos faltantes |
| 404 | Expediente no encontrado |
| 422 | Violación de reglas de negocio |
| 500 | Error interno del servidor |

### 8.2 Auditoría

Todo cambio se registra en:
- `case_status_history`: Cambios de estado
- `case_timeline`: Eventos significativos
- `created_by` / `updated_by`: Trazabilidad de usuario

### 8.3 Consideraciones Pendientes

1. **Módulo de facturación**: Integración con `billing.invoices` para validación de pagos
2. **Transacciones**: Implementar transacciones para operaciones críticas
3. **Soft delete**: Considerar eliminación lógica en lugar de física

---

## 9. Glosario

| Término | Definición |
|---------|------------|
| Case File | Expediente médico de un paciente |
| Admission Type | Tipo de admisión que define reglas |
| Status Flow | Flujo de trabajo del expediente |
| Shift Type | Turno de atención (diurno/nocturno) |
| Transfer | Traslado de un expediente a otro tipo |
| Timeline | Línea de tiempo de eventos del caso |

---

## 10. Referencias de Archivos

```
src/
├── api/v1/
│   ├── controllers/medical-controllers/case-file-controller.ts
│   ├── services/medical-services/case-file-service.ts
│   ├── repositories/medical-repositories/case-file-repository.ts
│   ├── validators/medical-validators/case-file.validator.ts
│   └── dtos/medical-dtos/case-file.dto.ts
└── database/medical/
    ├── case_files.ts
    ├── case_status_history.ts
    ├── case_timeline.ts
    ├── case_rooms.ts
    ├── case_package_assignments.ts
    ├── case_services.ts
    ├── case_doctors.ts
    ├── case_transfers.ts
    └── admission_types.ts
```
