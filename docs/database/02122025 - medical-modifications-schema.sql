-- ============================================
-- HOSPITAL DATABASE V3 - UPDATES
-- Changes to MEDICAL and BILLING schemas only
-- CORE and INVENTORY schemas remain untouched
-- ============================================

-- ============================================
-- 🆕 NEW: SHIFT TYPES (TURNOS)
-- Requirement 1: Sistema de turnos hábil/inhábil
-- ============================================

CREATE TYPE medical.shift_type AS ENUM ('daytime', 'nighttime');

COMMENT ON TYPE medical.shift_type IS 'Shift types: daytime (hábil 7:00-17:59), nighttime (inhábil 18:00-6:59)';

-- ============================================
-- 🆕 NEW: CASE FILE STATUS FLOW
-- Requirement 3: Estados del expediente y flujos
-- ============================================

CREATE TYPE medical.case_status_flow AS ENUM (
    'C1_CREACION',
    'C2_CANCELACION', 
    'C3_CERRADO',
    'CE_CARGOS_EXPEDIENTE',
    'CC_CONFIRMACION_CARGOS',
    'TR_TRASLADO_PROCEDIMIENTO',
    'RA_REAPERTURA',
    'EX_EXTORNO'
);

COMMENT ON TYPE medical.case_status_flow IS 'Case file status flow states for tracking';

-- ============================================
-- 🆕 NEW: DISCOUNT TYPES
-- Requirement 4: Tipos de descuentos
-- ============================================

CREATE TYPE billing.discount_type AS ENUM (
    'employee',           -- Colaborador
    'employee_child',     -- Hijo de colaborador
    'owner',             -- Propietario
    'promotional',       -- Promocional
    'insurance',         -- Seguro
    'other'
);

COMMENT ON TYPE billing.discount_type IS 'Types of discounts applicable to case files';

-- ============================================
-- 🆕 NEW: CASH REGISTER TYPES
-- Requirement 5: Tipos de caja
-- ============================================

CREATE TYPE billing.cash_register_type AS ENUM (
    'general',
    'pharmacy',
    'temporary',
    'nighttime',
    'administrative'
);

COMMENT ON TYPE billing.cash_register_type IS 'Types of cash registers: general, pharmacy, temporary, nighttime, administrative';

-- ============================================
-- 🆕 NEW: CASH HANDOVER SOURCE
-- Requirement 6: Origen de entrega de caja
-- ============================================

CREATE TYPE billing.handover_source AS ENUM (
    'laboratory',
    'safe',
    'pharmacy',
    'emergency',
    'general',
    'other'
);

COMMENT ON TYPE billing.handover_source IS 'Source of cash handover';

-- ============================================
-- ✏️ MODIFIED: case_files table
-- Added: shift_type, current_status_flow
-- ============================================

ALTER TABLE medical.case_files 
ADD COLUMN shift_type medical.shift_type NOT NULL DEFAULT 'daytime',
ADD COLUMN current_status_flow medical.case_status_flow NOT NULL DEFAULT 'C1_CREACION',
ADD COLUMN is_transfer BOOLEAN DEFAULT FALSE,
ADD COLUMN transfer_from_case_id UUID REFERENCES medical.case_files(id);

COMMENT ON COLUMN medical.case_files.shift_type IS '🆕 NEW: Shift when case was created (daytime: 7:00-17:59, nighttime: 18:00-6:59)';
COMMENT ON COLUMN medical.case_files.current_status_flow IS '🆕 NEW: Current status in the case flow state machine';
COMMENT ON COLUMN medical.case_files.is_transfer IS '🆕 NEW: Indicates if this case is a transfer from another case';
COMMENT ON COLUMN medical.case_files.transfer_from_case_id IS '🆕 NEW: Reference to original case if this is a transfer';

-- ============================================
-- 🆕 NEW: case_status_history table
-- Requirement 3: Tracking completo del flujo del expediente
-- ============================================

CREATE TABLE medical.case_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID NOT NULL REFERENCES medical.case_files(id) ON DELETE CASCADE,
    from_status medical.case_status_flow NOT NULL,
    to_status medical.case_status_flow NOT NULL,
    transition_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    notes TEXT,
    performed_by UUID REFERENCES core.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_case_status_history_case ON medical.case_status_history(case_file_id);
