"use client"

import { motion } from "framer-motion"
import { Camera, Brain, Zap } from "lucide-react"
import { FeatureCard } from "./feature-card"

const features = [
  {
    icon: Camera,
    title: "Photo Solver",
    description: "Simply snap a photo of any homework problem - math equations, physics diagrams, or chemistry formulas. Our AI instantly recognizes and processes it."
  },
  {
    icon: Brain,
    title: "Step-by-Step AI Explanations",
    description: "Get detailed, easy-to-follow explanations that break down complex problems into simple steps. Learn the 'why' behind every answer."
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "No more waiting. Get accurate solutions in under 3 seconds. Perfect for homework, exam prep, or just satisfying your curiosity."
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-4">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Why students love{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Stepzy
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powered by advanced AI, designed for understanding
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
