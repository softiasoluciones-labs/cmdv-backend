-- ============================================
-- PACKAGES ADJUSTMENT - STANDALONE SCRIPT
-- Modifications to medical.packages and medical.package_details
-- ============================================

-- ============================================
-- 🔄 DROP existing tables to recreate
-- ============================================

DROP TABLE IF EXISTS medical.package_details CASCADE;
DROP TABLE IF EXISTS medical.packages CASCADE;

-- ============================================
-- 🆕 RECREATE: medical.packages
-- Changes:
-- 1. Added doctor_type (internal/external) - affects pricing
-- 2. Added service_id - determines package name/type
-- 3. Removed includes_room (will be in details as a product)
-- ============================================

CREATE TABLE medical.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    service_id UUID NOT NULL REFERENCES medical.services(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- 🆕 NEW: Doctor type determines pricing
    doctor_type medical.doctor_type NOT NULL,
    
    -- 🆕 NEW: Different prices for internal vs external doctors
    internal_doctor_price DECIMAL(12,2),
    external_doctor_price DECIMAL(12,2),
    
    validity_days INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),
    
    -- 🆕 NEW: Constraint to ensure at least one price is set
    CONSTRAINT chk_package_price CHECK (
        (doctor_type = 'internal' AND internal_doctor_price IS NOT NULL) OR
        (doctor_type = 'external' AND external_doctor_price IS NOT NULL) OR
        (internal_doctor_price IS NOT NULL AND external_doctor_price IS NOT NULL)
    )
);

CREATE INDEX idx_packages_service ON medical.packages(service_id);
CREATE INDEX idx_packages_doctor_type ON medical.packages(doctor_type);
CREATE INDEX idx_packages_active ON medical.packages(is_active);

COMMENT ON TABLE medical.packages IS '🔄 MODIFIED: Medical packages with pricing based on doctor type (internal/external)';
COMMENT ON COLUMN medical.packages.service_id IS '🆕 NEW: Service that determines the package type/name';
COMMENT ON COLUMN medical.packages.doctor_type IS '🆕 NEW: Type of doctor (internal/external) - affects pricing';
COMMENT ON COLUMN medical.packages.internal_doctor_price IS '🆕 NEW: Price when using internal doctor';
COMMENT ON COLUMN medical.packages.external_doctor_price IS '🆕 NEW: Price when using external doctor (typically higher)';

-- ============================================
-- 🆕 RECREATE: medical.package_details
-- Changes:
-- 1. Now references inventory.products instead of services
-- 2. Products are NOT deducted from inventory until package is assigned to case_file
-- 3. Removed service_id (only in package header)
-- ============================================

CREATE TABLE medical.package_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES medical.packages(id) ON DELETE CASCADE,
    
    -- 🆕 NEW: References products from inventory
    product_id UUID NOT NULL REFERENCES inventory.products(id),
    
    quantity INT NOT NULL DEFAULT 1,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 🆕 NEW: Ensure quantity is positive
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX idx_package_details_package ON medical.package_details(package_id);
CREATE INDEX idx_package_details_product ON medical.package_details(product_id);

COMMENT ON TABLE medical.package_details IS '🔄 MODIFIED: Package details with inventory products. Products are NOT deducted until package is assigned to case_file';
COMMENT ON COLUMN medical.package_details.product_id IS '🆕 NEW: Product from inventory catalog (medications, supplies, equipment)';
COMMENT ON COLUMN medical.package_details.quantity IS '🆕 NEW: Quantity of product needed. NOT deducted until assigned to case';

-- ============================================
-- 🆕 NEW: package_assignments table
-- Track when packages are assigned to case files
-- This is when inventory should be deducted
-- ============================================

CREATE TABLE medical.package_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_file_id UUID NOT NULL REFERENCES medical.case_files(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES medical.packages(id),
    
    -- 🆕 NEW: Track which doctor type was used for pricing
    doctor_id UUID NOT NULL REFERENCES medical.doctors(id),
    doctor_type_used medical.doctor_type NOT NULL,
    
    -- 🆕 NEW: Price applied based on doctor type
    price_applied DECIMAL(12,2) NOT NULL,
    
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES core.users(id),
    
    -- 🆕 NEW: Track if inventory was deducted
    inventory_deducted BOOLEAN DEFAULT FALSE,
    inventory_deducted_at TIMESTAMP,
    
    notes TEXT,
    
    UNIQUE(case_file_id, package_id)
);

CREATE INDEX idx_package_assignments_case ON medical.package_assignments(case_file_id);
CREATE INDEX idx_package_assignments_package ON medical.package_assignments(package_id);
CREATE INDEX idx_package_assignments_doctor ON medical.package_assignments(doctor_id);

