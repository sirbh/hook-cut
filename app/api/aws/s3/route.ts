import { S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { NextResponse } from "next/server"
import crypto from "crypto"

const s3 = new S3Client({
  region: process.env.AWS_REGION
})

const MAX_SIZE = 1024 * 1024 * 1024 // 1 GB
const ALLOWED_EXTENSIONS = ["mp4", "webm", "mov", "mkv"]

export async function POST(req: Request) {
  try {
    const { fileType, fileName } = await req.json()

    if (!fileType || !fileName) {
      return NextResponse.json(
        { error: "fileType and fileName are required" },
        { status: 400 }
      )
    }

    // 1️⃣ Validate extension (UX + early reject)
    const extension = fileName.split(".").pop()?.toLowerCase()
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: "Invalid file extension" },
        { status: 400 }
      )
    }

    // 2️⃣ Validate MIME type shape (cheap sanity check)
    if (!fileType.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only video uploads are allowed" },
        { status: 400 }
      )
    }

    // 3️⃣ Generate secure object key
    const fileKey = `uploads/${crypto.randomUUID()}.${extension}`

    // 4️⃣ Create POST policy (S3-enforced)
    const { url, fields } = await createPresignedPost(s3, {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileKey,
      Conditions: [
        ["content-length-range", 0, MAX_SIZE],      // ≤ 1 GB
        ["starts-with", "$Content-Type", "video/"], // video only
        ["eq", "$key", fileKey],                    // cannot change path
      ],
      Fields: {
        "Content-Type": fileType,
      },
      Expires: 60, // seconds
    })

    return NextResponse.json({
      uploadUrl: url,
      fields,
      key: fileKey,
    })
  } catch (err) {
    console.error("Presigned upload error:", err)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
