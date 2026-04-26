"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepCardProps {
  number: number
  icon: LucideIcon
  title: string
  description: string
  delay?: number
}

export function StepCard({ number, icon: Icon, title, description, delay = 0 }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <motion.div
        className={cn(
          "relative flex items-start gap-6 p-6 rounded-2xl",
          "bg-card/30 backdrop-blur-sm border border-border/30",
          "hover:bg-card/50 hover:border-primary/30",
          "transition-all duration-500 group"
        )}
        whileHover={{ x: 10 }}
      >
        {/* Number badge */}
        <motion.div
          className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="text-2xl font-bold text-background">{number}</span>
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Connecting line */}
        <div className="absolute -bottom-8 left-8 w-[2px] h-8 bg-gradient-to-b from-primary/50 to-transparent last:hidden" />
      </motion.div>
    </motion.div>
  )
}
