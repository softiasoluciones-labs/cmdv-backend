-- Migration 004: void/audit columns for case_services, case_rooms, case_package_assignments
-- + doctor-priced service flag + seed "Consulta Médica General" service.
--
-- Run this SQL manually against PostgreSQL, e.g.:
--   docker exec -i postgres_dev_cmdv_2 psql -U admin -d dev_cmdv -f -  < 004_case_charges_void_and_consultation_pricing.sql

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Void/audit columns (mirrors medical.case_products)
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE medical.case_services
  ADD COLUMN IF NOT EXISTS is_voided boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS voided_by uuid REFERENCES core.users(id),
  ADD COLUMN IF NOT EXISTS voided_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS void_reason text,
  ADD COLUMN IF NOT EXISTS doctor_id uuid REFERENCES medical.doctors(id);

ALTER TABLE medical.case_rooms
  ADD COLUMN IF NOT EXISTS is_voided boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS voided_by uuid REFERENCES core.users(id),
  ADD COLUMN IF NOT EXISTS voided_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS void_reason text;

ALTER TABLE medical.case_package_assignments
  ADD COLUMN IF NOT EXISTS is_voided boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS voided_by uuid REFERENCES core.users(id),
  ADD COLUMN IF NOT EXISTS voided_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS void_reason text;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Doctor-priced service flag
--    When true, the price charged for this service is looked up server-side
--    from medical.doctors.consultation_fee (never taken from the client),
--    with a fallback to services.base_price if the doctor has no fee set.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE medical.services
  ADD COLUMN IF NOT EXISTS use_doctor_consultation_fee boolean NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Catálogo: tipo de servicio "Consulta Médica" + servicio "Consulta Médica General"
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO medical.service_types (code, name, category)
VALUES ('CONSULTATION', 'Consulta Médica', 'consultation')
ON CONFLICT (code) DO NOTHING;

INSERT INTO medical.services (code, name, service_type_id, base_price, use_doctor_consultation_fee, is_active)
SELECT 'CONSULTA-GEN', 'Consulta Médica General', st.id, 100.00, true, true
FROM medical.service_types st
WHERE st.code = 'CONSULTATION'
ON CONFLICT (code) DO NOTHING;
