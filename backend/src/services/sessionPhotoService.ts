import { and, asc, eq, lt, sql } from 'drizzle-orm';
import { db, sessionPhotos } from '../db/client.js';
import {
  deleteObject,
  generateReadPresignedUrl,
  generateUploadPresignedUrl,
} from '../utils/s3.js';

export interface CreateUploadUrlInput {
  sessionId: string;
  patientId: string;
  tenantId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface SessionPhotoRow {
  id: string;
  session_id: string;
  tenant_id: string;
  patient_id: string;
  s3_key: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  status: 'pending' | 'confirmed';
  uploaded_at: Date | null;
  created_at: Date | null;
}

export interface SessionPhotoWithUrl extends SessionPhotoRow {
  presigned_url: string;
}

function toRow(p: typeof sessionPhotos.$inferSelect): SessionPhotoRow {
  return {
    id: p.id,
    session_id: p.sessionId,
    tenant_id: p.tenantId,
    patient_id: p.patientId,
    s3_key: p.s3Key,
    file_name: p.fileName,
    file_size_bytes: p.fileSizeBytes,
    mime_type: p.mimeType,
    status: p.status as 'pending' | 'confirmed',
    uploaded_at: p.uploadedAt ?? null,
    created_at: p.createdAt ?? null,
  };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function createUploadUrl(
  input: CreateUploadUrlInput
): Promise<{ photo: SessionPhotoRow; upload_url: string }> {
  const uuid = crypto.randomUUID();
  const sanitized = sanitizeFilename(input.fileName);
  const s3Key = `tenants/${input.tenantId}/sessions/${input.sessionId}/${uuid}_${sanitized}`;

  const [row] = await db
    .insert(sessionPhotos)
    .values({
      tenantId: input.tenantId,
      sessionId: input.sessionId,
      patientId: input.patientId,
      s3Key,
      fileName: input.fileName,
      fileSizeBytes: input.fileSizeBytes,
      mimeType: input.mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
      status: 'pending',
    })
    .returning();

  const upload_url = await generateUploadPresignedUrl(
    s3Key,
    input.mimeType,
    300
  );

  return { photo: toRow(row), upload_url };
}

export async function confirmUpload(
  tenantId: string,
  sessionId: string,
  photoId: string
): Promise<SessionPhotoRow | null> {
  const [row] = await db
    .update(sessionPhotos)
    .set({
      status: 'confirmed',
      uploadedAt: sql`now()`,
    })
    .where(
      and(
        eq(sessionPhotos.id, photoId),
        eq(sessionPhotos.sessionId, sessionId),
        eq(sessionPhotos.tenantId, tenantId)
      )
    )
    .returning();

  return row ? toRow(row) : null;
}

export async function listPhotos(
  tenantId: string,
  sessionId: string
): Promise<SessionPhotoWithUrl[]> {
  const rows = await db
    .select()
    .from(sessionPhotos)
    .where(
      and(
        eq(sessionPhotos.tenantId, tenantId),
        eq(sessionPhotos.sessionId, sessionId),
        eq(sessionPhotos.status, 'confirmed')
      )
    )
    .orderBy(asc(sessionPhotos.uploadedAt));

  return Promise.all(
    rows.map(async (row) => {
      const presigned_url = await generateReadPresignedUrl(row.s3Key, 3600);
      return { ...toRow(row), presigned_url };
    })
  );
}

export async function deletePhoto(
  tenantId: string,
  sessionId: string,
  photoId: string
): Promise<void> {
  const [photo] = await db
    .select()
    .from(sessionPhotos)
    .where(
      and(
        eq(sessionPhotos.id, photoId),
        eq(sessionPhotos.sessionId, sessionId),
        eq(sessionPhotos.tenantId, tenantId)
      )
    )
    .limit(1);

  if (!photo) {
    return;
  }

  try {
    await deleteObject(photo.s3Key);
  } catch (err) {
    console.error(
      `[sessionPhotoService] Failed to delete S3 object "${photo.s3Key}":`,
      err
    );
  }

  await db.delete(sessionPhotos).where(eq(sessionPhotos.id, photoId));
}

export async function deleteStalePhendingPhotos(): Promise<number> {
  const oneHourAgo = sql`now() - interval '1 hour'`;

  const deleted = await db
    .delete(sessionPhotos)
    .where(
      and(
        eq(sessionPhotos.status, 'pending'),
        lt(sessionPhotos.createdAt, oneHourAgo)
      )
    )
    .returning({ id: sessionPhotos.id });

  return deleted.length;
}
