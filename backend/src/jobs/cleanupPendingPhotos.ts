import { deleteStalePhendingPhotos } from '../services/sessionPhotoService.js';

export async function runCleanupPendingPhotos(): Promise<void> {
  try {
    const count = await deleteStalePhendingPhotos();
    if (count > 0) {
      console.info(
        `[cleanupPendingPhotos] Deleted ${count} stale pending photo(s)`
      );
    }
  } catch (err) {
    console.error('[cleanupPendingPhotos] Error during cleanup:', err);
  }
}
