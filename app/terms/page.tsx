"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, Check } from "lucide-react"
import { LanguageProvider } from "@/lib/language-context"
import dynamic from "next/dynamic"

const Scene3D = dynamic(() => import("@/components/scene-3d").then(m => ({ default: m.Scene3D })), { ssr: false })

const termsSections = [
  {
    title: "1. 서비스 개요",
    content: "Stepzy(이하 '서비스')는 AI 기술을 활용하여 학생들의 학습을 도와주는 숙제 도우미 서비스입니다. 본 이용약관은 서비스 이용에 관한 조건 및 절차를 규정합니다.",
  },
  {
    title: "2. 이용자의 의무",
    content: "이용자는 서비스를 이용함에 있어 다음 행위를 하여서는 안 됩니다. 타인의 정보를 도용하거나 허위 정보를 입력하는 행위, 서비스의 정상적인 운영을 방해하는 행위, 저작권 등 지적재산권을 침해하는 행위, 기타 관련 법령에 위반되는 행위.",
  },
  {
    title: "3. 서비스 이용",
    content: "Stepzy는 AI 기반 학습 보조 서비스로, 제공되는 답변은 참고용입니다. AI의 답변이 항상 정확하지 않을 수 있으므로, 중요한 학습 내용은 반드시 교사나 교재를 통해 확인하시기 바랍니다.",
  },
  {
    title: "4. 개인정보 보호",
    content: "Stepzy는 이용자의 개인정보를 소중히 여깁니다. 수집된 개인정보는 서비스 제공 목적으로만 사용되며, 관련 법령에 따라 안전하게 관리됩니다. 자세한 내용은 개인정보처리방침을 참고하세요.",
  },
  {
    title: "5. 서비스 변경 및 중단",
    content: "Stepzy는 서비스의 내용을 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다. 단, 긴급한 경우에는 사전 공지 없이 변경 또는 중단될 수 있습니다.",
  },
  {
    title: "6. 면책조항",
    content: "Stepzy는 AI가 제공하는 정보의 정확성, 완전성에 대해 보증하지 않습니다. 서비스 이용으로 발생한 손해에 대해 Stepzy는 책임을 지지 않습니다.",
  },
  {
    title: "7. 쿠키 및 추적",
    content: "쿠키는 사이트 기능 향상 및 사용 패턴 분석을 위해 사용됩니다. 브라우저 설정을 통해 쿠키 사용을 거부할 수 있으나, 일부 서비스 기능이 제한될 수 있습니다.",
  },
  {
    title: "8. 약관의 변경",
    content: "Stepzy는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 알려드립니다. 변경 후 계속 서비스를 이용하면 변경된 약관에 동의한 것으로 간주됩니다.",
  },
]

function TermsInner() {
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
            <h1 className="text-lg font-bold text-white">이용약관</h1>
            <p className="text-xs text-muted-foreground mt-0.5">최종 업데이트: 2026년 4월</p>
          </div>

          {/* 스크롤 영역 */}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="overflow-y-auto p-5 space-y-5"
            style={{ maxHeight: "52vh" }}
          >
            {termsSections.map((section, i) => (
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

export default function TermsPage() {
  return (
    <LanguageProvider>
      <TermsInner />
    </LanguageProvider>
  )
}