COMMENT ON TABLE medical.package_assignments IS '🆕 NEW: Tracks package assignment to case files. Triggers inventory deduction.';
COMMENT ON COLUMN medical.package_assignments.doctor_type_used IS 'Doctor type used (internal/external) determines which price was applied';
COMMENT ON COLUMN medical.package_assignments.price_applied IS 'Actual price charged based on doctor type';
COMMENT ON COLUMN medical.package_assignments.inventory_deducted IS 'Flag indicating if products were deducted from inventory';

-- ============================================
-- 🆕 NEW: Function to get package price based on doctor
-- ============================================

CREATE OR REPLACE FUNCTION medical.get_package_price(
    p_package_id UUID,
    p_doctor_id UUID
)
RETURNS DECIMAL(12,2) AS $$
DECLARE
    v_doctor_type medical.doctor_type;
    v_internal_price DECIMAL(12,2);
    v_external_price DECIMAL(12,2);
    v_price DECIMAL(12,2);
BEGIN
    -- Get doctor type
    SELECT doctor_type INTO v_doctor_type
    FROM medical.doctors
    WHERE id = p_doctor_id;
    
    IF v_doctor_type IS NULL THEN
        RAISE EXCEPTION 'Doctor not found: %', p_doctor_id;
    END IF;
    
    -- Get package prices
    SELECT internal_doctor_price, external_doctor_price
    INTO v_internal_price, v_external_price
    FROM medical.packages
    WHERE id = p_package_id;
    
    -- Return appropriate price
    IF v_doctor_type = 'internal' THEN
        v_price := v_internal_price;
    ELSE
        v_price := v_external_price;
    END IF;
    
    IF v_price IS NULL THEN
        RAISE EXCEPTION 'No price configured for package % with doctor type %', p_package_id, v_doctor_type;
    END IF;
    
    RETURN v_price;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION medical.get_package_price IS '🆕 NEW: Returns package price based on doctor type (internal/external)';

-- ============================================
-- 🆕 NEW: Function to deduct package inventory
-- Should be called when package is assigned to case
-- ============================================