CREATE INDEX idx_case_status_history_date ON medical.case_status_history(transition_date);

COMMENT ON TABLE medical.case_status_history IS '🆕 NEW: Complete history of case file status transitions';
COMMENT ON COLUMN medical.case_status_history.from_status IS 'Previous status in flow';
COMMENT ON COLUMN medical.case_status_history.to_status IS 'New status in flow';
COMMENT ON COLUMN medical.case_status_history.transition_date IS 'When the transition occurred';
COMMENT ON COLUMN medical.case_status_history.reason IS 'Reason for status change';

-- ============================================
-- 🆕 NEW: case_transfers table
-- Requirement 3: Tracking específico de traslados
-- ============================================

CREATE TABLE medical.case_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_case_id UUID NOT NULL REFERENCES medical.case_files(id),
    transferred_case_id UUID NOT NULL REFERENCES medical.case_files(id),
    transfer_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transfer_reason TEXT NOT NULL,
    from_department VARCHAR(100),
    to_department VARCHAR(100),
    approved_by UUID REFERENCES core.users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_case_transfers_original ON medical.case_transfers(original_case_id);
CREATE INDEX idx_case_transfers_transferred ON medical.case_transfers(transferred_case_id);

COMMENT ON TABLE medical.case_transfers IS '🆕 NEW: Specific tracking for case transfers (TR_TRASLADO_PROCEDIMIENTO)';
COMMENT ON COLUMN medical.case_transfers.original_case_id IS 'Original case file';
COMMENT ON COLUMN medical.case_transfers.transferred_case_id IS 'New case file created from transfer';

-- ============================================
-- ✏️ MODIFIED: case_timeline table
-- Added: status_flow tracking
-- ============================================

ALTER TABLE medical.case_timeline
ADD COLUMN status_flow medical.case_status_flow,
ADD COLUMN shift_type medical.shift_type;

COMMENT ON COLUMN medical.case_timeline.status_flow IS '🆕 NEW: Case status flow at this timeline point';
COMMENT ON COLUMN medical.case_timeline.shift_type IS '🆕 NEW: Shift type when this timeline event occurred';

-- ============================================
-- 🆕 NEW: case_discounts table
-- Requirement 4: Descuentos aplicados a expedientes
-- ============================================

CREATE TABLE billing.case_discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID NOT NULL REFERENCES medical.case_files(id) ON DELETE CASCADE,
    discount_type billing.discount_type NOT NULL,
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(12,2) NOT NULL,
    is_percentage BOOLEAN DEFAULT TRUE,
    reason TEXT,
    approved_by UUID REFERENCES core.users(id),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX idx_case_discounts_case ON billing.case_discounts(case_file_id);
CREATE INDEX idx_case_discounts_type ON billing.case_discounts(discount_type);

COMMENT ON TABLE billing.case_discounts IS '🆕 NEW: Discounts applied to case files (employee, employee_child, owner, etc.)';
COMMENT ON COLUMN billing.case_discounts.discount_type IS 'Type of discount: employee, employee_child, owner, promotional';
COMMENT ON COLUMN billing.case_discounts.discount_percentage IS 'Percentage if is_percentage is true (can be 100% for owner)';
COMMENT ON COLUMN billing.case_discounts.discount_amount IS 'Absolute discount amount';
COMMENT ON COLUMN billing.case_discounts.is_percentage IS 'True if discount is percentage-based, false if fixed amount';

-- ============================================
-- 🆕 NEW: cash_registers table
-- Requirement 5: Cajas del sistema
-- ============================================

CREATE TABLE billing.cash_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    register_type billing.cash_register_type NOT NULL,
    assigned_user_id UUID REFERENCES core.users(id),
    opening_balance DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    opened_at TIMESTAMP,
    closed_at TIMESTAMP,
    -- For administrative cash register monthly periods
    period_start_date DATE,
    period_end_date DATE,
    is_monthly_closed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cash_registers_type ON billing.cash_registers(register_type);
CREATE INDEX idx_cash_registers_user ON billing.cash_registers(assigned_user_id);
CREATE INDEX idx_cash_registers_period ON billing.cash_registers(period_start_date, period_end_date) 
    WHERE register_type = 'administrative';

