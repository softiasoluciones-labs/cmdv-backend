-- Migration: Create purchase_order_payments table
-- Run this SQL in your PostgreSQL database

-- Create enum for payment methods
DO $$ BEGIN
    CREATE TYPE inventory.payment_method AS ENUM (
        'cash', 'bank_transfer', 'deposit', 'check', 'credit_card', 'debit_card'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create main payments table
CREATE TABLE IF NOT EXISTS inventory.purchase_order_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES inventory.purchase_orders(id),
    payment_number INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method inventory.payment_method NOT NULL,
    bank VARCHAR(100),
    reference_number VARCHAR(100),
    authorization_code VARCHAR(100),
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES core.users(id)
);

-- Create table for mixed payments (multiple methods in one payment)
CREATE TABLE IF NOT EXISTS inventory.purchase_order_payment_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES inventory.purchase_order_payments(id) ON DELETE CASCADE,
    payment_method inventory.payment_method NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    bank VARCHAR(100),
    reference_number VARCHAR(100),
    authorization_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_po_payments_po_id ON inventory.purchase_order_payments(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_payment_details_payment_id ON inventory.purchase_order_payment_details(payment_id);