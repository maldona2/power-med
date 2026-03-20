/**
 * Unit tests for s3.ts utility
 * Feature: appointment-session-photos
 * Uses Jest with mocked AWS SDK
 */

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  PutObjectCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, _type: 'PutObjectCommand' })),
  GetObjectCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, _type: 'GetObjectCommand' })),
  DeleteObjectCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, _type: 'DeleteObjectCommand' })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import {
  generateUploadPresignedUrl,
  generateReadPresignedUrl,
  deleteObject,
} from '../s3.js';
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ── Typed mock references ─────────────────────────────────────────────────────

const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<
  typeof getSignedUrl
>;
const MockPutObjectCommand = PutObjectCommand as jest.MockedClass<
  typeof PutObjectCommand
>;
const MockGetObjectCommand = GetObjectCommand as jest.MockedClass<
  typeof GetObjectCommand
>;
const MockDeleteObjectCommand = DeleteObjectCommand as jest.MockedClass<
  typeof DeleteObjectCommand
>;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('s3 utility', () => {
  const BUCKET = process.env.AWS_S3_BUCKET_NAME ?? '';
  const KEY = 'tenants/t1/sessions/s1/uuid_photo.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── generateUploadPresignedUrl ──────────────────────────────────────────────

  describe('generateUploadPresignedUrl', () => {
    it('calls getSignedUrl with a PutObjectCommand containing the correct Bucket, Key, and ContentType', async () => {
      mockGetSignedUrl.mockResolvedValue('https://s3.example.com/upload');

      await generateUploadPresignedUrl(KEY, 'image/jpeg', 300);

      expect(MockPutObjectCommand).toHaveBeenCalledWith({
        Bucket: BUCKET,
        Key: KEY,
        ContentType: 'image/jpeg',
      });
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ _type: 'PutObjectCommand' }),
        expect.any(Object)
      );
    });

    it('returns the URL from getSignedUrl', async () => {
      mockGetSignedUrl.mockResolvedValue('https://s3.example.com/upload');

      const result = await generateUploadPresignedUrl(KEY, 'image/jpeg', 300);

      expect(result).toBe('https://s3.example.com/upload');
    });

    it('passes the correct expiresIn TTL', async () => {
      mockGetSignedUrl.mockResolvedValue('https://s3.example.com/upload');

      await generateUploadPresignedUrl(KEY, 'image/jpeg', 300);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { expiresIn: 300 }
      );
    });
  });

  // ── generateReadPresignedUrl ────────────────────────────────────────────────

  describe('generateReadPresignedUrl', () => {
    it('calls getSignedUrl with a GetObjectCommand containing the correct Bucket and Key', async () => {
      mockGetSignedUrl.mockResolvedValue('https://s3.example.com/read');

      await generateReadPresignedUrl(KEY, 3600);

      expect(MockGetObjectCommand).toHaveBeenCalledWith({
        Bucket: BUCKET,
        Key: KEY,
      });
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ _type: 'GetObjectCommand' }),
        expect.any(Object)
      );
    });

    it('returns the URL from getSignedUrl', async () => {
      mockGetSignedUrl.mockResolvedValue('https://s3.example.com/read');

      const result = await generateReadPresignedUrl(KEY, 3600);

      expect(result).toBe('https://s3.example.com/read');
    });

    it('passes the correct expiresIn TTL', async () => {
      mockGetSignedUrl.mockResolvedValue('https://s3.example.com/read');

      await generateReadPresignedUrl(KEY, 3600);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { expiresIn: 3600 }
      );
    });
  });

  // ── deleteObject ────────────────────────────────────────────────────────────

  describe('deleteObject', () => {
    it('calls s3Client.send with a DeleteObjectCommand containing the correct Bucket and Key', async () => {
      mockSend.mockResolvedValue({});

      await deleteObject(KEY);

      expect(MockDeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: BUCKET,
        Key: KEY,
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ _type: 'DeleteObjectCommand' })
      );
    });

    it('resolves without error', async () => {
      mockSend.mockResolvedValue({});

      await expect(deleteObject(KEY)).resolves.toBeUndefined();
    });
  });
});
