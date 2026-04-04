-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM - POSTGRESQL
-- Professional Medical Sanatorium Database
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- SCHEMAS
-- ============================================

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS medical;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS billing;

-- ============================================
-- CUSTOM TYPES
-- ============================================

-- Core Types
CREATE TYPE core.user_role AS ENUM (
    'super_admin', 'admin', 'doctor', 'nurse', 
    'pharmacist', 'receptionist', 'lab_technician', 
    'billing_staff', 'warehouse_manager'
);

CREATE TYPE core.permission_type AS ENUM (
    'create', 'read', 'update', 'delete', 'approve', 'cancel'
);

CREATE TYPE core.audit_action AS ENUM (
    'insert', 'update', 'delete', 'login', 'logout', 'access'
);

-- Medical Types
CREATE TYPE medical.gender_type AS ENUM ('male', 'female', 'other');

CREATE TYPE medical.blood_type AS ENUM (
    'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'
);

CREATE TYPE medical.appointment_status AS ENUM (
    'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
);

CREATE TYPE medical.case_status AS ENUM (
    'active', 'in_treatment', 'hospitalized', 'surgery_scheduled', 
    'recovering', 'discharged', 'transferred', 'deceased'
);

CREATE TYPE medical.doctor_type AS ENUM ('internal', 'external');

CREATE TYPE medical.room_status AS ENUM (
    'available', 'occupied', 'maintenance', 'cleaning', 'reserved'
);

CREATE TYPE medical.operation_complexity AS ENUM (
    'minor', 'intermediate', 'major', 'critical'
);

CREATE TYPE medical.shift_type AS ENUM (
    'daytime', 'nighttime'
);
COMMENT ON TYPE medical.shift_type IS 'Shift types: daytime (hábil 7:00-17:59), nighttime (inhábil 18:00-6:59)';

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

-- Inventory Types
CREATE TYPE inventory.movement_type AS ENUM (
    'purchase', 'sale', 'adjustment', 'transfer', 'return', 'dispatch', 'reception'
);

CREATE TYPE inventory.purchase_status AS ENUM (
    'draft', 'pending', 'approved', 'received', 'cancelled', 'closed'
);

CREATE TYPE inventory.payment_terms AS ENUM (
    'immediate', 'one_payment', 'two_payments', 'three_payments'
);

-- Billing Types
CREATE TYPE billing.payment_status AS ENUM (
    'pending', 'partial', 'paid', 'overdue', 'cancelled'
);

CREATE TYPE billing.payment_method AS ENUM (
    'cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'insurance'
);

CREATE TYPE billing.payment_category AS ENUM (
    'consultation', 'hospitalization', 'surgery', 'laboratory', 
    'pharmacy', 'emergency', 'package', 'supplier_payment', 'other'
);

-- ============================================
-- CORE SCHEMA - Security & Users
-- ============================================

CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role core.user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE core.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action core.permission_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE core.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role core.user_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES core.permissions(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES core.users(id),
    UNIQUE(role, permission_id)
);

CREATE TABLE core.user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.users(id),
    permission_id UUID NOT NULL REFERENCES core.permissions(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES core.users(id),
    UNIQUE(user_id, permission_id)
);

CREATE TABLE core.jwt_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.users(id),
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE core.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES core.users(id),
    action core.audit_action NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MEDICAL SCHEMA - Core Medical Data
-- ============================================

CREATE TABLE medical.specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE medical.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES core.users(id),
    medical_license VARCHAR(50) UNIQUE NOT NULL,
    specialty_id UUID REFERENCES medical.specialties(id),
    doctor_type medical.doctor_type NOT NULL DEFAULT 'internal',
    consultation_fee DECIMAL(10,2),
    surgery_fee DECIMAL(10,2),
    identification_number VARCHAR(30) UNIQUE, 
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medical.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_number VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    identification_number VARCHAR(30) UNIQUE,
    date_of_birth DATE NOT NULL,
    gender medical.gender_type NOT NULL,
    blood_type medical.blood_type,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    allergies TEXT[],
    chronic_conditions TEXT[],
    current_medications TEXT[],
    insurance_company VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id)
);

-- Service Types Catalog
CREATE TABLE medical.service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- diagnostic, hospitalization, pharmacy, emergency, laboratory
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical Services
CREATE TABLE medical.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    service_type_id UUID NOT NULL REFERENCES medical.service_types(id),
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    estimated_duration_minutes INT,
    requires_preparation BOOLEAN DEFAULT FALSE,
    preparation_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical Packages
