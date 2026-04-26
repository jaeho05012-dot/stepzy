"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Upload, Cpu, BookOpen } from "lucide-react"
import { StepCard } from "./step-card"
import { createClient } from "@/lib/supabase"

const steps = [
  {
    number: 1,
    icon: Upload,
    title: "Upload Your Problem",
    description: "Take a photo or upload an image of any homework problem. Our AI works with handwritten or printed content."
  },
  {
    number: 2,
    icon: Cpu,
    title: "AI Analyzes",
    description: "Our advanced AI instantly processes your problem, identifying equations, diagrams, and context for accurate solutions."
  },
  {
    number: 3,
    icon: BookOpen,
    title: "Get Step-by-Step Explanation",
    description: "Receive a clear, detailed breakdown of the solution with each step explained so you can learn and apply the concepts."
  }
]

export function HowItWorksSection() {
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

  const handleStart = () => {
    router.push(isLoggedIn ? "/solve" : "/login")
  }

  return (
    <section className="relative py-32 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            How it{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to homework success
          </p>
        </motion.div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              number={step.number}
              icon={step.icon}
              title={step.title}
              description={step.description}
              delay={index * 0.15}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          {/* ✅ 로그인 상태에 따라 /solve 또는 /login */}
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold bg-gradient-to-r from-primary to-accent text-background hover:shadow-[0_0_40px_rgba(20,184,166,0.5)] transition-all duration-300"
          >
            Start Solving Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}