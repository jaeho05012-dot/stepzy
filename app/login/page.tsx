"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Sparkles, Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { LanguageProvider } from "@/lib/language-context"
import { createClient } from "@/lib/supabase"

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false })
const Scene3D = dynamic(() => import("@/components/scene-3d").then(m => ({ default: m.Scene3D })), { ssr: false })

type AuthTab = "login" | "signup"

// ✅ 왼쪽위→오른쪽아래 (기존)
function FloatingPathsA({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }))
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full text-teal-400" viewBox="0 0 696 316" fill="none">
        {paths.map((path) => (
          <motion.path key={path.id} d={path.d} stroke="currentColor" strokeWidth={path.width}
            strokeOpacity={0.07 + path.id * 0.012}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: [0.2, 0.5, 0.2], pathOffset: [0, 1, 0] }}
            transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, ease: "linear" }} />
        ))}
      </svg>
    </div>
  )
}

// ✅ 왼쪽아래→오른쪽위 (새로 추가)
function FloatingPathsB({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} ${500 - i * 6}C-${380 - i * 5 * position} ${500 - i * 6} -${312 - i * 5 * position} ${100 + i * 6} ${152 - i * 5 * position} -${80 + i * 6}C${616 - i * 5 * position} -${260 + i * 6} ${684 - i * 5 * position} -${600 + i * 6} ${684 - i * 5 * position} -${600 + i * 6}`,
    width: 0.5 + i * 0.03,
  }))
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full text-cyan-300" viewBox="0 0 696 316" fill="none">
        {paths.map((path) => (
          <motion.path key={path.id} d={path.d} stroke="currentColor" strokeWidth={path.width}
            strokeOpacity={0.05 + path.id * 0.01}
            initial={{ pathLength: 0.3, opacity: 0.3 }}
            animate={{ pathLength: 1, opacity: [0.15, 0.4, 0.15], pathOffset: [0, 1, 0] }}
            transition={{ duration: 25 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }} />
        ))}
      </svg>
    </div>
  )
}

interface InputFieldProps {
  icon: React.ComponentType<{ className?: string }>
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  showToggle?: boolean
  onToggle?: () => void
  show?: boolean
}

const InputField = ({ icon: Icon, type, value, onChange, placeholder, showToggle, onToggle, show }: InputFieldProps) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <input
      type={showToggle ? (show ? "text" : "password") : type}
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-white placeholder:text-muted-foreground/50 outline-none transition-all text-sm"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      onFocus={e => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
      onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
    {showToggle && (
      <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    )}
  </div>
)

const GoogleButton = ({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) => (
  <motion.button type="button" onClick={onClick} disabled={disabled}
    whileHover={{ scale: disabled ? 1 : 1.02 }} whileTap={{ scale: disabled ? 1 : 0.98 }}
    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-white text-sm transition-all disabled:opacity-50"
    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    {label}
  </motion.button>
)

const Divider = () => (
  <div className="flex items-center gap-4">
    <div className="flex-1 h-px bg-white/10" />
    <span className="text-muted-foreground text-xs">or</span>
    <div className="flex-1 h-px bg-white/10" />
  </div>
)

const AlertMessage = ({ type, message }: { type: "error" | "success"; message: string }) => (
  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${type === "error" ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-primary/10 border border-primary/20 text-primary"}`}>
    {type === "error" ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
    {message}
  </motion.div>
)

const SubmitButton = ({ isLoading, label, loadingLabel }: { isLoading: boolean; label: string; loadingLabel: string }) => (
  <motion.button type="submit" whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}
    disabled={isLoading} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mt-2 disabled:cursor-not-allowed"
    style={{ background: isLoading ? "rgba(20,184,166,0.4)" : "linear-gradient(135deg, #14b8a6, #0d9488)", boxShadow: isLoading ? "none" : "0 0 30px rgba(20,184,166,0.4)" }}>
    {isLoading ? (
      <span className="flex items-center justify-center gap-2">
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        {loadingLabel}
      </span>
    ) : label}
  </motion.button>
)

function AuthPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<AuthTab>(searchParams.get("tab") === "signup" ? "signup" : "login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirm, setSignupConfirm] = useState("")

  const clearMessages = () => { setError(null); setSuccess(null) }

  const handleGoogleLogin = async () => {
    clearMessages(); setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setIsLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); clearMessages()
    if (!loginEmail || !loginPassword) { setError("Please fill in all fields."); return }
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) {
      setError(error.message.includes("Invalid login credentials") ? "Invalid email or password." : error.message)
      setIsLoading(false)
    } else {
      router.push("/solve"); router.refresh()
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); clearMessages()
    if (!signupName || !signupEmail || !signupPassword || !signupConfirm) { setError("Please fill in all fields."); return }
    if (signupPassword.length < 6) { setError("Password must be at least 6 characters."); return }
    if (signupPassword !== signupConfirm) { setError("Passwords do not match."); return }
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email: signupEmail, password: signupPassword,
      options: { data: { full_name: signupName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message.includes("already registered") ? "This email is already registered." : error.message)
      setIsLoading(false)
    } else {
      setSuccess("Check your email for a confirmation link!")
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      <Scene3D />

      <div className="relative z-10 min-h-screen flex">

        {/* 왼쪽 — FloatingPaths 2개 방향 + Spline */}
        <motion.div
          initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 xl:w-3/5 items-center justify-center relative overflow-hidden"
        >
          {/* ✅ 왼쪽위 → 오른쪽아래 */}
          <div className="absolute inset-0 z-0">
            <FloatingPathsA position={1} />
            <FloatingPathsA position={-1} />
          </div>

          {/* ✅ 왼쪽아래 → 오른쪽위 */}
          <div className="absolute inset-0 z-0">
            <FloatingPathsB position={1} />
            <FloatingPathsB position={-1} />
          </div>

          {/* 민트 글로우 */}
          <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, rgba(20,184,166,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
          </div>

          {/* Spline 로봇 */}
          <div className="relative z-[2] w-full h-full min-h-screen">
            <Spline scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode" style={{ width: "100%", height: "100%" }} />
          </div>

          {/* 하단 텍스트 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute bottom-12 left-12 pointer-events-none z-[3]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold text-sm tracking-widest uppercase">Stepzy AI</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight">
              Your AI-powered<br />
              <span className="bg-gradient-to-r from-primary to-teal-300 bg-clip-text text-transparent">homework helper</span>
            </h2>
          </motion.div>
        </motion.div>

        {/* 오른쪽 — 폼 */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center px-6 py-12 overflow-y-auto"
        >
          <div className="w-full max-w-md">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-8">
              <Link href="/">
                <motion.button
                  className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-muted-foreground hover:text-foreground transition-all text-sm font-medium"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }}>
                  <ArrowLeft className="w-4 h-4" />Back
                </motion.button>
              </Link>
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.8), rgba(20,184,166,0.4))", border: "1px solid rgba(20,184,166,0.5)", boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-black text-xl">Stepzy</span>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
              className="flex mb-6 p-1.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {(["login", "signup"] as AuthTab[]).map(t => (
                <button key={t} onClick={() => { setTab(t); clearMessages() }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={tab === t
                    ? { background: "linear-gradient(135deg, #14b8a6, #0d9488)", color: "white", boxShadow: "0 0 20px rgba(20,184,166,0.3)" }
                    : { color: "rgba(255,255,255,0.4)" }}>
                  {t === "login" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-3xl p-8"
              style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 60px rgba(0,0,0,0.4)" }}>
              <AnimatePresence mode="wait">

                {tab === "login" && (
                  <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} className="space-y-5">
                    <div>
                      <h1 className="text-2xl font-black text-white mb-1">Welcome back</h1>
                      <p className="text-muted-foreground text-sm">Sign in to continue solving problems</p>
                    </div>
                    {error && <AlertMessage type="error" message={error} />}
                    {success && <AlertMessage type="success" message={success} />}
                    <GoogleButton label="Continue with Google" onClick={handleGoogleLogin} disabled={isLoading} />
                    <Divider />
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60">Email</label>
                        <InputField icon={Mail} type="email" value={loginEmail} onChange={setLoginEmail} placeholder="you@example.com" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <label className="text-xs font-medium text-white/60">Password</label>
                          <Link href="/forgot-password" className="text-xs text-primary hover:opacity-80 transition-opacity">Forgot?</Link>
                        </div>
                        <InputField icon={Lock} type="password" value={loginPassword} onChange={setLoginPassword} placeholder="••••••••"
                          showToggle onToggle={() => setShowPassword(!showPassword)} show={showPassword} />
                      </div>
                      <SubmitButton isLoading={isLoading} label="Sign in" loadingLabel="Signing in..." />
                    </form>
                    <p className="text-center text-xs text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <button onClick={() => { setTab("signup"); clearMessages() }} className="text-primary font-semibold hover:opacity-80 transition-opacity">Sign up free</button>
                    </p>
                  </motion.div>
                )}

                {tab === "signup" && (
                  <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
                    <div>
                      <h1 className="text-2xl font-black text-white mb-1">Create account</h1>
                      <p className="text-muted-foreground text-sm">Start solving smarter today</p>
                    </div>
                    {error && <AlertMessage type="error" message={error} />}
                    {success && <AlertMessage type="success" message={success} />}
                    <GoogleButton label="Sign up with Google" onClick={handleGoogleLogin} disabled={isLoading} />
                    <Divider />
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60">Full name</label>
                        <InputField icon={User} type="text" value={signupName} onChange={setSignupName} placeholder="Your name" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60">Email</label>
                        <InputField icon={Mail} type="email" value={signupEmail} onChange={setSignupEmail} placeholder="you@example.com" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60">Password</label>
                        <InputField icon={Lock} type="password" value={signupPassword} onChange={setSignupPassword} placeholder="••••••••"
                          showToggle onToggle={() => setShowPassword(!showPassword)} show={showPassword} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60">Confirm password</label>
                        <InputField icon={Lock} type="password" value={signupConfirm} onChange={setSignupConfirm} placeholder="••••••••"
                          showToggle onToggle={() => setShowConfirm(!showConfirm)} show={showConfirm} />
                      </div>
                      <SubmitButton isLoading={isLoading} label="Create account" loadingLabel="Creating account..." />
                      <p className="text-xs text-muted-foreground text-center">
                        By signing up, you agree to our{" "}
                        <Link href="/terms" className="text-primary hover:opacity-80">Terms</Link>{" & "}
                        <Link href="/privacy" className="text-primary hover:opacity-80">Privacy Policy</Link>
                      </p>
                    </form>
                    <p className="text-center text-xs text-muted-foreground">
                      Already have an account?{" "}
                      <button onClick={() => { setTab("login"); clearMessages() }} className="text-primary font-semibold hover:opacity-80 transition-opacity">Sign in</button>
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

function AuthPageWithSuspense() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  )
}

export default function AuthPage() {
  return (
    <LanguageProvider>
      <AuthPageWithSuspense />
    </LanguageProvider>
  )
}