"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Video } from "lucide-react";
import { fetcher } from "@/lib/fetcher";

export default function HomePage() {
  const router = useRouter();

  // SWR with key null → disabled initially
  const { data, error, mutate, isLoading } = useSWR("/api/identity", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    // key is null initially to disable automatic fetch
    suspense: false,
  });


  // Handle Start click
  const handleStart = async () => {
    try {
      // Trigger fetch manually
      await mutate(); // hits /api/identity and updates data
      router.push("/upload");
    } catch (err) {
      console.error("Failed to initialize session:", err);
      alert("Cannot start upload. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted">
      {/* Animated background glow */}
      <motion.div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <section className="relative z-10 max-w-4xl px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm mb-6 bg-background"
        >
          <Video className="h-4 w-4" />
          AI-powered viral clip generator
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
        >
          Turn Long Videos Into
          <span className="block text-primary mt-2">Viral Clips</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Upload a video. We suggest viral timestamps.
          <br />
          You edit. We generate scroll-stopping clips for Instagram.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={handleStart}
              disabled={isLoading}
            >
              {isLoading ? "Initializing..." : "Start Generating Clips"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Micro trust text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-muted-foreground mt-6"
        >
          No credit card required • First video free
        </motion.p>

        {/* Error message */}
        {error && (
          <p className="mt-4 text-red-500">Failed to initialize session. Please refresh.</p>
        )}
      </section>
    </main>
  );
}
