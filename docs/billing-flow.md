# Módulo de Facturación (Billing)

## Descripción General

El módulo de billing gestiona el cobro de todos los cargos generados durante la atención médica de un paciente. Se activa al finalizar la atención clínica y cierra el expediente una vez que el pago es completado.

---

## 1. Estructura del Schema `billing`

### 1.1 Tablas

| Tabla | Descripción |
|---|---|
| `billing.invoices` | Cuenta principal del expediente. Una por expediente. |
| `billing.invoice_items` | Líneas de cargo congeladas al momento de generar la cuenta. |
| `billing.invoice_discounts` | Descuentos aplicados (requieren aprobación admin si el catálogo lo indica). |
| `billing.discount_catalog` | Catálogo de descuentos disponibles con sus reglas. |
| `billing.payments` | Pagos registrados (múltiples pagos y métodos por cuenta). |
| `billing.cash_sessions` | Sesiones de caja para control de efectivo y corte diario. |
| `billing.tax_invoices` | Registro de factura fiscal FEL (SAT Guatemala) — pendiente integración. |
| `billing.insurance_coverages` | Diseñada para futura integración con seguros médicos. |

### 1.2 Relaciones

```
medical.case_files (1) ──────── (1) billing.invoices
                                        │
                         ┌──────────────┼──────────────────┐
                         │              │                   │
                         ▼              ▼                   ▼
                  invoice_items  invoice_discounts       payments
                                        │                   │
                                        ▼                   ▼
                               discount_catalog       cash_sessions
                         │
                         ▼
                    tax_invoices (1:1)
```

---

## 2. Flujo Completo

### 2.1 Diagrama de estados

```
medical.case_files: C1_CREACION
        │
        │  (Se agregan cargos: paquetes, habitaciones,
        │   servicios, insumos/medicamentos)
        │
        ▼
[POST /billing/invoices]
  → Genera billing.invoice (status=draft)
  → Copia todos los cargos como invoice_items (snapshot)
  → Calcula subtotal, total_amount
  → Expediente → CE_CARGOS_EXPEDIENTE
        │
        │  (Opcional) Aplicar descuentos
        │  [POST /billing/invoices/:id/discounts]
        │    └── Si requires_approval=true:
        │         → Queda pendiente de aprobación admin
        │        [PATCH /billing/invoices/:id/discounts/:id/approve]
        │         → Admin aprueba → se aplica al total
        │
        ▼
[PATCH /billing/invoices/:id/confirm]
  → Valida que no haya descuentos pendientes de aprobación
  → invoice.status = 'confirmed'
  → Expediente → CC_CONFIRMACION_CARGOS
        │
        │  (Opcional) Si paciente requiere factura fiscal:
        │  [POST /billing/invoices/:id/tax-invoice]
        │    → Captura NIT o "CF" (Consumidor Final)
        │    → Crea registro tax_invoice con fel_status='pending'
        │    → (Integración FEL SAT pendiente de certificador)
        │
        ▼
PANTALLA DE COBRO
[POST /billing/invoices/:id/payments]
  → Registra pago (efectivo, tarjeta, transferencia, etc.)
  → Se permiten múltiples pagos y métodos mixtos
  → Si pago en efectivo: vincular a cash_session activa
        │
        ├── amount_paid < total_amount
        │     → invoice.status = 'partially_paid'
        │     → Esperar más pagos
        │
        └── amount_paid >= total_amount
              → invoice.status = 'paid'
              → Expediente → C3_CERRADO (discharge_date = NOW())
              → Notificaciones (vía config.notifications)
```

### 2.2 Estados de la cuenta (`billing.invoices.status`)

| Estado | Descripción | Siguiente estado permitido |
|---|---|---|
| `draft` | Recién generada, editable | `confirmed`, `voided` |
| `confirmed` | Cargos bloqueados, lista para cobro | `partially_paid`, `paid`, `voided` |
| `partially_paid` | Con pagos parciales | `paid`, `voided`* |
| `paid` | Completamente pagada | — (estado final) |
| `voided` | Anulada | — (estado final) |

*Anular una cuenta con pagos requiere gestión manual de devoluciones.

---

## 3. IVA y Exención Fiscal (Guatemala)

