import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { SessionPhoto } from '@/types';

export type { SessionPhoto };

export function useSessionPhotos(sessionId: string | null): {
  photos: SessionPhoto[];
  loading: boolean;
  uploadPhoto: (file: File) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  refetch: () => void;
} {
  const [photos, setPhotos] = useState<SessionPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPhotos = useCallback(async () => {
    if (!sessionId) {
      setPhotos([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get<SessionPhoto[]>(
        `/sessions/${sessionId}/photos`
      );
      setPhotos(data);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhoto = useCallback(
    async (file: File) => {
      if (!sessionId) return;

      // Phase 1: request presigned upload URL
      const { data: uploadData } = await api.post<{
        photo_id: string;
        upload_url: string;
      }>(`/sessions/${sessionId}/photos/upload-url`, {
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type,
      });

      // Phase 2: PUT file directly to S3 (no auth headers)
      await fetch(uploadData.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Phase 3: confirm the upload
      await api.post(
        `/sessions/${sessionId}/photos/${uploadData.photo_id}/confirm`
      );

      await fetchPhotos();
    },
    [sessionId, fetchPhotos]
  );

  const deletePhoto = useCallback(
    async (photoId: string) => {
      if (!sessionId) return;
      await api.delete(`/sessions/${sessionId}/photos/${photoId}`);
      await fetchPhotos();
    },
    [sessionId, fetchPhotos]
  );

  return {
    photos,
    loading,
    uploadPhoto,
    deletePhoto,
    refetch: fetchPhotos,
  };
}
