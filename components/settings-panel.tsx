"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, X, Globe, Check, ChevronRight } from "lucide-react"
import { useLanguage, type LangCode } from "@/lib/language-context"

interface Language {
  code: LangCode
  name: string
  native: string
  flag: string
}

const languages: Language[] = [
  { code: "en", name: "English", native: "English", flag: "EN" },
  { code: "ko", name: "Korean", native: "한국어", flag: "KO" },
  { code: "zh", name: "Chinese", native: "中文", flag: "ZH" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "JA" },
  { code: "ru", name: "Russian", native: "Русский", flag: "RU" },
]

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { lang, setLang, t } = useLanguage()
  const [tempLang, setTempLang] = useState<LangCode>(lang)
  const [hoveredLang, setHoveredLang] = useState<string | null>(null)

  const handleOpen = () => {
    setTempLang(lang)
    setIsOpen(true)
  }

  const handleSave = () => {
    setLang(tempLang)
    setIsOpen(false)
  }

  return (
    <>
      <motion.button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer"
        style={{
          background: "rgba(20,184,166,0.06)",
          border: "1px solid rgba(20,184,166,0.12)",
          backdropFilter: "blur(12px)",
        }}
        whileHover={{
          scale: 1.08,
          background: "rgba(20,184,166,0.12)",
          borderColor: "rgba(20,184,166,0.25)",
        }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open settings"
      >
        <motion.div
          animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Settings className="w-[18px] h-[18px] text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center px-4"
            style={{ zIndex: 100 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
              }}
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-md rounded-3xl flex flex-col"
              style={{
                background: "linear-gradient(180deg, rgba(18,30,30,0.98) 0%, rgba(10,18,18,0.98) 100%)",
                border: "1px solid rgba(20,184,166,0.12)",
                boxShadow: "0 0 80px rgba(20,184,166,0.08), 0 25px 60px rgba(0,0,0,0.5)",
                maxHeight: "85vh",
              }}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 30 } }}
              exit={{ opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.25 } }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-7 pb-2 shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(20,184,166,0.06))",
                      border: "1px solid rgba(20,184,166,0.15)",
                    }}
                  >
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground tracking-tight">{t.settings}</h2>
                    <p className="text-xs text-muted-foreground">{t.customize}</p>
                  </div>
                </div>

                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  whileHover={{ scale: 1.1, background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.3)" }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close settings"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Divider */}
              <div
                className="mx-7 my-4 h-px shrink-0"
                style={{ background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.15), transparent)" }}
              />

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-7 pb-3 min-h-0">
                <div className="flex items-center gap-2 mb-5">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground tracking-wide uppercase">
                    {t.language}
                  </span>
                </div>

                <div className="space-y-2">
                  {languages.map((langItem, i) => {
                    const isSelected = tempLang === langItem.code
                    const isHovered = hoveredLang === langItem.code

                    return (
                      <motion.button
                        key={langItem.code}
                        onClick={() => setTempLang(langItem.code)}
                        onMouseEnter={() => setHoveredLang(langItem.code)}
                        onMouseLeave={() => setHoveredLang(null)}
                        className="relative w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer text-left overflow-hidden"
                        style={{
                          background: isSelected ? "rgba(20,184,166,0.1)" : "rgba(255,255,255,0.02)",
                          border: isSelected ? "1px solid rgba(20,184,166,0.25)" : "1px solid rgba(255,255,255,0.04)",
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.08 + i * 0.06 } }}
                        whileHover={{
                          background: isSelected ? "rgba(20,184,166,0.14)" : "rgba(20,184,166,0.06)",
                          borderColor: isSelected ? "rgba(20,184,166,0.35)" : "rgba(20,184,166,0.12)",
                        }}
                        whileTap={{ scale: 0.985 }}
                      >
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: "radial-gradient(ellipse at 0% 50%, rgba(20,184,166,0.08) 0%, transparent 70%)",
                            }}
                            layoutId="langGlow"
                          />
                        )}

                        <motion.div
                          className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg, rgba(20,184,166,0.25), rgba(20,184,166,0.1))"
                              : "rgba(255,255,255,0.04)",
                            border: isSelected ? "1px solid rgba(20,184,166,0.3)" : "1px solid rgba(255,255,255,0.06)",
                          }}
                          animate={isSelected || isHovered ? { scale: 1.05 } : { scale: 1 }}
                        >
                          <span
                            className="text-xs font-bold font-mono"
                            style={{ color: isSelected ? "rgba(20,184,166,1)" : "rgba(255,255,255,0.4)" }}
                          >
                            {langItem.flag}
                          </span>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: isSelected ? "rgba(20,184,166,1)" : "rgba(255,255,255,0.85)" }}
                          >
                            {langItem.name}
                          </p>
                          <p
                            className="text-xs truncate mt-0.5"
                            style={{ color: isSelected ? "rgba(20,184,166,0.6)" : "rgba(255,255,255,0.3)" }}
                          >
                            {langItem.native}
                          </p>
                        </div>

                        <motion.div
                          className="shrink-0"
                          animate={isSelected ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.3 }}
                        >
                          {isSelected ? (
                            <motion.div
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{
                                background: "linear-gradient(135deg, oklch(0.72 0.15 175), oklch(0.65 0.18 185))",
                                boxShadow: "0 0 12px rgba(20,184,166,0.3)",
                              }}
                              layoutId="langCheck"
                            >
                              <Check className="w-3.5 h-3.5 text-primary-foreground" />
                            </motion.div>
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                          )}
                        </motion.div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 pt-4 pb-7 shrink-0">
                <div
                  className="h-px mb-5"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.15), transparent)" }}
                />
                <motion.button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-primary-foreground cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.72 0.15 175), oklch(0.65 0.18 185))",
                    boxShadow: "0 0 30px rgba(20,184,166,0.15)",
                  }}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 50px rgba(20,184,166,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check className="w-4 h-4" />
                  {t.saveChanges}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}