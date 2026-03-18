-- Migration: Add treatment protocol fields and patient_treatments table
-- Created: 2026-03-17

-- Add protocol fields to treatments table
ALTER TABLE treatments 
ADD COLUMN IF NOT EXISTS initial_frequency_weeks INTEGER,
ADD COLUMN IF NOT EXISTS initial_sessions_count INTEGER,
ADD COLUMN IF NOT EXISTS maintenance_frequency_weeks INTEGER,
ADD COLUMN IF NOT EXISTS protocol_notes TEXT;

-- Create patient_treatments table
CREATE TABLE IF NOT EXISTS patient_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    current_session INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_treatments_tenant ON patient_treatments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patient_treatments_patient ON patient_treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_treatments_treatment ON patient_treatments(treatment_id);
