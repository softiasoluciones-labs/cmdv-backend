-- Migration: Create warehouse_dispatches tables
-- Run this SQL in your PostgreSQL database

-- Create enum for dispatch status
DO $$ BEGIN
    CREATE TYPE inventory.dispatch_status AS ENUM (
        'pending', 'approved', 'dispatched', 'completed', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create main dispatches table (header)
CREATE TABLE IF NOT EXISTS inventory.warehouse_dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_number VARCHAR(30) NOT NULL UNIQUE,
    source_warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id),
    destination_warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id),
    requester_name VARCHAR(200) NOT NULL,
    requester_user_id UUID REFERENCES core.users(id),
    status inventory.dispatch_status NOT NULL DEFAULT 'pending',
    dispatch_date DATE,
    requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id),
    dispatched_by UUID REFERENCES core.users(id),
    dispatched_at TIMESTAMP
);

-- Create dispatch details table (line items)
CREATE TABLE IF NOT EXISTS inventory.warehouse_dispatch_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_id UUID NOT NULL REFERENCES inventory.warehouse_dispatches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES inventory.products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    delivered_quantity INTEGER DEFAULT 0,
    notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_warehouse_dispatches_status ON inventory.warehouse_dispatches(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_dispatches_source ON inventory.warehouse_dispatches(source_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_dispatches_destination ON inventory.warehouse_dispatches(destination_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_dispatch_details_dispatch ON inventory.warehouse_dispatch_details(dispatch_id);