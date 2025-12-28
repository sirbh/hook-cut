import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

const MAX_SIZE = 1024 * 1024 * 1024; // 1 GB
const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 100 MB
const ALLOWED_EXTENSIONS = ["mp4", "webm", "mov", "mkv"];

export async function POST(req: Request) {
  try {
    const { fileType, fileName, fileSize } = await req.json();

    const extension = validateFile({ fileType, fileName, fileSize });
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where:{
        user_id:userId
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.create({
      data: {
        userId:user.id,
        rawVideoS3Key: "", // placeholder, will update after upload
        status: "NEW",
        
      },
    });

    // Generate S3 key (use projectId)
    const fileKey = `users/${userId}/projects/${project.id}/raw/original.${extension}`;


    // 🔀 Decide strategy
    if (fileSize <= MULTIPART_THRESHOLD) {
      const result = await handleSingleUpload({
        s3,
        fileKey,
        fileType,
      });

      await prisma.project.update({
        where:{
          id:project.id
        },
        data:{
          rawVideoS3Key:result.fileKey,
          status:"UPLOADED"
        }
      })

      return NextResponse.json(result);
    }

    const result = await handleMultipartUpload({ fileKey });
    return NextResponse.json(result);
  } catch (err: unknown) {
    // Narrow the 'unknown' type to a real Error object
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";

    console.error("Presigned upload error:", err);

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

function validateFile({
  fileType,
  fileName,
  fileSize,
}: {
  fileType: string;
  fileName: string;
  fileSize: number;
}) {
  if (!fileType || !fileName || !fileSize) {
    throw new Error("fileType, fileName and fileSize are required");
  }

  if (fileSize > MAX_SIZE) {
    throw new Error("File too large");
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error("Invalid file extension");
  }

  if (!fileType.startsWith("video/")) {
    throw new Error("Only video uploads are allowed");
  }

  return extension;
}

async function handleSingleUpload({
  s3,
  fileKey,
  fileType,
}: {
  s3: S3Client;
  fileKey: string;
  fileType: string;
}) {
  const { url, fields } = await createPresignedPost(s3, {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey,
    Conditions: [
      ["content-length-range", 0, MULTIPART_THRESHOLD], // Ensure strict size check
      ["starts-with", "$Content-Type", "video/"],
    ],
    Fields: {
      "Content-Type": fileType,
    },
    Expires: 600, // 10 minutes
  });

  console.log(fields);

  return {
    strategy: "single",
    uploadUrl: url,
    fields,
    fileKey,
  };
}

import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function handleMultipartUpload({ fileKey }: { fileKey: string }) {
  const command = new CreateMultipartUploadCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey,
  });

  const response = await s3.send(command);

  return {
    strategy: "multipart",
    uploadId: response.UploadId,
    fileKey: response.Key,
  };
}
