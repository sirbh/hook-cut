"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Video, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return
    setFile(e.target.files[0])
  }

  async function handleStart() {
    if (!file) return
    setLoading(true)

    // MVP placeholder
    // 1. Request signed upload URL
    // 2. Upload file directly to storage
    // 3. Redirect to processing page
    setTimeout(() => {
      setLoading(false)
      alert("Video uploaded (mock). Start AI analysis.")
    }, 1500)
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

            {/* Icon */}
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Video className="h-6 w-6 text-primary" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold mb-2">
              Upload your video
            </h1>

            {/* Subtitle */}
            <p className="text-muted-foreground mb-6">
              Upload a long video and we’ll find the moments most likely to go viral.
            </p>

            {/* Upload Box */}
            <label
              htmlFor="video-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 hover:border-primary transition"
            >
              <Upload className="h-8 w-8 mb-3 text-muted-foreground" />
              <span className="font-medium">
                {file ? file.name : "Click to upload or drag & drop"}
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                MP4, MOV • Max 60 min • Up to 2 GB
              </span>

              <input
                id="video-upload"
                type="file"
                accept="video/*"
                hidden
                onChange={handleFileChange}
              />
            </label>

            {/* CTA */}
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

            {/* Helper text */}
            <p className="mt-4 text-xs text-muted-foreground">
              By uploading, you confirm you own or have rights to this content.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
