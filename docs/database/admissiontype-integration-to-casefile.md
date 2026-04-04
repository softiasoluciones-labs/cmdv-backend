-- ============================================
-- ADMISSION TYPES INTEGRATION
-- Adding admission type catalog and logic to case_files
-- ============================================

-- ============================================
-- 🆕 NEW: admission_type_categories ENUM
-- ============================================

CREATE TYPE medical.admission_category AS ENUM (
    'E',    -- Estudios/Exámenes
    'P',    -- Procedimientos
    'NULL'  -- Sin categoría específica
);

COMMENT ON TYPE medical.admission_category IS '🆕 NEW: Admission categories: E=Estudios, P=Procedimientos';

-- ============================================
-- 🆕 NEW: admission_types catalog table
-- This replaces the hardcoded admission_type field
-- ============================================

CREATE TABLE medical.admission_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    
    -- 🆕 Configuration flags from your catalog
    requires_hospitalization BOOLEAN NOT NULL DEFAULT FALSE,
    requires_package BOOLEAN NOT NULL DEFAULT FALSE,
    allows_transfer BOOLEAN NOT NULL DEFAULT FALSE,
    requires_immediate_payment BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- 🆕 Category
    category medical.admission_category,
    
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admission_types_code ON medical.admission_types(code);
CREATE INDEX idx_admission_types_category ON medical.admission_types(category);
CREATE INDEX idx_admission_types_active ON medical.admission_types(is_active);

COMMENT ON TABLE medical.admission_types IS '🆕 NEW: Catalog of admission types with business rules';
COMMENT ON COLUMN medical.admission_types.requires_hospitalization IS 'If TRUE (S), case must have room assignment';
COMMENT ON COLUMN medical.admission_types.requires_package IS 'If TRUE (S), case must have package assigned';
COMMENT ON COLUMN medical.admission_types.allows_transfer IS 'If TRUE (S), case can be transferred';
COMMENT ON COLUMN medical.admission_types.requires_immediate_payment IS 'If TRUE (S), payment must be made before case creation/closure';
COMMENT ON COLUMN medical.admission_types.category IS 'E=Estudios/Exámenes, P=Procedimientos';

-- ============================================
-- ✏️ MODIFY: case_files table
-- Replace admission_type VARCHAR with admission_type_id FK
-- ============================================

-- First, add the new column
ALTER TABLE medical.case_files 
ADD COLUMN admission_type_id UUID REFERENCES medical.admission_types(id);

COMMENT ON COLUMN medical.case_files.admission_type_id IS '🆕 NEW: Reference to admission type catalog (replaces old admission_type field)';

-- After data migration, you can drop the old column:
-- ALTER TABLE medical.case_files DROP COLUMN admission_type;

-- ============================================
-- 📊 INSERT: Catalog data from your table
-- ============================================

INSERT INTO medical.admission_types (
    code,
    name,
    requires_hospitalization,
    requires_package,
    allows_transfer,
    requires_immediate_payment,
    category
) VALUES
    ('ELECTROCARDIOGRAMA', 
     'Electrocardiograma', 
     FALSE, -- REQ_HOSPITALIZACION = N
     FALSE, -- REQ_PAQUETE = N
     TRUE,  -- APLICA_TRASLADO = S
     TRUE,  -- PAGO_INMEDIATO = S
     'E'),  -- ID_CATEGORIA = E
     
    ('FARMACIA', 
     'Farmacia', 
     FALSE, -- N
     FALSE, -- N
     FALSE, -- N
     TRUE,  -- S
     'NULL'), -- NULL
     
    ('EMERGENCIA', 
     'Emergencia', 
     FALSE, -- N
     FALSE, -- N
     TRUE,  -- S
     FALSE, -- N
     'P'),  -- P
     
    ('LABORATORIOS', 
     'Laboratorios', 
     FALSE, -- N
     FALSE, -- N
     TRUE,  -- S
     TRUE,  -- S
     'E'),  -- E
     
    ('PROCEDIMIENTO_MEDICO', 
     'Procedimiento Médico', 
     TRUE,  -- S - Requiere hospitalización
     TRUE,  -- S - Requiere paquete
     TRUE,  -- S
     FALSE, -- N
     'P'),  -- P
     
    ('RADIOGRAFIAS', 
     'Radiografías', 
     FALSE, -- N
     FALSE, -- N
     TRUE,  -- S
     TRUE,  -- S
     'E'),  -- E
     
    ('SERVICIOS_VARIOS', 
     'Servicios Varios', 
     FALSE, -- N
     FALSE, -- N
     TRUE,  -- S
     TRUE,  -- S
     'E'),  -- E
     
    ('TRATAMIENTO_MEDICO', 
     'Tratamiento Médico', 
     TRUE,  -- S - Requiere hospitalización
     FALSE, -- N
     TRUE,  -- S
     FALSE, -- N
     'P'),  -- P
     
    ('ULTRASONIDOS', 
     'Ultrasonidos', 
     FALSE, -- N
     FALSE, -- N
     TRUE,  -- S
     TRUE,  -- S
     'E');  -- E