COMMENT ON TABLE billing.cash_registers IS '🆕 NEW: Cash registers (general, pharmacy, temporary, nighttime, administrative)';
COMMENT ON COLUMN billing.cash_registers.register_type IS 'Type: general, pharmacy, temporary, nighttime, administrative';
COMMENT ON COLUMN billing.cash_registers.period_start_date IS 'For administrative register: start of month (day 1)';
COMMENT ON COLUMN billing.cash_registers.period_end_date IS 'For administrative register: end of month (day 30/31)';
COMMENT ON COLUMN billing.cash_registers.is_monthly_closed IS 'For administrative register: if period is closed';

-- ============================================
-- 🆕 NEW: cash_register_movements table
-- Movement tracking for cash registers
-- ============================================

CREATE TABLE billing.cash_register_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cash_register_id UUID NOT NULL REFERENCES billing.cash_registers(id),
    movement_type VARCHAR(50) NOT NULL, -- income, expense, opening, closing, adjustment
    amount DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    payment_id UUID REFERENCES billing.payments(id),
    reference_type VARCHAR(50), -- invoice, expense, adjustment
    reference_id UUID,
    description TEXT NOT NULL,
    shift_type medical.shift_type,
    performed_by UUID REFERENCES core.users(id),
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX idx_cash_movements_register ON billing.cash_register_movements(cash_register_id);
CREATE INDEX idx_cash_movements_date ON billing.cash_register_movements(movement_date);
CREATE INDEX idx_cash_movements_type ON billing.cash_register_movements(movement_type);

COMMENT ON TABLE billing.cash_register_movements IS '🆕 NEW: All movements in cash registers (income, expense, adjustments)';
COMMENT ON COLUMN billing.cash_register_movements.movement_type IS 'income, expense, opening, closing, adjustment, transfer';
COMMENT ON COLUMN billing.cash_register_movements.balance_after IS 'Cash register balance after this movement';

-- ============================================
-- 🆕 NEW: cash_handovers table
-- Requirement 6: Entrega de caja
-- ============================================

CREATE TABLE billing.cash_handovers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handover_number VARCHAR(30) UNIQUE NOT NULL,
    cash_register_id UUID NOT NULL REFERENCES billing.cash_registers(id),
    from_user_id UUID NOT NULL REFERENCES core.users(id),
    to_user_id UUID NOT NULL REFERENCES core.users(id),
    handover_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closing_date TIMESTAMP,
    source billing.handover_source NOT NULL,
    handover_type VARCHAR(50) NOT NULL, -- shift_change, end_of_day, emergency, monthly_close
    
    -- Amounts
    expected_amount DECIMAL(12,2) NOT NULL,
    actual_amount DECIMAL(12,2) NOT NULL,
    difference DECIMAL(12,2) GENERATED ALWAYS AS (actual_amount - expected_amount) STORED,
    
    -- Breakdown by denomination (optional)
    cash_breakdown JSONB,
    
    observations TEXT,
    discrepancy_reason TEXT,
    is_closed BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES core.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cash_handovers_register ON billing.cash_handovers(cash_register_id);
CREATE INDEX idx_cash_handovers_from_user ON billing.cash_handovers(from_user_id);
CREATE INDEX idx_cash_handovers_to_user ON billing.cash_handovers(to_user_id);
CREATE INDEX idx_cash_handovers_date ON billing.cash_handovers(handover_date);

COMMENT ON TABLE billing.cash_handovers IS '🆕 NEW: Cash register handovers (entrega de caja entre usuarios)';
COMMENT ON COLUMN billing.cash_handovers.from_user_id IS 'User delivering the cash';
COMMENT ON COLUMN billing.cash_handovers.to_user_id IS 'User receiving the cash';
COMMENT ON COLUMN billing.cash_handovers.source IS 'Source: laboratory, safe, pharmacy, emergency, general';
COMMENT ON COLUMN billing.cash_handovers.handover_type IS 'Type: shift_change, end_of_day, emergency, monthly_close';
COMMENT ON COLUMN billing.cash_handovers.expected_amount IS 'Expected amount according to system';
COMMENT ON COLUMN billing.cash_handovers.actual_amount IS 'Actual amount counted';
COMMENT ON COLUMN billing.cash_handovers.difference IS 'Calculated difference (positive = surplus, negative = shortage)';
COMMENT ON COLUMN billing.cash_handovers.cash_breakdown IS 'JSON with denomination breakdown: {bills: {100: 5, 50: 10}, coins: {1: 20}}';