CREATE TABLE medical.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    service_id UUID NOT NULL REFERENCES medical.services(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    doctor_type medical.doctor_type NOT NULL,
    internal_doctor_price DECIMAL(12,2),
    external_doctor_price DECIMAL(12,2),
    validity_days INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),
    CONSTRAINT chk_package_price CHECK (
        (doctor_type = 'internal' AND internal_doctor_price IS NOT NULL) OR
        (doctor_type = 'external' AND external_doctor_price IS NOT NULL) OR
        (internal_doctor_price IS NOT NULL AND external_doctor_price IS NOT NULL)
    )
);

CREATE TABLE medical.package_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES medical.packages(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES inventory.products(id),
    quantity INT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0)
);

-- Case File (Expediente) - Central patient journey tracking
CREATE TABLE medical.case_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES medical.patients(id),
    admission_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    discharge_date TIMESTAMP,
    admission_type VARCHAR(50) NOT NULL, -- emergency, scheduled, transfer
    chief_complaint TEXT NOT NULL,
    initial_diagnosis TEXT,
    final_diagnosis TEXT,
    case_status medical.case_status NOT NULL DEFAULT 'active',
    total_cost DECIMAL(12,2) DEFAULT 0,
    shift_type medical.shift_type NOT NULL DEFAULT 'daytime', 
    current_status_flow medical.case_status_flow NOT NULL DEFAULT 'C1_CREACION',
    is_transfer BOOLEAN DEFAULT FALSE,
    transfer_from_case_id UUID REFERENCES medical.case_files(id), 
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id)
);

-- Case File Timeline - Track patient journey through different stages
CREATE TABLE medical.case_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID NOT NULL REFERENCES medical.case_files(id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL, -- emergency, consultation, hospitalization, surgery, recovery, discharge
    service_type_id UUID REFERENCES medical.service_types(id),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    notes TEXT,
    created_by UUID REFERENCES core.users(id), 
    status_flow medical.case_status_flow, 
    shift_type medical.shift_type
);

-- Case Doctors - Track which doctors are involved in a case
CREATE TABLE medical.case_doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID NOT NULL REFERENCES medical.case_files(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES medical.doctors(id),
    role VARCHAR(100) NOT NULL, -- primary, consultant, surgeon, anesthesiologist
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    removed_at TIMESTAMP,
    notes TEXT,
    UNIQUE(case_file_id, doctor_id, role)
);

-- packages assignaments 
CREATE TABLE medical.case_package_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID NOT NULL REFERENCES medical.case_files(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES medical.packages(id),
    doctor_id UUID NOT NULL REFERENCES medical.doctors(id),
    doctor_type_used medical.doctor_type NOT NULL,
    price_applied DECIMAL(12,2) NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES core.users(id),
    inventory_deducted BOOLEAN DEFAULT FALSE,
    inventory_deducted_at TIMESTAMP,
    notes TEXT,
    UNIQUE(case_file_id, package_id)
);

-- Rooms
CREATE TABLE medical.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- standard, premium, icu, pediatric
    floor INT,
    capacity INT NOT NULL DEFAULT 1,
    daily_rate DECIMAL(10,2) NOT NULL,
    has_bathroom BOOLEAN DEFAULT TRUE,
    has_oxygen BOOLEAN DEFAULT FALSE,
    has_monitor BOOLEAN DEFAULT FALSE,
    equipment JSONB,
    status medical.room_status DEFAULT 'available',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Case Rooms - Track room usage for cases
CREATE TABLE medical.case_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID NOT NULL REFERENCES medical.case_files(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES medical.rooms(id),
    check_in TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMP,
    daily_rate DECIMAL(10,2) NOT NULL,
    notes TEXT
);

-- Operations Catalog
CREATE TABLE medical.operation_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    specialty_id UUID REFERENCES medical.specialties(id),
    complexity medical.operation_complexity NOT NULL,
    estimated_duration_minutes INT,
    base_cost DECIMAL(12,2) NOT NULL,
    anesthesia_required BOOLEAN DEFAULT TRUE,
    pre_operative_requirements TEXT[],
    post_operative_care TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- case file history
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

-- case file transfers
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

-- Operation Scheduler
CREATE TABLE medical.scheduled_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID NOT NULL REFERENCES medical.case_files(id),
    operation_type_id UUID NOT NULL REFERENCES medical.operation_types(id),
    primary_surgeon_id UUID NOT NULL REFERENCES medical.doctors(id),
    anesthesiologist_id UUID REFERENCES medical.doctors(id),
    scheduled_date TIMESTAMP NOT NULL,
    estimated_duration_minutes INT NOT NULL,
    operating_room VARCHAR(50),
    pre_operative_notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, postponed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operation Team