-- ============================================
-- 🆕 NEW: Validation view to check case compliance
-- ============================================

CREATE VIEW medical.v_case_validation AS
SELECT 
    cf.id AS case_id,
    cf.case_number,
    at.code AS admission_type_code,
    at.name AS admission_type_name,
    
    -- 🔍 Validation flags
    at.requires_hospitalization,
    EXISTS(SELECT 1 FROM medical.case_rooms cr WHERE cr.case_file_id = cf.id) AS has_room_assigned,
    
    at.requires_package,
    EXISTS(SELECT 1 FROM medical.package_assignments pa WHERE pa.case_file_id = cf.id) AS has_package_assigned,
    
    at.allows_transfer,
    cf.is_transfer,
    
    at.requires_immediate_payment,
    EXISTS(SELECT 1 FROM billing.invoices i WHERE i.case_file_id = cf.id AND i.status = 'paid') AS has_payment,
    
    -- 🚨 Compliance checks
    CASE 
        WHEN at.requires_hospitalization AND NOT EXISTS(SELECT 1 FROM medical.case_rooms cr WHERE cr.case_file_id = cf.id)
        THEN 'MISSING_ROOM'
        WHEN at.requires_package AND NOT EXISTS(SELECT 1 FROM medical.package_assignments pa WHERE pa.case_file_id = cf.id)
        THEN 'MISSING_PACKAGE'
        WHEN at.requires_immediate_payment AND NOT EXISTS(SELECT 1 FROM billing.invoices i WHERE i.case_file_id = cf.id AND i.status = 'paid')
        THEN 'PAYMENT_REQUIRED'
        WHEN cf.is_transfer AND NOT at.allows_transfer
        THEN 'TRANSFER_NOT_ALLOWED'
        ELSE 'COMPLIANT'
    END AS validation_status
    
FROM medical.case_files cf
JOIN medical.admission_types at ON cf.admission_type_id = at.id;

COMMENT ON VIEW medical.v_case_validation IS '🆕 NEW: Validates if cases comply with admission type requirements';

-- ============================================
-- 📝 BUSINESS LOGIC GUIDE
-- ============================================