-- ============================================
-- 🆕 NEW: administrative_expenses table
-- Requirement 7: Gastos de caja administrativa
-- ============================================

CREATE TABLE billing.administrative_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cash_register_id UUID NOT NULL REFERENCES billing.cash_registers(id),
    expense_number VARCHAR(30) UNIQUE NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(100) NOT NULL, -- payroll, utilities, supplies, maintenance, other
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    supplier_id UUID REFERENCES inventory.suppliers(id),
    approved_by UUID REFERENCES core.users(id),
    payment_method billing.payment_method,
    receipt_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id),
    
    -- Ensure it's within the administrative register period
    CONSTRAINT chk_expense_in_period CHECK (
        expense_date >= (SELECT period_start_date FROM billing.cash_registers WHERE id = cash_register_id) AND
        expense_date <= (SELECT period_end_date FROM billing.cash_registers WHERE id = cash_register_id)
    )
);

CREATE INDEX idx_admin_expenses_register ON billing.administrative_expenses(cash_register_id);
CREATE INDEX idx_admin_expenses_date ON billing.administrative_expenses(expense_date);
CREATE INDEX idx_admin_expenses_category ON billing.administrative_expenses(category);

COMMENT ON TABLE billing.administrative_expenses IS '🆕 NEW: Expenses for administrative cash register (monthly period)';
COMMENT ON COLUMN billing.administrative_expenses.cash_register_id IS 'Must be an administrative type cash register';
COMMENT ON COLUMN billing.administrative_expenses.category IS 'payroll, utilities, supplies, maintenance, services, other';
COMMENT ON COLUMN billing.administrative_expenses.expense_date IS 'Must be within cash register period (month)';

-- ============================================
-- ✏️ MODIFIED: invoices table
-- Added: discount and cash register reference
-- ============================================

ALTER TABLE billing.invoices
ADD COLUMN discount_id UUID REFERENCES billing.case_discounts(id),
ADD COLUMN cash_register_id UUID REFERENCES billing.cash_registers(id),
ADD COLUMN shift_type medical.shift_type;

COMMENT ON COLUMN billing.invoices.discount_id IS '🆕 NEW: Applied discount reference';
COMMENT ON COLUMN billing.invoices.cash_register_id IS '🆕 NEW: Cash register where invoice was created';
COMMENT ON COLUMN billing.invoices.shift_type IS '🆕 NEW: Shift when invoice was created';

-- ============================================
-- ✏️ MODIFIED: payments table
-- Added: cash register reference
-- ============================================

ALTER TABLE billing.payments
ADD COLUMN cash_register_id UUID REFERENCES billing.cash_registers(id),
ADD COLUMN shift_type medical.shift_type;

COMMENT ON COLUMN billing.payments.cash_register_id IS '🆕 NEW: Cash register where payment was processed';
COMMENT ON COLUMN billing.payments.shift_type IS '🆕 NEW: Shift when payment was made';

-- ============================================
-- 🆕 NEW: Validation for case status flow transitions
-- ============================================

CREATE TABLE medical.valid_status_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_status medical.case_status_flow NOT NULL,
    to_status medical.case_status_flow NOT NULL,
    description TEXT,
    requires_approval BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(from_status, to_status)
);

COMMENT ON TABLE medical.valid_status_transitions IS '🆕 NEW: Valid transitions in case status flow (state machine rules)';

