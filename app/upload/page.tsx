"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Video, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return
    setFile(e.target.files[0])
  }

  async function handleStart() {
    if (!file) return

    setLoading(true)
    setProgress(0)

    try {
      // 1️⃣ Request presigned POST data
      const res = await fetch("/api/aws/s3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileType: file.type,
          fileName: file.name,
        }),
      })

      if (!res.ok) throw new Error("Failed to get upload URL")

      const { uploadUrl, fields, key } = await res.json()

      // 2️⃣ Build form data for S3 POST
      const formData = new FormData()
      Object.entries(fields).forEach(([k, v]) =>
        formData.append(k, v as string)
      )
      formData.append("file", file)

      // 3️⃣ Upload using XMLHttpRequest (for progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        }

        xhr.onload = () => {
          console.log(xhr.status)
          if (xhr.status === 204 || xhr.status === 201) resolve()
          else reject(new Error("Upload failed"))
        }

        xhr.onerror = () => reject(new Error("Upload error"))

        xhr.open("POST", uploadUrl)
        xhr.send(formData)
      })

      // 4️⃣ Upload complete
      alert("Upload complete! Starting AI analysis…")

      // TODO: redirect to processing page
      // router.push(`/process?key=${key}`)

    } catch (err) {
      console.error(err)
      alert("Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-8 text-center">

            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Video className="h-6 w-6 text-primary" />
            </div>

            <h1 className="text-2xl font-semibold mb-2">
              Upload your video
            </h1>

            <p className="text-muted-foreground mb-6">
              Upload a long video and we’ll find the moments most likely to go viral.
            </p>

            <label
              htmlFor="video-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 hover:border-primary transition"
            >
              <Upload className="h-8 w-8 mb-3 text-muted-foreground" />
              <span className="font-medium">
                {file ? file.name : "Click to upload or drag & drop"}
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                MP4, MOV • Up to 1 GB
              </span>

              <input
                id="video-upload"
                type="file"
                accept="video/*"
                hidden
                onChange={handleFileChange}
              />
            </label>

            {/* Progress bar */}
            {loading && (
              <div className="mt-6">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Uploading… {progress}%
                </p>
              </div>
            )}

            <div className="mt-8">
              <Button
                size="lg"
                className="w-full text-lg"
                disabled={!file || loading}
                onClick={handleStart}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start Generating Clips
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              By uploading, you confirm you own or have rights to this content.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