CREATE TABLE medical.operation_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheduled_operation_id UUID NOT NULL REFERENCES medical.scheduled_operations(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES medical.doctors(id),
    role VARCHAR(100) NOT NULL, -- surgeon, assistant, anesthesiologist, nurse
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operation Records
CREATE TABLE medical.operation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheduled_operation_id UUID UNIQUE NOT NULL REFERENCES medical.scheduled_operations(id),
    actual_start_time TIMESTAMP NOT NULL,
    actual_end_time TIMESTAMP NOT NULL,
    anesthesia_type VARCHAR(100),
    procedure_performed TEXT NOT NULL,
    findings TEXT,
    complications TEXT,
    blood_loss_ml INT,
    specimens_sent TEXT[],
    post_operative_orders TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id)
);

-- Case Services - Extra services not included in package
CREATE TABLE medical.case_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID NOT NULL REFERENCES medical.case_files(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES medical.services(id),
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    applied_by UUID REFERENCES core.users(id)
);

-- Consultations
CREATE TABLE medical.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID REFERENCES medical.case_files(id),
    patient_id UUID NOT NULL REFERENCES medical.patients(id),
    doctor_id UUID NOT NULL REFERENCES medical.doctors(id),
    consultation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT NOT NULL,
    vital_signs JSONB, -- {bp, temp, pulse, respiratory_rate, oxygen_saturation, weight, height}
    physical_examination TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    prescriptions JSONB,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Laboratory Tests
CREATE TABLE medical.lab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID REFERENCES medical.case_files(id),
    patient_id UUID NOT NULL REFERENCES medical.patients(id),
    service_id UUID NOT NULL REFERENCES medical.services(id),
    ordered_by UUID NOT NULL REFERENCES medical.doctors(id),
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sample_collected_at TIMESTAMP,
    result_date TIMESTAMP,
    results JSONB,
    interpretation TEXT,
    status VARCHAR(50) DEFAULT 'ordered', -- ordered, collected, in_progress, completed, cancelled
    is_urgent BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- ============================================
-- INVENTORY SCHEMA
-- ============================================

CREATE TABLE inventory.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200),
    tax_id VARCHAR(50),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    payment_terms inventory.payment_terms DEFAULT 'immediate',
    credit_days INT DEFAULT 0,
    credit_limit DECIMAL(12,2),
    current_balance DECIMAL(12,2) DEFAULT 0,
    bank_account VARCHAR(100),
    bank_name VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    manager_id UUID REFERENCES core.users(id),
    capacity_m3 DECIMAL(10,2),
    temperature_controlled BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES inventory.product_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(200) NOT NULL,
    category_id UUID NOT NULL REFERENCES inventory.product_categories(id),
    description TEXT,
    unit_of_measure VARCHAR(50) NOT NULL, -- unit, box, bottle, vial, etc
    minimum_stock INT DEFAULT 10,
    maximum_stock INT,
    reorder_point INT,
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    requires_prescription BOOLEAN DEFAULT FALSE,
    requires_refrigeration BOOLEAN DEFAULT FALSE,
    expiration_alert_days INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders
CREATE TABLE inventory.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(30) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES inventory.suppliers(id),
    warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal DECIMAL(12,2) NOT NULL,
    tax DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    payment_terms inventory.payment_terms NOT NULL DEFAULT 'immediate',
    status inventory.purchase_status DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id),
    approved_by UUID REFERENCES core.users(id),
    approved_at TIMESTAMP
);

CREATE TABLE inventory.purchase_order_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES inventory.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES inventory.products(id),
    quantity INT NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    received_quantity INT DEFAULT 0,
    expiration_date DATE,
    batch_number VARCHAR(100),
    notes TEXT
);

-- Warehouse Stock
CREATE TABLE inventory.warehouse_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id),
    product_id UUID NOT NULL REFERENCES inventory.products(id),
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    available_quantity INT GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, product_id)
);

-- Stock Movements
CREATE TABLE inventory.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movement_number VARCHAR(30) UNIQUE NOT NULL,
    movement_type inventory.movement_type NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id),
    product_id UUID NOT NULL REFERENCES inventory.products(id),
    quantity INT NOT NULL,
    unit_cost DECIMAL(10,2),
    reference_type VARCHAR(50), -- purchase_order, case_file, adjustment
    reference_id UUID,
    batch_number VARCHAR(100),
    expiration_date DATE,
    notes TEXT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id)
);

-- ============================================
-- BILLING SCHEMA
-- ============================================

