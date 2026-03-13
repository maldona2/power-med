export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: 'super_admin' | 'professional';
  tenantId: string | null;
  phone?: string | null;
  specialty?: string | null;
  licenseNumber?: string | null;
  address?: string | null;
  bio?: string | null;
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
  }> | null;
  workingHours?: { start: string; end: string; days: string[] } | null;
  appointmentDuration?: number | null;
  avatarUrl?: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  user_email?: string;
}

export interface Patient {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  /** Number of appointments (from list API) */
  appointment_count?: number;
  /** Number of unpaid/partial appointments */
  unpaid_count?: number;
  /** Sum of total_amount_cents for unpaid/partial appointments */
  unpaid_total_cents?: number;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'refunded';

export interface Treatment {
  id: string;
  tenant_id: string;
  name: string;
  price_cents: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface AppointmentTreatment {
  id: string;
  treatment_id: string;
  treatment_name: string;
  quantity: number;
  unit_price_cents: number;
}

export interface Appointment {
  id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status?: PaymentStatus;
  total_amount_cents?: number | null;
  duration_minutes: number;
  notes: string | null;
  patient_id: string;
  tenant_id: string;
  patient_first_name?: string;
  patient_last_name?: string;
}

export interface AppointmentWithSession {
  id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  procedures_performed?: string | null;
  recommendations?: string | null;
}

export interface MedicalCondition {
  id: string;
  tenant_id: string;
  patient_id: string;
  condition_name: string;
  diagnosed_date: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Medication {
  id: string;
  tenant_id: string;
  patient_id: string;
  medication_name: string;
  dosage: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Allergy {
  id: string;
  tenant_id: string;
  patient_id: string;
  allergen_name: string;
  allergy_type: 'medication' | 'food' | 'other';
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MedicalHistory {
  conditions: MedicalCondition[];
  medications: Medication[];
  allergies: Allergy[];
}

export interface PatientDetail {
  patient: Patient;
  appointments: AppointmentWithSession[];
  medical_history: MedicalHistory;
}

export interface AppointmentDetail extends Appointment {
  procedures_performed?: string | null;
  recommendations?: string | null;
  treatments?: AppointmentTreatment[];
}

export interface TreatmentLineItem {
  treatment_id: string;
  quantity: number;
  unit_price_cents: number;
}

export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface DataTableFilterField<TData> {
  label: string;
  value: keyof TData | string;
  placeholder?: string;
  options?: Option[];
}