/*
╔════════════════════════════════════════════════════════════════════════════╗
║                    ADMISSION TYPE LOGIC HANDLING                            ║
╚════════════════════════════════════════════════════════════════════════════╝

1. ✅ REQUIRES_HOSPITALIZATION (REQ_HOSPITALIZACION = S)
   ────────────────────────────────────────────────────────────────────
   Applies to: PROCEDIMIENTO_MEDICO, TRATAMIENTO_MEDICO
   
   Logic:
   - When creating case with these types, system MUST assign a room
   - Check: EXISTS room in medical.case_rooms for this case_file_id
   - UI: Show room assignment as REQUIRED field
   - Validation: Cannot save case without room assignment
   
   Example:
   IF admission_type.requires_hospitalization = TRUE THEN
       -- Force room selection
       -- Validate at least one case_rooms record exists
       IF NOT EXISTS (SELECT 1 FROM medical.case_rooms WHERE case_file_id = NEW.id)
       THEN RAISE EXCEPTION 'Room assignment required for this admission type';


2. ✅ REQUIRES_PACKAGE (REQ_PAQUETE = S)
   ────────────────────────────────────────────────────────────────────
   Applies to: PROCEDIMIENTO_MEDICO
   
   Logic:
   - When creating case with this type, system MUST assign a package
   - Check: EXISTS package in medical.package_assignments for this case_file_id
   - UI: Show package selection as REQUIRED field
   - Validation: Cannot proceed without package
   
   Example:
   IF admission_type.requires_package = TRUE THEN
       -- Force package selection
       -- Validate package_assignments record exists
       IF NOT EXISTS (SELECT 1 FROM medical.package_assignments WHERE case_file_id = NEW.id)
       THEN RAISE EXCEPTION 'Package assignment required for this admission type';


3. ✅ ALLOWS_TRANSFER (APLICA_TRASLADO = S)
   ────────────────────────────────────────────────────────────────────
   Applies to: All except FARMACIA
   
   Logic:
   - Controls if case can transition to TR_TRASLADO_PROCEDIMIENTO status
   - Only these types can have is_transfer = TRUE
   - UI: Show/hide "Transfer" button based on this flag
   - Status validation: Check before allowing status change
   
   Example:
   IF admission_type.allows_transfer = FALSE AND case_file.is_transfer = TRUE THEN
       RAISE EXCEPTION 'This admission type does not allow transfers';
   
   -- When changing status to TR_TRASLADO_PROCEDIMIENTO
   IF NEW.current_status_flow = 'TR_TRASLADO_PROCEDIMIENTO' 
      AND NOT admission_type.allows_transfer 
   THEN
       RAISE EXCEPTION 'Cannot transfer this case type';


4. ✅ REQUIRES_IMMEDIATE_PAYMENT (PAGO_INMEDIATO = S)
   ────────────────────────────────────────────────────────────────────
   Applies to: ELECTROCARDIOGRAMA, FARMACIA, LABORATORIOS, 
               RADIOGRAFIAS, SERVICIOS_VARIOS, ULTRASONIDOS
   
   Logic:
   - Payment MUST be processed before or immediately after case creation
   - Cannot close case without full payment
   - UI: Show payment modal immediately after case creation
   - Status validation: Cannot move to C3_CERRADO without payment
   
   Example:
   IF admission_type.requires_immediate_payment = TRUE THEN
       -- Check if invoice is paid before closing
       IF NEW.current_status_flow = 'C3_CERRADO' THEN
           IF NOT EXISTS (
               SELECT 1 FROM billing.invoices 
               WHERE case_file_id = NEW.id 
               AND status = 'paid'
           ) THEN
               RAISE EXCEPTION 'Immediate payment required before closing case';
           END IF;
       END IF;


5. ✅ CATEGORY (ID_CATEGORIA)
   ────────────────────────────────────────────────────────────────────
   Categories:
   - E = Estudios/Exámenes (Diagnostic studies)
   - P = Procedimientos (Medical procedures)
   - NULL = No specific category
   
   Logic:
   - Use for grouping/filtering in reports
   - UI: Group admission types by category in dropdowns
   - Billing: May have different pricing rules by category
   - Workflow: Different approval flows by category
   
   Example:
   -- Filter by category
   SELECT * FROM medical.admission_types WHERE category = 'E';
   
   -- Group cases by category
   SELECT category, COUNT(*) 
   FROM medical.case_files cf
   JOIN medical.admission_types at ON cf.admission_type_id = at.id
   GROUP BY category;


═══════════════════════════════════════════════════════════════════════════

📋 RECOMMENDED WORKFLOW:

1. Case Creation:
   ┌─────────────────────────────────────────────────┐
   │ 1. Select Patient                               │
   │ 2. Select Admission Type                        │
   │ 3. Based on admission type:                     │
   │    ├─ If requires_hospitalization → Assign Room│
   │    ├─ If requires_package → Select Package     │
   │    └─ If requires_immediate_payment → Process  │
   │       Payment before saving                     │
   │ 4. Save case_file                              │
   └─────────────────────────────────────────────────┘

2. During Case Lifecycle:
   ┌─────────────────────────────────────────────────┐
   │ • Check allows_transfer before enabling         │
   │   transfer button/status                        │
   │ • Validate requirements before status changes   │
   │ • Enforce payment before closure if required    │
   └─────────────────────────────────────────────────┘

3. Case Closure:
   ┌─────────────────────────────────────────────────┐
   │ IF requires_immediate_payment:                  │
   │    ├─ Verify payment status                     │
   │    └─ Block closure if not paid                 │
   │ ELSE:                                           │
   │    └─ Allow closure with pending payment        │
   └─────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════

🔍 VALIDATION QUERIES:

-- Check if case complies with admission type rules
SELECT * FROM medical.v_case_validation 
WHERE validation_status != 'COMPLIANT';

-- Get admission type rules for a case
SELECT 
    cf.case_number,
    at.name AS admission_type,
    at.requires_hospitalization,
    at.requires_package,
    at.allows_transfer,
    at.requires_immediate_payment
FROM medical.case_files cf
JOIN medical.admission_types at ON cf.admission_type_id = at.id
WHERE cf.id = 'case-uuid-here';

-- Cases missing required components
SELECT 
    cf.case_number,
    at.name,
    CASE 
        WHEN at.requires_hospitalization 
             AND NOT EXISTS(SELECT 1 FROM medical.case_rooms WHERE case_file_id = cf.id)
        THEN 'Missing room assignment'
        WHEN at.requires_package 
             AND NOT EXISTS(SELECT 1 FROM medical.package_assignments WHERE case_file_id = cf.id)
        THEN 'Missing package'
        WHEN at.requires_immediate_payment 
             AND NOT EXISTS(SELECT 1 FROM billing.invoices WHERE case_file_id = cf.id AND status = 'paid')
        THEN 'Payment required'
    END AS issue
FROM medical.case_files cf
JOIN medical.admission_types at ON cf.admission_type_id = at.id
WHERE validation_status != 'COMPLIANT';

═══════════════════════════════════════════════════════════════════════════

💡 IMPLEMENTATION TIPS:

1. Frontend Validation:
   - Load admission_type rules when user selects type
   - Show/hide fields based on rules
   - Display warnings/requirements prominently

2. Backend Validation:
   - Validate rules before INSERT/UPDATE
   - Use triggers or application logic
   - Return specific error messages

3. UI/UX Considerations:
   - Use icons to indicate requirements
     ✓ Room required
     ✓ Package required
     💳 Immediate payment
     ↔️ Transfer allowed
   
   - Progressive disclosure: 
     Only show relevant fields based on admission type

4. Reporting:
   - Track compliance rates by admission type
   - Alert on non-compliant cases
   - Dashboard for pending requirements

*/

-- ============================================
-- END OF ADMISSION TYPES INTEGRATION
-- ============================================