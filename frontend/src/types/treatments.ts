export interface Treatment {
  id: string;
  tenant_id: string;
  name: string;
  price_cents: number;
  cost_cents: number | null;
  initial_frequency_weeks: number | null;
  initial_sessions_count: number | null;
  maintenance_frequency_weeks: number | null;
  protocol_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PatientTreatment {
  id: string;
  tenant_id: string;
  patient_id: string;
  treatment_id: string;
  current_session: number;
  started_at: string | null;
  last_appointment_id: string | null;
  is_active: boolean;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  treatment?: Treatment | null;
}

export interface TreatmentLineItem {
  id: string;
  treatment_id: string;
  name: string;
  quantity: number;
  unit_price_cents: number;
}
export interface TreatmentHistoryResponse {
  treatments: TreatmentHistoryItem[];
}

export interface TreatmentHistoryItem {
  treatment_id: string;
  treatment_name: string;
  total_sessions: number;
  first_application_date: string;
  last_application_date: string;
  status: 'active' | 'completed' | null;
  current_session: number | null;
  protocol: TreatmentProtocol | null;
  applications: TreatmentApplication[];
}

export interface TreatmentProtocol {
  initial_sessions_count: number | null;
  initial_frequency_weeks: number | null;
  maintenance_frequency_weeks: number | null;
  protocol_notes: string | null;
}

export interface TreatmentApplication {
  id: string;
  appointment_id: string;
  appointment_date: string;
  quantity: number;
}