**Estado actual: TODOS los conceptos son exentos de IVA.**

Los servicios hospitalarios y medicamentos están exentos de IVA según el **Decreto 27-92 del Congreso de la República de Guatemala (Ley del IVA), Artículo 7**, que exime los servicios de salud prestados por hospitales.

El campo `invoice_items.is_iva_exempt = true` por defecto en todos los registros.

**Para habilitar IVA en el futuro** (ej. productos no médicos, exámenes cosméticos):
1. Crear el `invoice_item` con `is_iva_exempt = false`
2. El repositorio calculará automáticamente `iva_amount = taxable_amount × 0.12`
3. Actualizar `invoices.taxable_amount` e `invoices.iva_amount`

Los campos `taxable_amount` e `iva_amount` están en la tabla pero actualmente siempre son `0`.

---

## 4. Descuentos

### 4.1 Tipos de descuento

| Categoría | Descripción | ¿Requiere aprobación? |
|---|---|---|
| `manual` | Aplicado libremente por el cajero | Configurable por catálogo |
| `employee` | Descuento para empleados | Usualmente sí |
| `insurance` | Cobertura parcial de seguro | Sí |
| `promotional` | Descuento por campaña | No |
| `courtesy` | Descuento por cortesía | Sí |

### 4.2 Flujo de aprobación

```
Cajero aplica descuento
        │
        ├── requires_approval = false
        │     → Se aplica inmediatamente al total
        │
        └── requires_approval = true
              → invoice_discount.approved_by = NULL
              → NO se refleja en el total todavía
              → Se notifica al admin/superadmin
              │
              [PATCH /billing/invoices/:id/discounts/:id/approve]
              → Admin aprueba
              → Se recalcula el total de la cuenta
```

**Regla de negocio:** No se puede confirmar una cuenta con descuentos pendientes de aprobación.

### 4.3 Cálculo

- `percentage`: `discount = subtotal × (value / 100)`, limitado por `max_amount` si está definido
- `fixed_amount`: `discount = value` directamente

---

## 5. Métodos de Pago

| Método | Campos adicionales requeridos |
|---|---|
| `cash` | `cash_session_id` (sesión de caja activa) |
| `card_credit` | `reference_number`, `card_brand`, `card_last_four` |
| `card_debit` | `reference_number`, `card_brand`, `card_last_four` |
| `bank_transfer` | `reference_number`, `bank_name` |
| `check` | `reference_number`, `bank_name` |
| `insurance` | `reference_number` (código de autorización del seguro) |

**Pagos mixtos:** Se permiten múltiples pagos con distintos métodos en la misma cuenta. Ej: Q500 en efectivo + Q300 con tarjeta.

---

## 6. Sesiones de Caja (`billing.cash_sessions`)

Controla el efectivo manejado por cada cajero durante su turno.

### Flujo

```
[POST /billing/cash-sessions]       → Cajero abre sesión con fondo inicial
        │
        │  (Durante el turno)
        │  Cada pago en efectivo suma a total_collected
        │
        ▼
[PATCH /billing/cash-sessions/:id/close]
  → Cajero reporta el efectivo físico contado (actual_cash)
  → Sistema calcula: expected_cash = initial_cash + total_collected
  → cash_difference = actual_cash - expected_cash
  → status = 'closed'
```

**Regla:** Un cajero solo puede tener una sesión `open` a la vez.

---

## 7. Factura Fiscal FEL (SAT Guatemala)

### Estado actual: PENDIENTE DE INTEGRACIÓN

El modelo `billing.tax_invoices` está diseñado y creado en base de datos. Cuando el paciente solicita factura fiscal:

1. `[POST /billing/invoices/:id/tax-invoice]` crea el registro con `fel_status = 'pending'`
2. Los campos `fel_uuid`, `fel_series`, `fel_number`, `fel_issued_at`, `fel_issuer` quedan en `NULL`

### Para implementar la integración FEL:

