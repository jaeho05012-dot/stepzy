"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, Check } from "lucide-react"
import { LanguageProvider } from "@/lib/language-context"
import dynamic from "next/dynamic"

const Scene3D = dynamic(() => import("@/components/scene-3d").then(m => ({ default: m.Scene3D })), { ssr: false })

const privacySections = [
  {
    title: "1. 수집하는 개인정보",
    content: "Stepzy는 서비스 제공을 위해 이메일 주소, 이름(선택), 학습 활동 데이터를 수집합니다. Google 로그인 시 Google에서 제공하는 기본 프로필 정보가 수집될 수 있습니다.",
  },
  {
    title: "2. 개인정보 이용 목적",
    content: "수집된 개인정보는 서비스 제공, 사용자 인증, 학습 기록 관리, 서비스 개선을 위해 사용됩니다. 마케팅 목적으로는 사용자의 사전 동의 없이 사용하지 않습니다.",
  },
  {
    title: "3. 개인정보 제3자 제공",
    content: "Stepzy는 사용자의 개인정보를 제3자에게 판매하지 않습니다. 서비스 운영을 위한 필수적인 경우(인증, 인프라 등)에만 익명화된 데이터를 파트너와 공유할 수 있습니다.",
  },
  {
    title: "4. 쿠키 및 추적 기술",
    content: "Stepzy는 사이트 기능 향상 및 사용 패턴 분석을 위해 쿠키를 사용합니다. 브라우저 설정을 통해 쿠키 사용을 거부할 수 있으나, 일부 서비스 기능이 제한될 수 있습니다.",
  },
  {
    title: "5. 데이터 보안",
    content: "사용자의 데이터는 암호화 및 보안 스토리지를 통해 안전하게 보호됩니다. Supabase의 엔터프라이즈급 보안 인프라를 사용하여 데이터를 관리합니다.",
  },
  {
    title: "6. 사용자 권리",
    content: "사용자는 언제든지 자신의 개인정보에 대한 열람, 수정, 삭제를 요청할 수 있습니다. 계정 삭제 요청 시 모든 개인정보는 30일 이내에 완전히 삭제됩니다.",
  },
  {
    title: "7. 데이터 보유 기간",
    content: "개인정보는 서비스 이용 기간 동안 보유됩니다. 계정 탈퇴 후에는 관련 법령에서 요구하는 기간을 제외하고 즉시 삭제됩니다.",
  },
  {
    title: "8. 정책 변경",
    content: "개인정보처리방침이 변경될 경우 서비스 내 공지를 통해 사전에 알려드립니다. 변경 후 계속 서비스를 이용하면 변경된 방침에 동의한 것으로 간주됩니다.",
  },
]

function PrivacyInner() {
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const handleScroll = () => {
    const el = contentRef.current
    if (!el) return
    const progress = Math.min(1, el.scrollTop / (el.scrollHeight - el.clientHeight))
    setScrollProgress(progress)
  }

  const isFullyRead = scrollProgress >= 0.99

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] flex items-center justify-center px-4 py-10">
      <Scene3D />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* 로고 */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/login">
            <motion.button
              className="flex items-center gap-2 px-3 py-2 rounded-full text-muted-foreground hover:text-foreground transition-all text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }}
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.8), rgba(20,184,166,0.4))", border: "1px solid rgba(20,184,166,0.5)" }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-black text-lg">Stepzy</span>
          </Link>
        </div>

        {/* 카드 */}
        <div className="rounded-3xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 60px rgba(0,0,0,0.4)" }}>

          {/* 헤더 */}
          <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h1 className="text-lg font-bold text-white">개인정보처리방침</h1>
            <p className="text-xs text-muted-foreground mt-0.5">최종 업데이트: 2026년 4월</p>
          </div>

          {/* 스크롤 영역 */}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="overflow-y-auto p-5 space-y-5"
            style={{ maxHeight: "52vh" }}
          >
            {privacySections.map((section, i) => (
              <div key={i}>
                <p className="text-sm font-bold text-white mb-1">{section.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* 스크롤 프로그레스 바 */}
          <div className="px-5 py-2">
            <div className="h-1 w-full rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #14b8a6, #0d9488)" }}
                animate={{ width: `${scrollProgress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-xs text-muted-foreground/50 mt-1.5 text-right">
              {isFullyRead ? "✓ 모두 읽었습니다" : "끝까지 스크롤하면 동의할 수 있어요"}
            </p>
          </div>

          {/* 버튼 */}
          <div className="px-5 pb-5 flex gap-2">
            <motion.button
              onClick={() => router.push("/login")}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold text-muted-foreground transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              거절
            </motion.button>
            <motion.button
              onClick={() => isFullyRead && router.push("/login?agreed=true")}
              disabled={!isFullyRead}
              whileHover={{ scale: isFullyRead ? 1.02 : 1 }}
              whileTap={{ scale: isFullyRead ? 0.98 : 1 }}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
              style={{
                background: isFullyRead ? "linear-gradient(135deg, #14b8a6, #0d9488)" : "rgba(20,184,166,0.2)",
                boxShadow: isFullyRead ? "0 0 24px rgba(20,184,166,0.4)" : "none",
                cursor: isFullyRead ? "pointer" : "not-allowed",
                border: isFullyRead ? "none" : "1px solid rgba(20,184,166,0.2)",
              }}
            >
              {isFullyRead && <Check className="w-4 h-4" />}
              동의
            </motion.button>
          </div>
        </div>
      </motion.div>
    </main>
  )
}

export default function PrivacyPage() {
  return (
    <LanguageProvider>
      <PrivacyInner />
    </LanguageProvider>
  )
}