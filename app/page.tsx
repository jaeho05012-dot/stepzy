"use client"

import { Scene3D } from "@/components/scene-3d"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { SettingsPanel } from "@/components/settings-panel"
import { LanguageProvider } from "@/lib/language-context"
import { motion } from "framer-motion"

function HomeInner() {
  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden">
        <Scene3D />
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <Footer />
      </main>
    </PageTransition>
  )
}

export default function Home() {
  return (
    <LanguageProvider>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-[52px] right-3 md:top-7 md:right-10 z-[200]"
      >
        <SettingsPanel />
      </motion.div>
      <HomeInner />
    </LanguageProvider>
  )
}