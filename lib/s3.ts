import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION ?? "us-east-1";

export const IS_S3_ENABLED = !!BUCKET;

/** S3 client using the SDK's default credential provider chain (same as Bedrock). */
const s3 = IS_S3_ENABLED
  ? new S3Client({ region: REGION })
  : null;

/**
 * Upload a file buffer to S3.
 * Returns the S3 object key.
 */
export async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (!s3 || !BUCKET) throw new Error("S3 is not configured");
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return key;
}

/**
 * Generate a pre-signed download URL valid for 1 hour.
 */
export async function getSignedDownloadUrl(key: string): Promise<string> {
  if (!s3 || !BUCKET) throw new Error("S3 is not configured");
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 3600 }
  );
}

/**
 * Delete an object from S3.
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (!s3 || !BUCKET) return;
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/**
 * Build an S3 key for a lesson file.
 * e.g. "lessons/user_abc123/lesson_xyz/original.pdf"
 */
export function buildLessonKey(
  userId: string,
  lessonId: string,
  fileName: string
): string {
  const ext = fileName.split(".").pop() ?? "bin";
  return `lessons/${userId}/${lessonId}/original.${ext}`;
}
