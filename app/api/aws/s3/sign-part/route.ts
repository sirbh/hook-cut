import {
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: Request) {
  const { key, uploadId, partNumber } = await req.json();

  if (!key || !uploadId || !partNumber) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const command = new UploadPartCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: 900, // 15 minutes
  });

  return NextResponse.json({
    uploadUrl: signedUrl,
    partNumber,
  });
}
