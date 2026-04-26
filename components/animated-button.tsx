"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: "primary" | "secondary"
  className?: string
}

export function AnimatedButton({ 
  href, 
  onClick, 
  children, 
  variant = "primary",
  className 
}: AnimatedButtonProps) {
  const baseStyles = "relative inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 overflow-hidden group"
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-teal-500 to-cyan-500 text-background hover:shadow-[0_0_40px_rgba(20,184,166,0.5)] hover:scale-105",
    secondary: "bg-secondary/50 text-foreground border border-border hover:bg-secondary hover:border-primary/50 backdrop-blur-sm"
  }

  const content = (
    <>
      {/* Glow effect */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"
          initial={false}
        />
      )}
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
      />
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
        <motion.span
          className="inline-block"
          initial={{ x: 0 }}
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </motion.span>
      </span>
    </>
  )

  const buttonClasses = cn(baseStyles, variantStyles[variant], className)

  if (href) {
    return (
      <Link href={href}>
        <motion.span
          className={buttonClasses}
          whileHover={{ scale: variant === "primary" ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {content}
        </motion.span>
      </Link>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      className={buttonClasses}
      whileHover={{ scale: variant === "primary" ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {content}
    </motion.button>
  )
}