-- General Payments Table (unified)
CREATE TABLE billing.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(30) UNIQUE NOT NULL,
    payment_category billing.payment_category NOT NULL,
    reference_type VARCHAR(50) NOT NULL, -- case_file, consultation, purchase_order, supplier
    reference_id UUID NOT NULL,
    payer_type VARCHAR(50), -- patient, insurance, other
    payer_id UUID, -- patient_id or insurance company reference
    amount DECIMAL(12,2) NOT NULL,
    payment_method billing.payment_method NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_reference VARCHAR(100),
    bank_name VARCHAR(100),
    check_number VARCHAR(50),
    card_last_four VARCHAR(4),
    notes TEXT,
    status billing.payment_status DEFAULT 'paid',
    is_refund BOOLEAN DEFAULT FALSE,
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id)
);

-- Supplier Payment Schedule (for installment payments)
CREATE TABLE billing.supplier_payment_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES inventory.purchase_orders(id),
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    status billing.payment_status DEFAULT 'pending',
    notes TEXT,
    UNIQUE(purchase_order_id, installment_number)
);

-- Invoices for Case Files
CREATE TABLE billing.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    case_file_id UUID NOT NULL REFERENCES medical.case_files(id),
    patient_id UUID NOT NULL REFERENCES medical.patients(id),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(12,2) NOT NULL,
    tax DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    balance DECIMAL(12,2) GENERATED ALWAYS AS (total - paid_amount) STORED,
    status billing.payment_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id)
);

CREATE TABLE billing.invoice_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES billing.invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    item_type VARCHAR(50), -- service, package, room, medication, lab_test
    item_id UUID,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL
);

-- ============================================
-- INDEXES FOR OPTIMIZATION
-- ============================================

-- Core Schema
CREATE INDEX idx_users_username ON core.users(username);
CREATE INDEX idx_users_email ON core.users(email);
CREATE INDEX idx_users_role ON core.users(role);
CREATE INDEX idx_jwt_tokens_user ON core.jwt_tokens(user_id);
CREATE INDEX idx_jwt_tokens_expires ON core.jwt_tokens(expires_at);
CREATE INDEX idx_audit_logs_user ON core.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON core.audit_logs(created_at);

-- Medical Schema
CREATE INDEX idx_patients_file_number ON medical.patients(file_number);
CREATE INDEX idx_patients_identification ON medical.patients(identification_number);
CREATE INDEX idx_patients_name ON medical.patients(first_name, last_name);
CREATE INDEX idx_case_files_patient ON medical.case_files(patient_id);
CREATE INDEX idx_case_files_status ON medical.case_files(case_status);
CREATE INDEX idx_case_files_dates ON medical.case_files(admission_date, discharge_date);
CREATE INDEX idx_case_timeline_case ON medical.case_timeline(case_file_id);
CREATE INDEX idx_case_doctors_case ON medical.case_doctors(case_file_id);
CREATE INDEX idx_case_doctors_doctor ON medical.case_doctors(doctor_id);
CREATE INDEX idx_case_rooms_case ON medical.case_rooms(case_file_id);
CREATE INDEX idx_scheduled_ops_date ON medical.scheduled_operations(scheduled_date);
CREATE INDEX idx_consultations_patient ON medical.consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON medical.consultations(doctor_id);
CREATE INDEX idx_case_package_assignments_case ON medical.case_package_assignments(case_file_id);
CREATE INDEX idx_case_package_assignments_package ON medical.case_package_assignments(package_id);
CREATE INDEX idx_case_package_assignments_doctor ON medical.case_package_assignments(doctor_id);
CREATE INDEX idx_case_status_history_case ON medical.case_status_history(case_file_id);
CREATE INDEX idx_case_status_history_date ON medical.case_status_history(transition_date);
CREATE INDEX idx_case_transfers_original ON medical.case_transfers(original_case_id);
CREATE INDEX idx_case_transfers_transferred ON medical.case_transfers(transferred_case_id);

-- Inventory Schema
CREATE INDEX idx_products_code ON inventory.products(code);
CREATE INDEX idx_products_category ON inventory.products(category_id);
CREATE INDEX idx_purchase_orders_supplier ON inventory.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON inventory.purchase_orders(status);
CREATE INDEX idx_warehouse_stock_warehouse ON inventory.warehouse_stock(warehouse_id);
CREATE INDEX idx_warehouse_stock_product ON inventory.warehouse_stock(product_id);
CREATE INDEX idx_stock_movements_warehouse ON inventory.stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_product ON inventory.stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON inventory.stock_movements(movement_date);

