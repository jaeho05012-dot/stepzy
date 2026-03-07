import Link from "next/link"
import { Camera, Sparkles, Zap, Upload, Brain, CheckCircle } from "lucide-react"
import  Button  from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500">
              <Sparkles className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-semibold">Stepzy</span>
          </Link>
          <Link href="/solve">
            <Button className="rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 text-background hover:from-teal-400 hover:to-cyan-400">
              Try Stepzy
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
        {/* Background gradient effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-[300px] w-[400px] rounded-full bg-teal-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-teal-400" />
            <span>AI-Powered Homework Helper</span>
          </div>
          
          <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Understand Your Homework{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Upload a question or paste your homework and get a clear step-by-step explanation powered by AI.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/solve">
              <Button size="lg" className="h-14 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-8 text-lg font-medium text-background hover:from-teal-400 hover:to-cyan-400">
                Try Stepzy
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="h-14 rounded-full border-border/50 px-8 text-lg font-medium hover:bg-secondary">
                How it works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Why Students Love{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Stepzy
              </span>
            </h2>
            <p className="text-muted-foreground">
              Everything you need to ace your homework
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Camera className="h-6 w-6" />}
              title="Photo Homework Solver"
              description="Simply take a photo of your homework question and let AI analyze it instantly."
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6" />}
              title="Step-by-Step AI Explanation"
              description="Get detailed, easy-to-understand explanations that help you learn, not just copy."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Instant Results"
              description="No waiting. Get your step-by-step solution in seconds, anytime you need it."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative px-6 py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              How It{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-muted-foreground">
              Three simple steps to homework success
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              number="1"
              icon={<Upload className="h-6 w-6" />}
              title="Upload or paste your homework"
              description="Take a photo, upload an image, or simply paste your question."
            />
            <StepCard
              number="2"
              icon={<Brain className="h-6 w-6" />}
              title="AI analyzes the problem"
              description="Our AI understands your question and formulates the best approach."
            />
            <StepCard
              number="3"
              icon={<CheckCircle className="h-6 w-6" />}
              title="Step-by-step explanation appears"
              description="Get a clear, detailed explanation you can actually understand."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-secondary/50 to-secondary/30 p-12 text-center">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[200px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-teal-500/30 to-cyan-500/30 blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Stop struggling with homework
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of students who are learning smarter with Stepzy
            </p>
            <Link href="/solve">
              <Button size="lg" className="h-14 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-10 text-lg font-medium text-background hover:from-teal-400 hover:to-cyan-400">
                Start Solving
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500">
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <span className="font-semibold">Stepzy</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by AI. Built for students.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group rounded-2xl border border-border/50 bg-card/50 p-8 transition-all duration-300 hover:border-teal-500/50 hover:bg-card">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-teal-400 transition-colors group-hover:from-teal-500/30 group-hover:to-cyan-500/30">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="relative rounded-2xl border border-border/50 bg-card/50 p-8">
      <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-sm font-bold text-background">
        {number}
      </div>
      <div className="mb-4 mt-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-teal-400">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