-- Insert valid transitions from requirement
INSERT INTO medical.valid_status_transitions (from_status, to_status, description) VALUES
('C1_CREACION', 'C2_CANCELACION', 'Cancelar expediente recién creado'),
('C1_CREACION', 'CE_CARGOS_EXPEDIENTE', 'Agregar cargos al expediente'),
('C1_CREACION', 'TR_TRASLADO_PROCEDIMIENTO', 'Trasladar a otro procedimiento'),
('C2_CANCELACION', 'C3_CERRADO', 'Cerrar expediente cancelado'),
('C3_CERRADO', 'RA_REAPERTURA', 'Reabrir expediente cerrado'),
('CC_CONFIRMACION_CARGOS', 'C2_CANCELACION', 'Cancelar después de confirmar cargos'),
('CC_CONFIRMACION_CARGOS', 'C3_CERRADO', 'Cerrar después de confirmar cargos'),
('CE_CARGOS_EXPEDIENTE', 'CC_CONFIRMACION_CARGOS', 'Confirmar los cargos agregados'),
('EX_EXTORNO', 'CE_CARGOS_EXPEDIENTE', 'Revertir extorno a cargos'),
('EX_EXTORNO', 'CC_CONFIRMACION_CARGOS', 'Revertir extorno a confirmación'),
('EX_EXTORNO', 'C3_CERRADO', 'Cerrar después de extorno'),
('RA_REAPERTURA', 'EX_EXTORNO', 'Extornar después de reabrir'),
('RA_REAPERTURA', 'CE_CARGOS_EXPEDIENTE', 'Agregar cargos después de reabrir'),
('RA_REAPERTURA', 'CC_CONFIRMACION_CARGOS', 'Confirmar cargos después de reabrir'),
('RA_REAPERTURA', 'C3_CERRADO', 'Cerrar después de reabrir'),
('TR_TRASLADO_PROCEDIMIENTO', 'CE_CARGOS_EXPEDIENTE', 'Agregar cargos después de traslado'),
('TR_TRASLADO_PROCEDIMIENTO', 'CC_CONFIRMACION_CARGOS', 'Confirmar cargos después de traslado');

-- ============================================
-- 🆕 NEW: Functions for business logic
-- ============================================