-- Billing Schema
CREATE INDEX idx_payments_category ON billing.payments(payment_category);
CREATE INDEX idx_payments_reference ON billing.payments(reference_type, reference_id);
CREATE INDEX idx_payments_date ON billing.payments(payment_date);
CREATE INDEX idx_invoices_case ON billing.invoices(case_file_id);
CREATE INDEX idx_invoices_patient ON billing.invoices(patient_id);
CREATE INDEX idx_invoices_status ON billing.invoices(status);

-- ============================================
-- TRIGGERS FOR AUDIT
-- ============================================

CREATE OR REPLACE FUNCTION core.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO core.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (
            current_setting('app.current_user_id', TRUE)::UUID,
            'update',
            TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO core.audit_logs (user_id, action, table_name, record_id, old_values)
        VALUES (
            current_setting('app.current_user_id', TRUE)::UUID,
            'delete',
            TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
        RETURN OLD;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO core.audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (
            current_setting('app.current_user_id', TRUE)::UUID,
            'insert',
            TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables (example)
CREATE TRIGGER audit_case_files
AFTER INSERT OR UPDATE OR DELETE ON medical.case_files
FOR EACH ROW EXECUTE FUNCTION core.audit_trigger_function();

CREATE TRIGGER audit_payments
AFTER INSERT OR UPDATE OR DELETE ON billing.payments
FOR EACH ROW EXECUTE FUNCTION core.audit_trigger_function();

-- ============================================
-- USEFUL VIEWS
-- ============================================

CREATE VIEW medical.v_active_cases AS
SELECT 
    cf.id,
    cf.case_number,
    cf.admission_date,
    cf.case_status,
    p.file_number,
    p.first_name || ' ' || p.last_name AS patient_name,
    p.identification_number,
    d.medical_license,
    u.full_name AS primary_doctor,
    r.room_number,
    cf.total_cost
FROM medical.case_files cf
JOIN medical.patients p ON cf.patient_id = p.id
LEFT JOIN medical.case_doctors cd ON cf.id = cd.case_file_id AND cd.role = 'primary'
LEFT JOIN medical.doctors d ON cd.doctor_id = d.id
LEFT JOIN core.users u ON d.user_id = u.id
LEFT JOIN medical.case_rooms cr ON cf.id = cr.case_file_id AND cr.check_out IS NULL
LEFT JOIN medical.rooms r ON cr.room_id = r.id
WHERE cf.case_status IN ('active', 'in_treatment', 'hospitalized', 'surgery_scheduled', 'recovering');

CREATE VIEW medical.v_patient_history AS
SELECT 
    p.id AS patient_id,
    p.file_number,
    p.first_name || ' ' || p.last_name AS patient_name,
    cf.case_number,
    cf.admission_date,
    cf.discharge_date,
    cf.admission_type,
    cf.case_status,
    cf.chief_complaint,
    cf.final_diagnosis,
    string_agg(DISTINCT u.full_name, ', ') AS doctors,
    cf.total_cost
FROM medical.patients p
JOIN medical.case_files cf ON p.id = cf.patient_id
LEFT JOIN medical.case_doctors cd ON cf.id = cd.case_file_id
LEFT JOIN medical.doctors d ON cd.doctor_id = d.id
LEFT JOIN core.users u ON d.user_id = u.id
GROUP BY p.id, p.file_number, patient_name, cf.case_number, 
         cf.admission_date, cf.discharge_date, cf.admission_type, 
         cf.case_status, cf.chief_complaint, cf.final_diagnosis, cf.total_cost
ORDER BY cf.admission_date DESC;

CREATE VIEW inventory.v_stock_status AS
SELECT 
    w.name AS warehouse_name,
    w.code AS warehouse_code,
    p.code AS product_code,
    p.name AS product_name,
    pc.name AS category,
    ws.quantity AS current_stock,
    ws.reserved_quantity,
    ws.available_quantity,
    p.minimum_stock,
    p.reorder_point,
    CASE 
        WHEN ws.available_quantity <= p.minimum_stock THEN 'critical'
        WHEN ws.available_quantity <= p.reorder_point THEN 'low'
        ELSE 'normal'
    END AS stock_level,
    p.unit_cost,
    (ws.quantity * p.unit_cost) AS total_value
FROM inventory.warehouse_stock ws
JOIN inventory.warehouses w ON ws.warehouse_id = w.id
JOIN inventory.products p ON ws.product_id = p.id
JOIN inventory.product_categories pc ON p.category_id = pc.id
WHERE p.is_active = TRUE AND w.is_active = TRUE;

CREATE VIEW billing.v_pending_payments AS
SELECT 
    i.invoice_number,
    i.invoice_date,
    i.due_date,
    cf.case_number,
    p.file_number,
    p.first_name || ' ' || p.last_name AS patient_name,
    p.phone,
    i.total,
    i.paid_amount,
    i.balance,
    i.status,
    CASE 
        WHEN i.due_date < CURRENT_DATE THEN 'overdue'
        WHEN i.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'pending'
    END AS urgency
FROM billing.invoices i
JOIN medical.case_files cf ON i.case_file_id = cf.id
JOIN medical.patients p ON i.patient_id = p.id
WHERE i.status IN ('pending', 'partial')
ORDER BY i.due_date ASC;

CREATE VIEW billing.v_supplier_payment_status AS
SELECT 
    s.business_name AS supplier,
    po.po_number,
    po.order_date,
    po.total AS order_total,
    po.payment_terms,
    sps.installment_number,
    sps.due_date,
    sps.amount AS installment_amount,
    sps.paid_amount,
    (sps.amount - sps.paid_amount) AS balance,
    sps.status,
    CASE 
        WHEN sps.due_date < CURRENT_DATE AND sps.status != 'paid' THEN 'overdue'
        WHEN sps.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'on_track'
    END AS payment_urgency
FROM billing.supplier_payment_schedule sps
JOIN inventory.purchase_orders po ON sps.purchase_order_id = po.id
JOIN inventory.suppliers s ON po.supplier_id = s.id
WHERE sps.status != 'paid'
ORDER BY sps.due_date ASC;

CREATE VIEW medical.v_operation_schedule AS
SELECT 
    so.id,
    so.scheduled_date,
    so.estimated_duration_minutes,
    so.operating_room,
    so.status,
    cf.case_number,
    p.first_name || ' ' || p.last_name AS patient_name,
    p.file_number,
    ot.name AS operation_type,
    ot.complexity,
    u1.full_name AS primary_surgeon,
    d1.doctor_type AS surgeon_type,
    u2.full_name AS anesthesiologist,
    so.pre_operative_notes
FROM medical.scheduled_operations so
JOIN medical.case_files cf ON so.case_file_id = cf.id
JOIN medical.patients p ON cf.patient_id = p.id
JOIN medical.operation_types ot ON so.operation_type_id = ot.id
JOIN medical.doctors d1 ON so.primary_surgeon_id = d1.id
JOIN core.users u1 ON d1.user_id = u1.id
LEFT JOIN medical.doctors d2 ON so.anesthesiologist_id = d2.id
LEFT JOIN core.users u2 ON d2.user_id = u2.id
WHERE so.status NOT IN ('completed', 'cancelled')
ORDER BY so.scheduled_date ASC;

CREATE VIEW billing.v_payment_summary AS
SELECT 
    DATE_TRUNC('day', payment_date) AS payment_day,
    payment_category,
    payment_method,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount,
    SUM(CASE WHEN is_refund THEN amount ELSE 0 END) AS total_refunds,
    SUM(CASE WHEN NOT is_refund THEN amount ELSE 0 END) AS net_payments
FROM billing.payments
WHERE status = 'paid'
GROUP BY DATE_TRUNC('day', payment_date), payment_category, payment_method
ORDER BY payment_day DESC, payment_category;

-- ============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================

-- Function to calculate patient age
CREATE OR REPLACE FUNCTION medical.calculate_age(birth_date DATE)
RETURNS INT AS $
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
END;
$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update warehouse stock after movement
CREATE OR REPLACE FUNCTION inventory.update_warehouse_stock()
RETURNS TRIGGER AS $
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Update or insert stock
        INSERT INTO inventory.warehouse_stock (warehouse_id, product_id, quantity)
        VALUES (NEW.warehouse_id, NEW.product_id, 
                CASE 
                    WHEN NEW.movement_type IN ('purchase', 'reception', 'adjustment') THEN NEW.quantity
                    WHEN NEW.movement_type IN ('sale', 'dispatch') THEN -NEW.quantity
                    ELSE 0
                END)
        ON CONFLICT (warehouse_id, product_id) 
        DO UPDATE SET 
            quantity = inventory.warehouse_stock.quantity + 
                CASE 
                    WHEN NEW.movement_type IN ('purchase', 'reception', 'adjustment') THEN NEW.quantity
                    WHEN NEW.movement_type IN ('sale', 'dispatch') THEN -NEW.quantity
                    ELSE 0
                END,
            last_updated = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_warehouse_stock
AFTER INSERT ON inventory.stock_movements
FOR EACH ROW EXECUTE FUNCTION inventory.update_warehouse_stock();

-- Function to update invoice paid amount
CREATE OR REPLACE FUNCTION billing.update_invoice_paid_amount()
RETURNS TRIGGER AS $
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.reference_type = 'invoice') THEN
        UPDATE billing.invoices
        SET paid_amount = paid_amount + NEW.amount,
            status = CASE 
                WHEN paid_amount + NEW.amount >= total THEN 'paid'::billing.payment_status
                WHEN paid_amount + NEW.amount > 0 THEN 'partial'::billing.payment_status
                ELSE status
            END
        WHERE id = NEW.reference_id;
    END IF;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_invoice_paid
AFTER INSERT ON billing.payments
FOR EACH ROW EXECUTE FUNCTION billing.update_invoice_paid_amount();

-- Function to update supplier payment schedule
CREATE OR REPLACE FUNCTION billing.update_supplier_payment_schedule()
RETURNS TRIGGER AS $
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.payment_category = 'supplier_payment' 
        AND NEW.reference_type = 'supplier_payment_schedule') THEN
        UPDATE billing.supplier_payment_schedule
        SET paid_amount = paid_amount + NEW.amount,
            status = CASE 
                WHEN paid_amount + NEW.amount >= amount THEN 'paid'::billing.payment_status
                WHEN paid_amount + NEW.amount > 0 THEN 'partial'::billing.payment_status
                ELSE status
            END
        WHERE id = NEW.reference_id;
    END IF;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_supplier_payment
AFTER INSERT ON billing.payments
FOR EACH ROW EXECUTE FUNCTION billing.update_supplier_payment_schedule();

-- Function to automatically create payment schedule for purchases
CREATE OR REPLACE FUNCTION inventory.create_payment_schedule()
RETURNS TRIGGER AS $
DECLARE
    installment_amount DECIMAL(12,2);
    payment_date DATE;
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'approved' THEN
        -- Delete existing schedule if any
        DELETE FROM billing.supplier_payment_schedule WHERE purchase_order_id = NEW.id;
        
        -- Create payment schedule based on payment terms
        CASE NEW.payment_terms
            WHEN 'immediate' THEN
                INSERT INTO billing.supplier_payment_schedule 
                    (purchase_order_id, installment_number, due_date, amount)
                VALUES (NEW.id, 1, NEW.order_date, NEW.total);
                
            WHEN 'one_payment' THEN
                INSERT INTO billing.supplier_payment_schedule 
                    (purchase_order_id, installment_number, due_date, amount)
                VALUES (NEW.id, 1, NEW.order_date + INTERVAL '30 days', NEW.total);
                
            WHEN 'two_payments' THEN
                installment_amount := NEW.total / 2;
                FOR i IN 1..2 LOOP
                    payment_date := NEW.order_date + ((i - 1) * INTERVAL '30 days');
                    INSERT INTO billing.supplier_payment_schedule 
                        (purchase_order_id, installment_number, due_date, amount)
                    VALUES (NEW.id, i, payment_date, installment_amount);
                END LOOP;
                
            WHEN 'three_payments' THEN
                installment_amount := NEW.total / 3;
                FOR i IN 1..3 LOOP
                    payment_date := NEW.order_date + ((i - 1) * INTERVAL '30 days');
                    INSERT INTO billing.supplier_payment_schedule 
                        (purchase_order_id, installment_number, due_date, amount)
                    VALUES (NEW.id, i, payment_date, installment_amount);
                END LOOP;
        END CASE;
    END IF;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_payment_schedule
AFTER INSERT OR UPDATE ON inventory.purchase_orders
FOR EACH ROW EXECUTE FUNCTION inventory.create_payment_schedule();

-- Function to update room status when assigned to case
CREATE OR REPLACE FUNCTION medical.update_room_status()
RETURNS TRIGGER AS $
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE medical.rooms
        SET status = 'occupied'::medical.room_status
        WHERE id = NEW.room_id;
    ELSIF (TG_OP = 'UPDATE' AND NEW.check_out IS NOT NULL AND OLD.check_out IS NULL) THEN
        UPDATE medical.rooms
        SET status = 'cleaning'::medical.room_status
        WHERE id = NEW.room_id;
    END IF;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_room_status
AFTER INSERT OR UPDATE ON medical.case_rooms
FOR EACH ROW EXECUTE FUNCTION medical.update_room_status();

-- ============================================
-- SAMPLE DATA INSERTIONS
-- ============================================

-- Insert default admin user (password: Admin123!)
INSERT INTO core.users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@hospital.com', crypt('Admin123!', gen_salt('bf')), 'System Administrator', 'super_admin');

-- Insert service types
INSERT INTO medical.service_types (code, name, category) VALUES
('ST001', 'Diagnostic Services', 'diagnostic'),
('ST002', 'Hospitalization Services', 'hospitalization'),
('ST003', 'Pharmacy Services', 'pharmacy'),
('ST004', 'Emergency Services', 'emergency'),
('ST005', 'Laboratory Services', 'laboratory');

-- Insert specialties
INSERT INTO medical.specialties (code, name, description) VALUES
('SP001', 'General Medicine', 'General medical care'),
('SP002', 'Cardiology', 'Heart and cardiovascular system'),
('SP003', 'Pediatrics', 'Child healthcare'),
('SP004', 'Surgery', 'Surgical procedures'),
('SP005', 'Orthopedics', 'Musculoskeletal system'),
('SP006', 'Neurology', 'Nervous system'),
('SP007', 'Gynecology', 'Women''s reproductive health'),
('SP008', 'Emergency Medicine', 'Emergency care');

-- Insert product categories
INSERT INTO inventory.product_categories (code, name, description) VALUES
('CAT001', 'Medications', 'Pharmaceutical products'),
('CAT002', 'Surgical Supplies', 'Surgical instruments and supplies'),
('CAT003', 'Laboratory Supplies', 'Lab testing materials'),
('CAT004', 'Medical Equipment', 'Medical devices and equipment'),
('CAT005', 'PPE', 'Personal protective equipment');

-- Insert warehouses
INSERT INTO inventory.warehouses (code, name, location) VALUES
('WH001', 'Main Warehouse', 'Building A - Floor 1'),
('WH002', 'Pharmacy Warehouse', 'Building B - Floor 2'),
('WH003', 'Surgical Supplies', 'Building C - Floor 3');

-- ============================================
-- PERMISSIONS SETUP
-- ============================================

-- Insert basic permissions
INSERT INTO core.permissions (name, resource, action, description) VALUES
-- User management
('users.create', 'users', 'create', 'Create new users'),
('users.read', 'users', 'read', 'View users'),
('users.update', 'users', 'update', 'Update users'),
('users.delete', 'users', 'delete', 'Delete users'),

-- Patient management
('patients.create', 'patients', 'create', 'Register new patients'),
('patients.read', 'patients', 'read', 'View patient information'),
('patients.update', 'patients', 'update', 'Update patient information'),
('patients.delete', 'patients', 'delete', 'Delete patients'),

-- Case files
('cases.create', 'case_files', 'create', 'Create case files'),
('cases.read', 'case_files', 'read', 'View case files'),
('cases.update', 'case_files', 'update', 'Update case files'),
('cases.approve', 'case_files', 'approve', 'Approve case closure'),

-- Inventory
('inventory.create', 'inventory', 'create', 'Create inventory items'),
('inventory.read', 'inventory', 'read', 'View inventory'),
('inventory.update', 'inventory', 'update', 'Update inventory'),
('inventory.approve', 'purchase_orders', 'approve', 'Approve purchase orders'),

-- Billing
('billing.create', 'billing', 'create', 'Create invoices'),
('billing.read', 'billing', 'read', 'View billing information'),
('billing.update', 'billing', 'update', 'Update billing'),
('payments.create', 'payments', 'create', 'Process payments'),
('payments.read', 'payments', 'read', 'View payments');

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON SCHEMA medical IS 'Medical records, patient care, and clinical operations';
COMMENT ON SCHEMA inventory IS 'Inventory management, warehouses, and suppliers';
COMMENT ON SCHEMA billing IS 'Financial operations, invoicing, and payments';

COMMENT ON TABLE medical.case_files IS 'Central patient journey tracking - records entire patient stay from admission to discharge';
COMMENT ON TABLE medical.case_timeline IS 'Tracks patient progression through different stages (emergency -> consultation -> hospitalization -> surgery -> recovery -> discharge)';
COMMENT ON TABLE medical.case_doctors IS 'Links doctors to cases with their specific roles';
COMMENT ON TABLE medical.case_rooms IS 'Tracks room occupancy for hospitalized patients';
COMMENT ON TABLE medical.case_services IS 'Additional services not included in package';

COMMENT ON TABLE billing.payments IS 'Unified payment tracking table for all payment types (consultations, hospitalizations, supplier payments, etc.)';
COMMENT ON TABLE billing.supplier_payment_schedule IS 'Manages installment payments to suppliers (1, 2, or 3 payments)';

COMMENT ON COLUMN medical.doctors.doctor_type IS 'Internal doctors work for hospital, external doctors are called for specific procedures with different fees';
COMMENT ON COLUMN inventory.purchase_orders.payment_terms IS 'Immediate, or split into 1, 2, or 3 installment payments';

-- ============================================
-- END OF DATABASE SCHEMA
-- ============================================