**Proveedores certificados SAT Guatemala (Certificadores):**
- INFILE (https://infile.com.gt)
- G4S (https://g4s.com.gt)
- Digifact (https://digifact.com.gt)

**Flujo de integración:**
1. Contratar un certificador autorizado por SAT
2. Implementar el servicio en `src/api/v1/services/billing-services/fel.service.ts`
3. Al crear `tax_invoice`: llamar al API del certificador con los datos del `invoice`
4. Guardar la respuesta del certificador en `fel_raw_response` (JSONB)
5. Actualizar `fel_status = 'issued'`, `fel_uuid`, `fel_series`, `fel_number`, `fel_issued_at`

**Tipos de documento FEL:**
- `FACT` — Factura (documento más común)
- `FCAM` — Factura Cambiaria (para crédito)

**Campo NIT:**
- Si el cliente tiene NIT registrado: usar ese NIT
- Si no tiene NIT: usar `"CF"` (Consumidor Final)

---

## 8. Seguro Médico (Futuro)

La tabla `billing.insurance_coverages` está diseñada pero no expuesta vía API.

**Cuándo implementar:**
1. La clínica firme convenios con aseguradoras
2. Crear endpoints en billing.routes.ts para gestionar coberturas
3. Integrar el flujo de autorización de cobertura
4. Calcular copago del paciente: `patient_copay = total_amount - coverage_amount`

---

## 9. Endpoints

### Invoices
| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/v1/billing/invoices` | Generar cuenta desde expediente |
| `GET` | `/api/v1/billing/invoices/:id` | Obtener cuenta por ID |
| `GET` | `/api/v1/billing/invoices/case-file/:caseFileId` | Obtener cuenta por expediente |
| `PATCH` | `/api/v1/billing/invoices/:id/confirm` | Confirmar cuenta (bloquea cargos) |
| `PATCH` | `/api/v1/billing/invoices/:id/void` | Anular cuenta |

### Descuentos
| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/v1/billing/invoices/:id/discounts` | Aplicar descuento |
| `PATCH` | `/api/v1/billing/invoices/:id/discounts/:discountId/approve` | Aprobar descuento (admin) |
| `DELETE` | `/api/v1/billing/invoices/:id/discounts/:discountId` | Eliminar descuento no aprobado |

### Pagos
| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/v1/billing/invoices/:id/payments` | Registrar pago |
| `GET` | `/api/v1/billing/invoices/:id/payments` | Listar pagos |
| `PATCH` | `/api/v1/billing/invoices/:id/payments/:paymentId/void` | Anular pago |

### Factura Fiscal (FEL)
| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/v1/billing/invoices/:id/tax-invoice` | Crear registro FEL (pendiente integración SAT) |

### Sesiones de Caja
| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/v1/billing/cash-sessions` | Abrir sesión |
| `GET` | `/api/v1/billing/cash-sessions/open` | Ver sesiones abiertas |
| `GET` | `/api/v1/billing/cash-sessions/me` | Mi sesión activa |
| `GET` | `/api/v1/billing/cash-sessions/:id` | Sesión por ID |
| `PATCH` | `/api/v1/billing/cash-sessions/:id/close` | Cerrar sesión (corte de caja) |

### Catálogo de Descuentos
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/v1/billing/discount-catalog` | Listar descuentos activos |
| `POST` | `/api/v1/billing/discount-catalog` | Crear descuento en catálogo |

---

## 10. Archivos del Módulo

```
src/
├── database/billing/
│   ├── discount_catalog.ts
│   ├── cash_sessions.ts
│   ├── invoices.ts
│   ├── invoice_items.ts
│   ├── invoice_discounts.ts
│   ├── payments.ts
│   ├── tax_invoices.ts
│   ├── insurance_coverages.ts     ← Preparado para seguros (no expuesto en API)
│   └── init-models.ts
│
└── api/v1/
    ├── dtos/billing-dtos/
    │   └── billing.dto.ts
    ├── repositories/billing-repositories/
    │   ├── invoice.repository.ts   ← Lógica principal + recalculate totals
    │   ├── payment.repository.ts
    │   └── cash-session.repository.ts
    ├── services/billing-services/
    │   └── billing.service.ts
    ├── controllers/billing-controllers/
    │   └── billing.controller.ts
    └── routers/
        └── billing.routes.ts
```

---

## 11. SQL de Creación de Tablas

Ver el archivo `docs/database/billing-schema.sql` para el script completo de creación del schema `billing`.
