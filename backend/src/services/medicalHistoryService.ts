import { and, asc, desc, eq } from 'drizzle-orm';
import { db, allergies, medicalConditions, medications } from '../db/client.js';

export interface MedicalConditionRow {
  id: string;
  tenant_id: string;
  patient_id: string;
  condition_name: string;
  diagnosed_date: string | null;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface MedicationRow {
  id: string;
  tenant_id: string;
  patient_id: string;
  medication_name: string;
  dosage: string | null;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface AllergyRow {
  id: string;
  tenant_id: string;
  patient_id: string;
  allergen_name: string;
  allergy_type: 'medication' | 'food' | 'other';
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateConditionInput {
  condition_name: string;
  diagnosed_date?: string | null;
  notes?: string | null;
}

export interface CreateMedicationInput {
  medication_name: string;
  dosage?: string | null;
  notes?: string | null;
}

export interface CreateAllergyInput {
  allergen_name: string;
  allergy_type?: 'medication' | 'food' | 'other';
  notes?: string | null;
}

// ─── Medical Conditions ──────────────────────────────────────────────────────

function conditionToRow(
  c: typeof medicalConditions.$inferSelect
): MedicalConditionRow {
  return {
    id: c.id,
    tenant_id: c.tenantId,
    patient_id: c.patientId,
    condition_name: c.conditionName,
    diagnosed_date: c.diagnosedDate ?? null,
    notes: c.notes ?? null,
    created_at: c.createdAt ?? null,
    updated_at: c.updatedAt ?? null,
  };
}

export async function listConditions(
  tenantId: string,
  patientId: string
): Promise<MedicalConditionRow[]> {
  const rows = await db
    .select()
    .from(medicalConditions)
    .where(
      and(
        eq(medicalConditions.tenantId, tenantId),
        eq(medicalConditions.patientId, patientId)
      )
    )
    .orderBy(desc(medicalConditions.createdAt));

  return rows.map(conditionToRow);
}

export async function createCondition(
  tenantId: string,
  patientId: string,
  input: CreateConditionInput
): Promise<MedicalConditionRow> {
  const [row] = await db
    .insert(medicalConditions)
    .values({
      tenantId,
      patientId,
      conditionName: input.condition_name,
      diagnosedDate: input.diagnosed_date ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  return conditionToRow(row);
}

export async function updateCondition(
  tenantId: string,
  patientId: string,
  id: string,
  input: Partial<CreateConditionInput>
): Promise<MedicalConditionRow | null> {
  const setValue: Partial<typeof medicalConditions.$inferInsert> = {};

  if (input.condition_name !== undefined)
    setValue.conditionName = input.condition_name;
  if (input.diagnosed_date !== undefined)
    setValue.diagnosedDate = input.diagnosed_date ?? null;
  if (input.notes !== undefined) setValue.notes = input.notes ?? null;

  if (Object.keys(setValue).length === 0) {
    const [existing] = await db
      .select()
      .from(medicalConditions)
      .where(
        and(
          eq(medicalConditions.id, id),
          eq(medicalConditions.tenantId, tenantId),
          eq(medicalConditions.patientId, patientId)
        )
      )
      .limit(1);
    return existing ? conditionToRow(existing) : null;
  }

  setValue.updatedAt = new Date();

  const [row] = await db
    .update(medicalConditions)
    .set(setValue)
    .where(
      and(
        eq(medicalConditions.id, id),
        eq(medicalConditions.tenantId, tenantId),
        eq(medicalConditions.patientId, patientId)
      )
    )
    .returning();

  return row ? conditionToRow(row) : null;
}

export async function deleteCondition(
  tenantId: string,
  patientId: string,
  id: string
): Promise<boolean> {
  const result = await db
    .delete(medicalConditions)
    .where(
      and(
        eq(medicalConditions.id, id),
        eq(medicalConditions.tenantId, tenantId),
        eq(medicalConditions.patientId, patientId)
      )
    );

  return (result.rowCount ?? 0) > 0;
}

// ─── Medications ─────────────────────────────────────────────────────────────

function medicationToRow(m: typeof medications.$inferSelect): MedicationRow {
  return {
    id: m.id,
    tenant_id: m.tenantId,
    patient_id: m.patientId,
    medication_name: m.medicationName,
    dosage: m.dosage ?? null,
    notes: m.notes ?? null,
    created_at: m.createdAt ?? null,
    updated_at: m.updatedAt ?? null,
  };
}

export async function listMedications(
  tenantId: string,
  patientId: string
): Promise<MedicationRow[]> {
  const rows = await db
    .select()
    .from(medications)
    .where(
      and(
        eq(medications.tenantId, tenantId),
        eq(medications.patientId, patientId)
      )
    )
    .orderBy(desc(medications.createdAt));

  return rows.map(medicationToRow);
}

export async function createMedication(
  tenantId: string,
  patientId: string,
  input: CreateMedicationInput
): Promise<MedicationRow> {
  const [row] = await db
    .insert(medications)
    .values({
      tenantId,
      patientId,
      medicationName: input.medication_name,
      dosage: input.dosage ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  return medicationToRow(row);
}

export async function updateMedication(
  tenantId: string,
  patientId: string,
  id: string,
  input: Partial<CreateMedicationInput>
): Promise<MedicationRow | null> {
  const setValue: Partial<typeof medications.$inferInsert> = {};

  if (input.medication_name !== undefined)
    setValue.medicationName = input.medication_name;
  if (input.dosage !== undefined) setValue.dosage = input.dosage ?? null;
  if (input.notes !== undefined) setValue.notes = input.notes ?? null;

  if (Object.keys(setValue).length === 0) {
    const [existing] = await db
      .select()
      .from(medications)
      .where(
        and(
          eq(medications.id, id),
          eq(medications.tenantId, tenantId),
          eq(medications.patientId, patientId)
        )
      )
      .limit(1);
    return existing ? medicationToRow(existing) : null;
  }

  setValue.updatedAt = new Date();

  const [row] = await db
    .update(medications)
    .set(setValue)
    .where(
      and(
        eq(medications.id, id),
        eq(medications.tenantId, tenantId),
        eq(medications.patientId, patientId)
      )
    )
    .returning();

  return row ? medicationToRow(row) : null;
}

export async function deleteMedication(
  tenantId: string,
  patientId: string,
  id: string
): Promise<boolean> {
  const result = await db
    .delete(medications)
    .where(
      and(
        eq(medications.id, id),
        eq(medications.tenantId, tenantId),
        eq(medications.patientId, patientId)
      )
    );

  return (result.rowCount ?? 0) > 0;
}

// ─── Allergies ───────────────────────────────────────────────────────────────

function allergyToRow(a: typeof allergies.$inferSelect): AllergyRow {
  return {
    id: a.id,
    tenant_id: a.tenantId,
    patient_id: a.patientId,
    allergen_name: a.allergenName,
    allergy_type: a.allergyType as 'medication' | 'food' | 'other',
    notes: a.notes ?? null,
    created_at: a.createdAt ?? null,
    updated_at: a.updatedAt ?? null,
  };
}

export async function listAllergies(
  tenantId: string,
  patientId: string
): Promise<AllergyRow[]> {
  const rows = await db
    .select()
    .from(allergies)
    .where(
      and(eq(allergies.tenantId, tenantId), eq(allergies.patientId, patientId))
    )
    .orderBy(asc(allergies.allergenName));

  return rows.map(allergyToRow);
}

export async function createAllergy(
  tenantId: string,
  patientId: string,
  input: CreateAllergyInput
): Promise<AllergyRow> {
  const [row] = await db
    .insert(allergies)
    .values({
      tenantId,
      patientId,
      allergenName: input.allergen_name,
      allergyType: input.allergy_type ?? 'other',
      notes: input.notes ?? null,
    })
    .returning();

  return allergyToRow(row);
}

export async function updateAllergy(
  tenantId: string,
  patientId: string,
  id: string,
  input: Partial<CreateAllergyInput>
): Promise<AllergyRow | null> {
  const setValue: Partial<typeof allergies.$inferInsert> = {};

  if (input.allergen_name !== undefined)
    setValue.allergenName = input.allergen_name;
  if (input.allergy_type !== undefined)
    setValue.allergyType = input.allergy_type ?? 'other';
  if (input.notes !== undefined) setValue.notes = input.notes ?? null;

  if (Object.keys(setValue).length === 0) {
    const [existing] = await db
      .select()
      .from(allergies)
      .where(
        and(
          eq(allergies.id, id),
          eq(allergies.tenantId, tenantId),
          eq(allergies.patientId, patientId)
        )
      )
      .limit(1);
    return existing ? allergyToRow(existing) : null;
  }

  setValue.updatedAt = new Date();

  const [row] = await db
    .update(allergies)
    .set(setValue)
    .where(
      and(
        eq(allergies.id, id),
        eq(allergies.tenantId, tenantId),
        eq(allergies.patientId, patientId)
      )
    )
    .returning();

  return row ? allergyToRow(row) : null;
}

export async function deleteAllergy(
  tenantId: string,
  patientId: string,
  id: string
): Promise<boolean> {
  const result = await db
    .delete(allergies)
    .where(
      and(
        eq(allergies.id, id),
        eq(allergies.tenantId, tenantId),
        eq(allergies.patientId, patientId)
      )
    );

  return (result.rowCount ?? 0) > 0;
}
