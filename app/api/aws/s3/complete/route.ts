import {
  CompleteMultipartUploadCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: Request) {
  const { key, uploadId, parts } = await req.json();

  const command = new CompleteMultipartUploadCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts, // [{ PartNumber, ETag }]
    },
  });

  await s3.send(command);

  return NextResponse.json({ success: true });
}