-- Function to determine shift type based on timestamp
CREATE OR REPLACE FUNCTION medical.get_shift_type(check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
RETURNS medical.shift_type AS $$
DECLARE
    hour_of_day INTEGER;
BEGIN
    -- Extract hour in Guatemala timezone (GMT-6)
    hour_of_day := EXTRACT(HOUR FROM check_time AT TIME ZONE 'America/Guatemala');
    
    -- Daytime: 7:00 - 17:59 (hours 7-17)
    -- Nighttime: 18:00 - 6:59 (hours 18-23, 0-6)
    IF hour_of_day >= 7 AND hour_of_day < 18 THEN
        RETURN 'daytime'::medical.shift_type;
    ELSE
        RETURN 'nighttime'::medical.shift_type;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION medical.get_shift_type IS '🆕 NEW: Determines shift type based on Guatemala time (daytime: 7:00-17:59, nighttime: 18:00-6:59)';

-- Function to validate case status transition
CREATE OR REPLACE FUNCTION medical.is_valid_transition(
    p_from_status medical.case_status_flow,
    p_to_status medical.case_status_flow
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM medical.valid_status_transitions 
        WHERE from_status = p_from_status 
        AND to_status = p_to_status 
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION medical.is_valid_transition IS '🆕 NEW: Validates if a case status transition is allowed';

-- Trigger to automatically set shift_type on case creation
CREATE OR REPLACE FUNCTION medical.set_case_shift_type()
RETURNS TRIGGER AS $$
BEGIN
    NEW.shift_type := medical.get_shift_type(NEW.admission_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_case_shift_type
BEFORE INSERT ON medical.case_files
FOR EACH ROW
EXECUTE FUNCTION medical.set_case_shift_type();

COMMENT ON TRIGGER trg_set_case_shift_type ON medical.case_files IS '🆕 NEW: Auto-set shift type when case is created';

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION medical.log_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.current_status_flow != NEW.current_status_flow) THEN
        -- Validate transition
        IF NOT medical.is_valid_transition(OLD.current_status_flow, NEW.current_status_flow) THEN
            RAISE EXCEPTION 'Invalid status transition from % to %', OLD.current_status_flow, NEW.current_status_flow;
        END IF;
        
        -- Log the transition
        INSERT INTO medical.case_status_history (
            case_file_id,
            from_status,
            to_status,
            performed_by,
            transition_date
        ) VALUES (
            NEW.id,
            OLD.current_status_flow,
            NEW.current_status_flow,
            current_setting('app.current_user_id', TRUE)::UUID,
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_case_status_change
AFTER UPDATE ON medical.case_files
FOR EACH ROW
EXECUTE FUNCTION medical.log_case_status_change();

COMMENT ON TRIGGER trg_log_case_status_change ON medical.case_files IS '🆕 NEW: Auto-log case status changes and validate transitions';

-- ============================================
-- 🆕 NEW: Useful views
-- ============================================

-- View for case status flow tracking
CREATE VIEW medical.v_case_status_flow AS
SELECT 
    cf.id AS case_id,
    cf.case_number,
    p.first_name || ' ' || p.last_name AS patient_name,
    cf.current_status_flow,
    cf.admission_date,
    cf.shift_type AS admission_shift,
    cf.is_transfer,
    COUNT(csh.id) AS status_change_count,
    MAX(csh.transition_date) AS last_status_change
FROM medical.case_files cf
JOIN medical.patients p ON cf.patient_id = p.id
LEFT JOIN medical.case_status_history csh ON cf.id = csh.case_file_id
GROUP BY cf.id, cf.case_number, patient_name, cf.current_status_flow, 
         cf.admission_date, cf.shift_type, cf.is_transfer;

COMMENT ON VIEW medical.v_case_status_flow IS '🆕 NEW: Summary of case status flow';

-- View for cash register balances
CREATE VIEW billing.v_cash_register_balances AS
SELECT 
    cr.id,
    cr.code,
    cr.name,
    cr.register_type,
    u.full_name AS assigned_user,
    cr.opening_balance,
    cr.current_balance,
    cr.is_active,
    cr.opened_at,
    cr.period_start_date,
    cr.period_end_date,
    COUNT(crm.id) AS movement_count,
    SUM(CASE WHEN crm.movement_type = 'income' THEN crm.amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN crm.movement_type = 'expense' THEN crm.amount ELSE 0 END) AS total_expenses
FROM billing.cash_registers cr
LEFT JOIN core.users u ON cr.assigned_user_id = u.id
LEFT JOIN billing.cash_register_movements crm ON cr.id = crm.cash_register_id
GROUP BY cr.id, cr.code, cr.name, cr.register_type, u.full_name, 
         cr.opening_balance, cr.current_balance, cr.is_active, 
         cr.opened_at, cr.period_start_date, cr.period_end_date;

COMMENT ON VIEW billing.v_cash_register_balances IS '🆕 NEW: Summary of cash register balances and movements';

-- ============================================
-- 📊 Sample data for testing
-- ============================================

-- Sample valid administrative cash register (current month)
INSERT INTO billing.cash_registers (
    code, name, register_type, opening_balance, current_balance,
    period_start_date, period_end_date, is_active
) VALUES (
    'CA001',
    'Caja Administrativa Diciembre 2024',
    'administrative',
    0.00,
    0.00,
    '2024-12-01',
    '2024-12-31',
    TRUE
);

-- ============================================
-- END OF UPDATES
-- ============================================

/*
SUMMARY OF CHANGES:

✅ Requirement 1 - Shift System:
   - Added medical.shift_type ENUM
   - Added shift_type column to case_files
   - Created get_shift_type() function (Guatemala timezone)
   - Trigger to auto-set shift on case creation

✅ Requirement 2 - Case Registration Shift:
   - case_files.shift_type tracks if created in daytime/nighttime

✅ Requirement 3 - Case Status Flow & Transfers:
   - Added medical.case_status_flow ENUM (8 states)
   - Added case_status_history table for complete tracking
   - Added case_transfers table for transfer tracking
   - Added valid_status_transitions table with all valid flows
   - Trigger to validate and log status changes
   - case_timeline can track status_flow changes

✅ Requirement 4 - Discounts:
   - Added billing.discount_type ENUM
   - Created case_discounts table
   - Supports employee, employee_child, owner (100% or variable)

✅ Requirement 5 - Cash Register Types:
   - Added billing.cash_register_type ENUM
   - Created cash_registers table
   - Supports: general, pharmacy, temporary, nighttime, administrative

✅ Requirement 6 - Cash Handovers:
   - Created cash_handovers table
   - Tracks from_user, to_user, amounts, differences
   - Source tracking (laboratory, safe, etc.)
   - Cash breakdown in JSONB

✅ Requirement 7 - Administrative Cash Register:
   - cash_registers with monthly periods (period_start_date, period_end_date)
   - Created administrative_expenses table
   - Constraint to ensure expenses within period
   - Monthly closing mechanism (is_monthly_closed)

All tables properly indexed and commented with 🆕 NEW markers.
CORE and INVENTORY schemas remain completely untouched.
*/