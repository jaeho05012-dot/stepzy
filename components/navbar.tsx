"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, LogOut, User, ChevronDown } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 현재 로그인 상태 체크
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    // 로그인/로그아웃 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setShowDropdown(false)
    router.push("/")
    router.refresh()
  }

  // 아바타 이니셜 추출
  const getInitial = () => {
    const name = user?.user_metadata?.full_name || user?.email || ""
    return name.charAt(0).toUpperCase()
  }

  // 표시 이름
  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-3 py-2 md:px-4 md:py-3"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50">

          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-background" />
            </motion.div>
            <span className="text-base md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Stepzy
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              /* ✅ 로그인 상태 — 프로필 아바타 */
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setShowDropdown(!showDropdown)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-2 py-1.5 md:gap-2.5 md:px-3 md:py-2 rounded-xl transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {/* 아바타 */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #14b8a6, #0d9488)",
                      boxShadow: "0 0 12px rgba(20,184,166,0.4)",
                    }}
                  >
                    {getInitial()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-foreground max-w-[100px] truncate">
                    {getDisplayName()}
                  </span>
                  <motion.div animate={{ rotate: showDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </motion.div>
                </motion.button>

                {/* 드롭다운 */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden"
                      style={{
                        background: "rgba(18,18,18,0.97)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                      }}
                    >
                      {/* 유저 정보 */}
                      <div className="px-4 py-3.5 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
                          >
                            {getInitial()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{getDisplayName()}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* 메뉴 */}
                      <div className="p-1.5">
                        <Link href="/solve" onClick={() => setShowDropdown(false)}>
                          <motion.div
                            whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                          >
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">Go to Stepzy</span>
                          </motion.div>
                        </Link>

                        <motion.div
                          onClick={handleSignOut}
                          whileHover={{ backgroundColor: "rgba(239,68,68,0.08)" }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all mt-0.5"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400">Sign out</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ✅ 비로그인 상태 — 기존 버튼들 */
              <>
                <Link href="/login" className="hidden sm:block">
                  <motion.button
                    className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign in
                  </motion.button>
                </Link>

                <Link href="/login?tab=signup" className="hidden sm:block">
                  <motion.button
                    className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10 hover:border-primary/70 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign up
                  </motion.button>
                </Link>

                <Link href="/login">
                  <motion.button
                    className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-background font-semibold text-sm hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </motion.nav>
  )
}