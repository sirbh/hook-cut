"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import axios from "axios" // Using axios for simpler multipart progress

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per part

export default function UploadView() {
    // const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        handleStart(file)
    }

    // --- Strategy 1: Single Upload (Presigned POST) ---
    async function performSingleUpload(
        uploadUrl: string,
        fields: Record<string, string>,
        file:File
    ) {
        const formData = new FormData()
        Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
        formData.append("file", file!)

        return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    setProgress(Math.round((e.loaded / e.total) * 100))
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve()
                } else {
                    console.error("Upload failed")
                    console.error("Status:", xhr.status)
                    console.error("Response:", xhr.responseText)

                    reject({
                        status: xhr.status,
                        response: xhr.responseText
                    })
                }
            }

            xhr.onerror = () => {
                console.error("Network error")
                reject(new Error("Network error"))
            }

            xhr.open("POST", uploadUrl)
            xhr.send(formData)
        })
    }


    // --- Strategy 2: Multipart Upload ---
    async function performMultipartUpload(uploadId: string, fileKey: string, file:File) {
        const totalParts = Math.ceil(file!.size / CHUNK_SIZE)
        const completedParts = []
        let uploadedBytes = 0

        for (let i = 1; i <= totalParts; i++) {
            const start = (i - 1) * CHUNK_SIZE
            const end = Math.min(start + CHUNK_SIZE, file!.size)
            const chunk = file!.slice(start, end)

            console.log(uploadId,fileKey,i)

            // 1. Get signed URL for this part from a new API endpoint you'll need
            // (You can also add this logic to your main POST if you prefer a 'get-part' action)
            const signRes = await axios.post("/api/aws/s3/sign-part", {
                uploadId,
                key: fileKey,
                partNumber: i,
            })
            const { uploadUrl } = signRes.data

            // 2. Upload the chunk
            const uploadRes = await axios.put(uploadUrl, chunk, {
                onUploadProgress: (e) => {
                    const currentProgress = Math.round(((uploadedBytes + e.loaded) / file!.size) * 100)
                    setProgress(Math.min(currentProgress, 99)) // Keep at 99 until finalized
                }
            })

            uploadedBytes += chunk.size
            completedParts.push({ ETag: uploadRes.headers.etag, PartNumber: i })
        }

        // 3. Complete Multipart Upload
        await axios.post("/api/aws/s3/complete", {
            uploadId,
            key: fileKey,
            parts: completedParts
        })
        setProgress(100)
    }

    async function handleStart(file:File) {
        setLoading(true)
        setProgress(0)

        try {
            // 1️⃣ Get Strategy from Backend
            const res = await fetch("/api/aws/s3", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileType: file.type,
                    fileName: file.name,
                    fileSize: file.size, // Required by your new backend logic
                }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to initialize upload")
            }

            const data = await res.json()

            // 2️⃣ Execute Strategy
            if (data.strategy === "single") {
                await performSingleUpload(data.uploadUrl, data.fields, file)
            } else {
                await performMultipartUpload(data.uploadId, data.fileKey, file)
            }

            toast.success("Upload complete! Processing video...")
        } catch (err: unknown) {
            console.error(err)
            toast.error("Upload failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mx-auto mt-10"
        >
            <h1 className="text-2xl font-semibold mb-2 text-center">Upload your video</h1>
            <p className="text-muted-foreground mb-6 text-center">
                Upload a video up to 1GB. We&apos;ll handle the rest.
            </p>

            <label
                htmlFor="video-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 p-12 hover:border-primary transition bg-card"
            >
                <Upload className="h-10 w-10 mb-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground mt-2">
                    MP4, WebM, MOV, MKV • Max 1 GB
                </span>
                <input id="video-upload" type="file" accept="video/*" hidden onChange={handleFileChange} />
            </label>

            {loading && (
                <div className="mt-8 space-y-2">
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <Button
                    size="lg"
                    className="w-full h-12 text-lg font-bold"
                    // disabled={!file || loading}
                    // onClick={handleStart}
                >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Start Generation"}
                </Button>
            </div>
        </motion.section>
    )
}