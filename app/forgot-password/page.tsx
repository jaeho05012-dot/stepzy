"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, Sparkles, CheckCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { LanguageProvider } from "@/lib/language-context"
import dynamic from "next/dynamic"

const Scene3D = dynamic(() => import("@/components/scene-3d").then(m => ({ default: m.Scene3D })), { ssr: false })

function ForgotPasswordInner() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError("이메일을 입력해주세요."); return }
    setIsLoading(true); setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError("이메일 전송에 실패했습니다. 다시 시도해주세요.")
      setIsLoading(false)
    } else {
      setIsSent(true)
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] flex items-center justify-center px-4">
      <Scene3D />

      {/* 배경 글로우 */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* 로고 */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)", boxShadow: "0 0 24px rgba(20,184,166,0.4)" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-black text-white">Stepzy</span>
          </Link>
        </div>

        {/* 카드 */}
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* 상단 하이라이트 */}
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.4), transparent)" }} />

          <div className="p-8">
            {isSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)", boxShadow: "0 0 30px rgba(20,184,166,0.2)" }}
                >
                  <CheckCircle className="w-8 h-8 text-primary" />
                </motion.div>
                <h1 className="text-2xl font-black text-white mb-2">이메일을 확인하세요</h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  <span className="text-white font-semibold">{email}</span>으로<br />
                  비밀번호 재설정 링크를 보냈어요.
                </p>
                <p className="text-muted-foreground/50 text-xs mb-6">
                  이메일이 오지 않으면 스팸함을 확인해보세요.
                </p>
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-sm cursor-pointer text-center"
                    style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)", boxShadow: "0 0 30px rgba(20,184,166,0.35)" }}
                  >
                    로그인으로 돌아가기
                  </motion.div>
                </Link>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-white mb-1.5">비밀번호 찾기</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    가입한 이메일을 입력하면<br />재설정 링크를 보내드려요.
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 rounded-xl text-sm mb-4"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">이메일</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(null) }}
                        placeholder="name@example.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-white placeholder:text-muted-foreground/40 outline-none transition-all text-sm"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                        onFocus={e => e.currentTarget.style.borderColor = "rgba(20,184,166,0.5)"}
                        onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: isLoading ? "rgba(20,184,166,0.4)" : "linear-gradient(135deg, #14b8a6, #0d9488)",
                      boxShadow: isLoading ? "none" : "0 0 30px rgba(20,184,166,0.35)",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        전송 중...
                      </>
                    ) : "재설정 링크 보내기"}
                  </motion.button>
                </form>
              </>
            )}
          </div>

          {/* 하단 */}
          {!isSent && (
            <div className="px-8 pb-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-muted-foreground/60 text-sm pt-5">
                비밀번호가 기억나셨나요?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline transition-all">
                  로그인
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  )
}

export default function ForgotPasswordPage() {
  return (
    <LanguageProvider>
      <ForgotPasswordInner />
    </LanguageProvider>
  )
}