CREATE OR REPLACE FUNCTION medical.deduct_package_inventory(
    p_package_assignment_id UUID,
    p_warehouse_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_package_id UUID;
    v_case_file_id UUID;
    v_detail RECORD;
    v_available_stock INT;
BEGIN
    -- Get package and case info
    SELECT package_id, case_file_id
    INTO v_package_id, v_case_file_id
    FROM medical.package_assignments
    WHERE id = p_package_assignment_id;
    
    IF v_package_id IS NULL THEN
        RAISE EXCEPTION 'Package assignment not found: %', p_package_assignment_id;
    END IF;
    
    -- Check if already deducted
    IF EXISTS (
        SELECT 1 FROM medical.package_assignments 
        WHERE id = p_package_assignment_id AND inventory_deducted = TRUE
    ) THEN
        RAISE EXCEPTION 'Inventory already deducted for this package assignment';
    END IF;
    
    -- Loop through package details and deduct inventory
    FOR v_detail IN 
        SELECT product_id, quantity 
        FROM medical.package_details 
        WHERE package_id = v_package_id
    LOOP
        -- Check available stock
        SELECT available_quantity INTO v_available_stock
        FROM inventory.warehouse_stock
        WHERE warehouse_id = p_warehouse_id 
        AND product_id = v_detail.product_id;
        
        IF v_available_stock IS NULL OR v_available_stock < v_detail.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %. Required: %, Available: %', 
                v_detail.product_id, v_detail.quantity, COALESCE(v_available_stock, 0);
        END IF;
        
        -- Create stock movement
        INSERT INTO inventory.stock_movements (
            movement_number,
            movement_type,
            warehouse_id,
            product_id,
            quantity,
            reference_type,
            reference_id,
            notes,
            movement_date,
            created_by
        ) VALUES (
            'PKG-' || p_package_assignment_id || '-' || v_detail.product_id,
            'dispatch',
            p_warehouse_id,
            v_detail.product_id,
            v_detail.quantity,
            'package_assignment',
            p_package_assignment_id,
            'Package deduction for case: ' || v_case_file_id,
            CURRENT_TIMESTAMP,
            current_setting('app.current_user_id', TRUE)::UUID
        );
    END LOOP;
    
    -- Mark as deducted
    UPDATE medical.package_assignments
    SET inventory_deducted = TRUE,
        inventory_deducted_at = CURRENT_TIMESTAMP
    WHERE id = p_package_assignment_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION medical.deduct_package_inventory IS '🆕 NEW: Deducts package products from inventory when assigned to case. Validates stock availability.';

-- ============================================
-- 🆕 NEW: View for package details with product info
-- ============================================

CREATE VIEW medical.v_package_details_with_products AS
SELECT 
    p.id AS package_id,
    p.code AS package_code,
    p.name AS package_name,
    p.doctor_type,
    p.internal_doctor_price,
    p.external_doctor_price,
    s.name AS service_name,
    pd.id AS detail_id,
    pd.quantity,
    prod.code AS product_code,
    prod.name AS product_name,
    pc.name AS product_category,
    prod.unit_of_measure,
    prod.unit_cost,
    (pd.quantity * prod.unit_cost) AS detail_cost
FROM medical.packages p
JOIN medical.services s ON p.service_id = s.id
LEFT JOIN medical.package_details pd ON p.package_id = pd.package_id
LEFT JOIN inventory.products prod ON pd.product_id = prod.id
LEFT JOIN inventory.product_categories pc ON prod.category_id = pc.id
WHERE p.is_active = TRUE;

COMMENT ON VIEW medical.v_package_details_with_products IS '🆕 NEW: Complete view of packages with product details and costs';

-- ============================================
-- 🆕 NEW: View for package assignments
-- ============================================

CREATE VIEW medical.v_package_assignments AS
SELECT 
    pa.id,
    pa.assigned_date,
    cf.case_number,
    p_patient.first_name || ' ' || p_patient.last_name AS patient_name,
    pkg.code AS package_code,
    pkg.name AS package_name,
    s.name AS service_name,
    d.medical_license,
    u.full_name AS doctor_name,
    pa.doctor_type_used,
    pa.price_applied,
    pa.inventory_deducted,
    pa.inventory_deducted_at,
    COUNT(pd.id) AS product_count,
    SUM(pd.quantity) AS total_items
FROM medical.package_assignments pa
JOIN medical.case_files cf ON pa.case_file_id = cf.id
JOIN medical.patients p_patient ON cf.patient_id = p_patient.id
JOIN medical.packages pkg ON pa.package_id = pkg.id
JOIN medical.services s ON pkg.service_id = s.id
JOIN medical.doctors d ON pa.doctor_id = d.id
JOIN core.users u ON d.user_id = u.id
LEFT JOIN medical.package_details pd ON pkg.id = pd.package_id
GROUP BY pa.id, pa.assigned_date, cf.case_number, patient_name, 
         pkg.code, pkg.name, s.name, d.medical_license, u.full_name,
         pa.doctor_type_used, pa.price_applied, pa.inventory_deducted, 
         pa.inventory_deducted_at;

COMMENT ON VIEW medical.v_package_assignments IS '🆕 NEW: Complete view of package assignments with case and doctor info';

-- ============================================
-- 📊 SAMPLE DATA for testing
-- ============================================

-- Sample package for internal doctor
INSERT INTO medical.packages (
    code, 
    service_id, 
    name, 
    description, 
    doctor_type,
    internal_doctor_price,
    external_doctor_price,
    validity_days,
    is_active
) VALUES (
    'PKG-CES-INT-001',
    (SELECT id FROM medical.services WHERE code = 'SRV-001' LIMIT 1), -- Adjust to your service
    'Paquete Cesárea - Doctor Interno',
    'Paquete completo para cesárea con doctor interno del hospital',
    'internal',
    15000.00, -- Internal doctor price
    NULL,     -- No external price for internal package
    30,
    TRUE
);

-- Sample package for external doctor (higher price)
INSERT INTO medical.packages (
    code, 
    service_id, 
    name, 
    description, 
    doctor_type,
    internal_doctor_price,
    external_doctor_price,
    validity_days,
    is_active
) VALUES (
    'PKG-CES-EXT-001',
    (SELECT id FROM medical.services WHERE code = 'SRV-001' LIMIT 1),
    'Paquete Cesárea - Doctor Externo',
    'Paquete completo para cesárea con doctor externo especialista',
    'external',
    NULL,     -- No internal price for external package
    25000.00, -- External doctor price (higher)
    30,
    TRUE
);

-- Sample package with both prices (flexible)
INSERT INTO medical.packages (
    code, 
    service_id, 
    name, 
    description, 
    doctor_type,
    internal_doctor_price,
    external_doctor_price,
    validity_days,
    is_active
) VALUES (
    'PKG-APE-001',
    (SELECT id FROM medical.services WHERE code = 'SRV-002' LIMIT 1),
    'Paquete Apendicectomía',
    'Paquete completo para apendicectomía (precio variable según doctor)',
    'internal', -- Default type, but both prices available
    12000.00,   -- Internal doctor price
    18000.00,   -- External doctor price (higher)
    30,
    TRUE
);

-- Sample package details (products needed)
-- Note: Adjust product_id to match your inventory.products
INSERT INTO medical.package_details (package_id, product_id, quantity, notes) VALUES
-- For PKG-CES-INT-001
((SELECT id FROM medical.packages WHERE code = 'PKG-CES-INT-001'), 
 (SELECT id FROM inventory.products WHERE code = 'MED-001' LIMIT 1), 
 2, 
 'Anestesia espinal'),
 
((SELECT id FROM medical.packages WHERE code = 'PKG-CES-INT-001'), 
 (SELECT id FROM inventory.products WHERE code = 'MED-002' LIMIT 1), 
 1, 
 'Antibiótico profiláctico'),
 
((SELECT id FROM medical.packages WHERE code = 'PKG-CES-INT-001'), 
 (SELECT id FROM inventory.products WHERE code = 'SUP-001' LIMIT 1), 
 10, 
 'Gasas estériles'),

-- For PKG-CES-EXT-001 (same products, different pricing)
((SELECT id FROM medical.packages WHERE code = 'PKG-CES-EXT-001'), 
 (SELECT id FROM inventory.products WHERE code = 'MED-001' LIMIT 1), 
 2, 
 'Anestesia espinal'),
 
((SELECT id FROM medical.packages WHERE code = 'PKG-CES-EXT-001'), 
 (SELECT id FROM inventory.products WHERE code = 'MED-002' LIMIT 1), 
 1, 
 'Antibiótico profiláctico'),
 
((SELECT id FROM medical.packages WHERE code = 'PKG-CES-EXT-001'), 
 (SELECT id FROM inventory.products WHERE code = 'SUP-001' LIMIT 1), 
 10, 
 'Gasas estériles');

-- ============================================
-- 📝 USAGE EXAMPLES
-- ============================================

/*
-- Example 1: Get package price for a specific doctor
SELECT medical.get_package_price(
    (SELECT id FROM medical.packages WHERE code = 'PKG-CES-INT-001'),
    (SELECT id FROM medical.doctors WHERE medical_license = 'LIC-12345')
);

-- Example 2: Assign package to case file
INSERT INTO medical.package_assignments (
    case_file_id,
    package_id,
    doctor_id,
    doctor_type_used,
    price_applied,
    assigned_by
) VALUES (
    'case-file-uuid-here',
    (SELECT id FROM medical.packages WHERE code = 'PKG-CES-INT-001'),
    'doctor-uuid-here',
    'internal',
    15000.00,
    'user-uuid-here'
);

-- Example 3: Deduct inventory when package is confirmed
SELECT medical.deduct_package_inventory(
    'package-assignment-uuid-here',
    'warehouse-uuid-here'
);

-- Example 4: View package details
SELECT * FROM medical.v_package_details_with_products
WHERE package_code = 'PKG-CES-INT-001';

-- Example 5: View package assignments for a case
SELECT * FROM medical.v_package_assignments
WHERE case_number = 'CASE-2024-001';
*/

-- ============================================
-- END OF PACKAGES ADJUSTMENT
-- ============================================

/*
SUMMARY OF CHANGES:

✅ medical.packages TABLE:
   - 🆕 Added service_id: Determines package type/name
   - 🆕 Added doctor_type: internal or external
   - 🆕 Added internal_doctor_price: Price for internal doctors
   - 🆕 Added external_doctor_price: Price for external doctors (typically higher)
   - ❌ Removed includes_room: Will be a product in details
   - ✅ Constraint ensures appropriate prices are set

✅ medical.package_details TABLE:
   - 🆕 Changed to reference inventory.products instead of services
   - ❌ Removed service_id (only in package header now)
   - 🆕 Products are NOT deducted until package is assigned to case_file
   - ✅ Quantity validation constraint

✅ NEW TABLES:
   - 🆕 package_assignments: Tracks when packages assigned to cases
   - Includes doctor_type_used and price_applied
   - Has inventory_deducted flag for tracking

✅ NEW FUNCTIONS:
   - 🆕 get_package_price(): Returns correct price based on doctor type
   - 🆕 deduct_package_inventory(): Deducts products from inventory
     * Validates stock availability
     * Creates stock movements
     * Marks assignment as deducted

✅ NEW VIEWS:
   - 🆕 v_package_details_with_products: Package with product info
   - 🆕 v_package_assignments: Assignment tracking with full context

✅ BUSINESS LOGIC:
   1. Package created with service_id and doctor_type
   2. Different prices for internal vs external doctors
   3. Package details list required products (quantities)
   4. When assigned to case_file -> creates package_assignment
   5. Inventory deducted only when package_assignment confirmed
   6. Stock movements track deductions with reference to assignment
*/