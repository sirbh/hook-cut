import { Button } from "@/components/ui/button"
import { ArrowRight, Video } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <section className="max-w-4xl px-6 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm mb-6">
          <Video className="h-4 w-4" />
          AI-powered viral clip generator
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Turn Long Videos Into
          <span className="block text-primary">Viral Clips</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Upload a video. We suggest viral timestamps.
          <br />
          You edit. We generate scroll-stopping clips for Instagram.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8">
            Start Generating Clips
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button size="lg" variant="outline" className="text-lg px-8">
            Watch Demo
          </Button>
        </div>

        {/* Trust / Microcopy */}
        <p className="text-sm text-muted-foreground mt-6">
          No credit card required • First video free
        </p>
      </section>
    </main>
  )
}

