"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AnimatedButton } from "@/components/animated-button"
import { Sparkles } from "lucide-react"
import { TextShimmer } from "@/components/ui/text-shimmer"
import { createClient } from "@/lib/supabase"

export function HeroSection() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleTry = () => {
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      // ✅ 로그인 상태 → Upload 탭으로 이동
      router.push("/solve?tab=upload")
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-balance"
        >
          <TextShimmer duration={3} spread={3} as="span"
            className="text-5xl md:text-7xl lg:text-8xl font-bold [--base-color:#ffffff] [--base-gradient-color:#ffffff] dark:[--base-color:#ffffff] dark:[--base-gradient-color:#e2e8f0]">
            Homework made
          </TextShimmer>
          <br />
          <TextShimmer duration={2} spread={4} as="span"
            className="text-5xl md:text-7xl lg:text-8xl font-bold [--base-color:#0d9488] [--base-gradient-color:#14b8a6] dark:[--base-color:#0d9488] dark:[--base-gradient-color:#5eead4]">
            effortless
          </TextShimmer>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto text-pretty"
        >
          Snap a photo of any problem. Get instant, step-by-step AI explanations that help you truly understand.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <AnimatedButton onClick={handleTry} variant="primary">
            Try Stepzy
          </AnimatedButton>
          <AnimatedButton
            variant="secondary"
            onClick={() => {
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            How it works
          </AnimatedButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: "10K+", label: "Problems Solved", white: true },
            { value: "98%", label: "Accuracy", white: false },
            { value: "< 3s", label: "Response Time", white: true },
          ].map((stat) => (
            <motion.div key={stat.label} className="text-center" whileHover={{ scale: 1.05 }}>
              <TextShimmer duration={2.5} spread={2} as="div"
                className={`text-2xl md:text-3xl font-bold ${
                  stat.white
                    ? "[--base-color:#ffffff] [--base-gradient-color:#e2e8f0] dark:[--base-color:#ffffff] dark:[--base-gradient-color:#f8fafc]"
                    : "[--base-color:#0d9488] [--base-gradient-color:#14b8a6] dark:[--base-color:#0d9488] dark:[--base-gradient-color:#5eead4]"
                }`}>
                {stat.value}
              </TextShimmer>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}