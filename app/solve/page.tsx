"use client"

import { useState, useCallback, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload, Camera, Sparkles, X, Loader2, CheckCircle, Pencil,
  Bot, MessageCircle, Mic, MicOff, Image, Plus, Send,
  Copy, RotateCcw, ThumbsUp, ThumbsDown, Check, Zap
} from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { Scene3D } from "@/components/scene-3d"
import { PageTransition } from "@/components/page-transition"
import { SettingsPanel } from "@/components/settings-panel"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { StarButton } from "@/components/ui/star-button"
import MotionButton from "@/components/ui/motion-button"
import { cn } from "@/lib/utils"

type Tab = "chat" | "upload" | "camera" | "type"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  image?: string
}

async function compressImageClient(base64: string, maxSizeMB = 3): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const maxPx = 1600
      let { width, height } = img
      if (width > maxPx || height > maxPx) {
        const ratio = Math.min(maxPx / width, maxPx / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      canvas.getContext("2d")?.drawImage(img, 0, 0, width, height)
      let quality = 0.85
      let result = canvas.toDataURL("image/jpeg", quality)
      while (result.length > maxSizeMB * 1024 * 1024 * 1.37 && quality > 0.3) {
        quality -= 0.1
        result = canvas.toDataURL("image/jpeg", quality)
      }
      resolve(result)
    }
    img.src = base64
  })
}

const SolutionContent = ({ solution }: { solution: string }) => (
  <div className="prose prose-invert max-w-none">
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <p className="text-foreground/90 leading-relaxed text-base mb-3">{children}</p>,
        strong: ({ children }) => <strong className="text-foreground font-bold">{children}</strong>,
        code: ({ children }) => <code className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-sm font-mono">{children}</code>,
        pre: ({ children }) => <pre className="bg-black/30 border border-border/50 rounded-2xl p-4 overflow-x-auto my-4">{children}</pre>,
        h1: ({ children }) => <h1 className="text-foreground font-bold text-2xl mb-3">{children}</h1>,
        h2: ({ children }) => <h2 className="text-foreground font-bold text-xl mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-foreground font-semibold text-lg mb-2">{children}</h3>,
        li: ({ children }) => <li className="text-foreground/80 leading-relaxed">{children}</li>,
      }}
    >
      {solution}
    </ReactMarkdown>
  </div>
)

// ✅ 고난도 토글 컴포넌트
const HardModeToggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
  <motion.button
    onClick={() => onChange(!enabled)}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
    style={enabled ? {
      background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))",
      border: "1px solid rgba(251,191,36,0.4)",
      color: "#fbbf24",
      boxShadow: "0 0 16px rgba(251,191,36,0.2)",
    } : {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.4)",
    }}
  >
    <Zap className={cn("w-3.5 h-3.5", enabled && "fill-yellow-400")} />
    고난도
    <div className="relative w-7 h-4 rounded-full transition-all ml-0.5"
      style={{ background: enabled ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.1)" }}>
      <motion.div
        className="absolute top-0.5 w-3 h-3 rounded-full"
        animate={{ left: enabled ? "calc(100% - 14px)" : "2px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ background: enabled ? "#fbbf24" : "rgba(255,255,255,0.4)" }}
      />
    </div>
  </motion.button>
)

const MessageActions = ({
  message, onRetry, isLast,
}: {
  message: ChatMessage
  onRetry?: () => void
  isLast?: boolean
}) => {
  const [copied, setCopied] = useState(false)
  const [vote, setVote] = useState<"up" | "down" | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.15 }}
      className={cn("flex items-center gap-0.5 mt-1", message.role === "user" ? "justify-end" : "justify-start pl-1")}
    >
      <motion.button onClick={handleCopy} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Copy"
        className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground/35 hover:text-muted-foreground/70 hover:bg-white/5 transition-all">
        <AnimatePresence mode="wait">
          {copied
            ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="w-3.5 h-3.5 text-primary" /></motion.span>
            : <motion.span key="copy" initial={{ scale: 1 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy className="w-3.5 h-3.5" /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {message.role === "assistant" && (
        <>
          {isLast && onRetry && (
            <motion.button onClick={onRetry} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Regenerate"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground/35 hover:text-muted-foreground/70 hover:bg-white/5 transition-all">
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.button>
          )}
          <motion.button onClick={() => setVote(vote === "up" ? null : "up")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Good response"
            className={cn("flex items-center justify-center w-7 h-7 rounded-lg transition-all",
              vote === "up" ? "text-primary bg-primary/10" : "text-muted-foreground/35 hover:text-muted-foreground/70 hover:bg-white/5")}>
            <ThumbsUp className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button onClick={() => setVote(vote === "down" ? null : "down")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Bad response"
            className={cn("flex items-center justify-center w-7 h-7 rounded-lg transition-all",
              vote === "down" ? "text-red-400 bg-red-400/10" : "text-muted-foreground/35 hover:text-muted-foreground/70 hover:bg-white/5")}>
            <ThumbsDown className="w-3.5 h-3.5" />
          </motion.button>
        </>
      )}
    </motion.div>
  )
}

const ChatMessageItem = ({
  message, onRetry, isLast, isStreaming,
}: {
  message: ChatMessage
  onRetry?: () => void
  isLast?: boolean
  isStreaming?: boolean
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
    className={cn("flex mb-5", message.role === "user" ? "justify-end" : "justify-start items-start gap-3")}
  >
    {message.role === "assistant" && (
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
        style={{ background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)" }}>
        <Bot className="w-3.5 h-3.5 text-primary" />
      </div>
    )}
    <div className={cn("flex flex-col", message.role === "user" ? "items-end max-w-[70%]" : "items-start max-w-[80%]")}>
      {message.role === "user" ? (
        <div className="px-4 py-3 text-[15px] leading-relaxed text-foreground"
          style={{ background: "rgba(20,184,166,0.12)", borderRadius: "18px 18px 4px 18px" }}>
          {message.image && (
            <div className="mb-2.5 rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", maxWidth: "240px" }}>
              <img src={message.image} alt="uploaded" className="w-full max-h-[180px] object-cover rounded-xl" />
            </div>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      ) : (
        <div className="px-4 py-3 rounded-[20px] rounded-tl-md w-full"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <SolutionContent solution={message.content} />
        </div>
      )}
      {!isStreaming && message.content && <MessageActions message={message} onRetry={onRetry} isLast={isLast} />}
    </div>
  </motion.div>
)

function SolvePageInner() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()

  const initialTab = (searchParams.get("tab") as Tab) ?? "upload"
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [hardMode, setHardMode] = useState(false)

  const [isDragging, setIsDragging] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [solution, setSolution] = useState<string | null>(null)
  const [typedProblem, setTypedProblem] = useState("")
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const chatFileInputRef = useRef<HTMLInputElement>(null)

  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null)
  const [showChatCamera, setShowChatCamera] = useState(false)
  const chatVideoRef = useRef<HTMLVideoElement>(null)

  const [isListening, setIsListening] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [isStreamingLast, setIsStreamingLast] = useState(false)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatMessages])

  useEffect(() => {
    const initialMessage = sessionStorage.getItem("initialMessage")
    if (initialMessage) {
      sessionStorage.removeItem("initialMessage")
      setTimeout(() => sendChatMessage(initialMessage), 500)
    }
  }, [])

  useEffect(() => {
    const textarea = chatInputRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"
    }
  }, [chatInput])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR = window.SpeechRecognition || (window as Window & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition
      if (SR) {
        setIsVoiceSupported(true)
        const recognition = new SR()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = "ko-KR"
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results).map((r: SpeechRecognitionResult) => r[0].transcript).join("")
          setChatInput(transcript)
        }
        recognition.onend = () => setIsListening(false)
        recognition.onerror = () => setIsListening(false)
        recognitionRef.current = recognition
      }
    }
  }, [])

  useEffect(() => {
    if (showChatCamera) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          if (chatVideoRef.current) { chatVideoRef.current.srcObject = stream; chatVideoRef.current.play() }
        })
        .catch(() => { alert("Camera access permission is required!"); setShowChatCamera(false) })
    }
  }, [showChatCamera])

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (isListening) { recognitionRef.current.stop(); setIsListening(false) }
    else { setChatInput(""); recognitionRef.current.start(); setIsListening(true) }
  }

  const analyzeWithAI = async (question?: string, imageBase64?: string) => {
    setIsAnalyzing(true); setSolution(null)
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ question, imageBase64, hardMode }),
      })
      if (!res.ok) throw new Error("API error")
      if (!res.body) throw new Error("No stream")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ""
      setIsAnalyzing(false); setSolution("")
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += decoder.decode(value, { stream: true })
        setSolution(result)
      }
    } catch {
      setSolution("Something went wrong. Please try again.")
      setIsAnalyzing(false)
    }
  }

  const sendChatMessage = async (overrideInput?: string) => {
    const msg = overrideInput ?? chatInput
    if ((!msg.trim() && !chatImagePreview) || isChatLoading) return
    setChatInput("")
    const imageToSend = chatImagePreview
    setChatImagePreview(null)
    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: msg.trim(), image: imageToSend ?? undefined }]
    setChatMessages(newMessages)
    setIsChatLoading(true); setIsStreamingLast(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          context: solution ?? "",
          imageBase64: imageToSend ?? undefined,
        }),
      })
      if (!res.ok) throw new Error("API error")
      if (!res.body) throw new Error("No stream")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ""
      setChatMessages([...newMessages, { role: "assistant", content: "" }])
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += decoder.decode(value, { stream: true })
        setChatMessages([...newMessages, { role: "assistant", content: result }])
      }
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }])
    } finally {
      setIsChatLoading(false); setIsStreamingLast(false)
    }
  }

  const handleRetry = async () => {
    if (isChatLoading) return
    const withoutLast = chatMessages.slice(0, -1)
    const lastUser = [...withoutLast].reverse().find(m => m.role === "user")
    if (!lastUser) return
    setChatMessages(withoutLast); setIsChatLoading(true); setIsStreamingLast(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: withoutLast.map(m => ({ role: m.role, content: m.content })),
          context: solution ?? "",
          imageBase64: lastUser.image ?? undefined,
        }),
      })
      if (!res.ok || !res.body) throw new Error()
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ""
      setChatMessages([...withoutLast, { role: "assistant", content: "" }])
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += decoder.decode(value, { stream: true })
        setChatMessages([...withoutLast, { role: "assistant", content: result }])
      }
    } catch {
      setChatMessages([...withoutLast, { role: "assistant", content: "Something went wrong." }])
    } finally {
      setIsChatLoading(false); setIsStreamingLast(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => { const base64 = ev.target?.result as string; setUploadedImage(base64); analyzeWithAI(undefined, base64) }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => { const base64 = ev.target?.result as string; setUploadedImage(base64); analyzeWithAI(undefined, base64) }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleChatImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const compressed = await compressImageClient(ev.target?.result as string)
        setChatImagePreview(compressed)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(tr => tr.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const clearAll = () => { setUploadedImage(null); setSolution(null); setTypedProblem(""); setChatMessages([]); stopCamera() }
  const switchTab = (tab: Tab) => { if (tab !== "chat") clearAll(); setActiveTab(tab) }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); setCameraActive(true) }
    } catch { alert("Camera access permission is required!") }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0)
    const base64 = canvas.toDataURL("image/jpeg", 0.85)
    setUploadedImage(base64); stopCamera(); analyzeWithAI(undefined, base64)
  }

  const tabs = [
    { id: "chat" as Tab, label: "Chat", icon: MessageCircle },
    { id: "upload" as Tab, label: t.uploadPhoto, icon: Upload },
    { id: "camera" as Tab, label: t.takePhoto, icon: Camera },
    { id: "type" as Tab, label: t.typeQuestion, icon: Pencil },
  ]

  const hasSolution = solution !== null

  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-x-hidden">
        <Scene3D />

        {activeTab === "chat" && (
          <div className="fixed inset-0 z-40 flex flex-col" style={{ background: "#080808" }}>
            <Scene3D />

            <div className="relative z-10 flex items-center justify-between px-6 py-3 backdrop-blur-xl flex-shrink-0"
              style={{ background: "#080808", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-4">
                <Link href="/"><MotionButton label="Back" /></Link>
                <div className="w-px h-6 bg-border/20" />
                <div className="flex items-center gap-2.5">
                  <motion.div
                    animate={{ boxShadow: ["0 0 8px rgba(20,184,166,0.3)", "0 0 20px rgba(20,184,166,0.6)", "0 0 8px rgba(20,184,166,0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.4), rgba(20,184,166,0.1))", border: "1px solid rgba(20,184,166,0.4)" }}>
                    <Bot className="w-4 h-4 text-primary" />
                  </motion.div>
                  <div>
                    <p className="font-bold text-foreground text-sm leading-tight">Stepzy AI</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                      <span className="text-xs text-primary/70">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground/30 mr-1">Switch to:</span>
                {tabs.filter(tab => tab.id !== "chat").map(({ id, label, icon: Icon }) => (
                  <StarButton key={id} onClick={() => switchTab(id)} lightColor="rgba(20,184,166,0.9)" backgroundColor="rgba(20,184,166,0.06)" borderWidth={1} duration={2.5} lightWidth={80} className="bg-card/10 hover:bg-card/30 text-xs">
                    <Icon className="w-3.5 h-3.5" />{label}
                  </StarButton>
                ))}
                <div className="ml-1 pl-2 border-l border-border/20"><SettingsPanel /></div>
              </div>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-4 py-8 w-full">
                {chatMessages.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center">
                    <motion.div animate={{ scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }} transition={{ duration: 4, repeat: Infinity }}
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.25), rgba(20,184,166,0.05))", border: "1px solid rgba(20,184,166,0.35)", boxShadow: "0 0 60px rgba(20,184,166,0.15)" }}>
                      <Sparkles className="w-10 h-10 text-primary" />
                    </motion.div>
                    <div>
                      <h2 className="text-3xl font-black text-foreground mb-2 tracking-tight">How can I help you?</h2>
                      <p className="text-muted-foreground text-base max-w-sm leading-relaxed">
                        Ask me anything — math, science, study tips, or anything you&apos;re curious about.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
                      {[
                        { icon: "📐", text: "Solve a math problem", sub: "Step-by-step" },
                        { icon: "📖", text: "Explain a concept", sub: "Clear explanation" },
                        { icon: "🔍", text: "Check my answer", sub: "Verify your work" },
                        { icon: "💡", text: "Give me a hint", sub: "Gentle nudge" },
                      ].map(({ icon, text, sub }) => (
                        <motion.button key={text} onClick={() => sendChatMessage(text)}
                          whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                          className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span className="text-xl mt-0.5">{icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{text}</p>
                            <p className="text-xs text-muted-foreground/50 mt-0.5">{sub}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {chatMessages.map((msg, i) => {
                  const isLast = i === chatMessages.length - 1
                  const isStreaming = isLast && isStreamingLast
                  return (
                    <ChatMessageItem key={i} message={msg} isLast={isLast} isStreaming={isStreaming}
                      onRetry={isLast && msg.role === "assistant" ? handleRetry : undefined} />
                  )
                })}

                {isChatLoading && chatMessages[chatMessages.length - 1]?.role === "user" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mb-6 items-start">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      style={{ background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)" }}>
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="px-4 py-3 rounded-[20px] rounded-tl-md" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="flex gap-1.5 items-center">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} className="w-2 h-2 rounded-full bg-primary/50"
                            animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            <div className="relative z-10 px-4 pb-5 pt-3 flex-shrink-0" style={{ background: "#080808" }}>
              <div className="max-w-2xl mx-auto">
                <div className="rounded-3xl overflow-hidden transition-all duration-300"
                  style={{ background: "rgba(31,32,35,0.95)", border: isListening ? "1px solid rgba(20,184,166,0.5)" : "1px solid rgba(68,68,68,0.8)", boxShadow: "0 8px 30px rgba(0,0,0,0.24)" }}>
                  <AnimatePresence>
                    {chatImagePreview && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 px-3 pt-3">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <img src={chatImagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                          <button onClick={() => setChatImagePreview(null)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-all">
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {isListening && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 px-4 pt-3">
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                        <span className="text-xs text-primary font-medium">Listening... speak now</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <textarea ref={chatInputRef} value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage() } }}
                    placeholder={isListening ? "Listening..." : "Message Stepzy AI..."}
                    className="w-full bg-transparent text-gray-100 placeholder:text-gray-500 resize-none outline-none focus:ring-0 text-base leading-relaxed px-4 pt-4 pb-2 min-h-[56px] max-h-[200px]"
                    rows={1} />
                  <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1">
                    <div className="flex items-center gap-1">
                      <input ref={chatFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleChatImageSelect} />
                      <motion.button type="button" onClick={() => chatFileInputRef.current?.click()}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="Attach image">
                        <Plus className="w-5 h-5" />
                      </motion.button>
                      <motion.button type="button" onClick={() => setShowChatCamera(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="Take photo">
                        <Camera className="w-4 h-4" />
                      </motion.button>
                      <div className="h-4 w-px bg-white/10 mx-1" />
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-gray-500 border border-white/5">
                        <span>Sonnet 4.6</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isVoiceSupported && (
                        <motion.button onClick={toggleVoice}
                          className={cn("flex h-8 items-center gap-1.5 rounded-full px-2 border transition-all",
                            isListening ? "bg-primary/15 border-primary/50 text-primary" : "bg-transparent border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/10")}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          animate={isListening ? { scale: [1, 1.05, 1] } : {}} transition={isListening ? { duration: 1.2, repeat: Infinity } : {}}>
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          <AnimatePresence>
                            {isListening && (
                              <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                className="text-xs overflow-hidden whitespace-nowrap">Stop</motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      )}
                      <motion.button onClick={() => sendChatMessage()}
                        disabled={(!chatInput.trim() && !chatImagePreview) || isChatLoading}
                        className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all font-medium",
                          (chatInput.trim() || chatImagePreview) && !isChatLoading ? "bg-white text-black hover:bg-white/80" : "bg-white/5 text-gray-600 cursor-not-allowed")}
                        whileHover={(chatInput.trim() || chatImagePreview) ? { scale: 1.05 } : {}}
                        whileTap={(chatInput.trim() || chatImagePreview) ? { scale: 0.95 } : {}}>
                        {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">Enter to send · Shift+Enter for new line</p>
              </div>
            </div>

            <AnimatePresence>
              {showChatCamera && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-border/50" style={{ background: "rgba(15,15,15,0.95)" }}>
                    <video ref={chatVideoRef} className="w-full" autoPlay playsInline muted />
                    <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4">
                      <motion.button onClick={async () => {
                        if (!chatVideoRef.current) return
                        const canvas = document.createElement("canvas")
                        canvas.width = chatVideoRef.current.videoWidth
                        canvas.height = chatVideoRef.current.videoHeight
                        canvas.getContext("2d")?.drawImage(chatVideoRef.current, 0, 0)
                        const compressed = await compressImageClient(canvas.toDataURL("image/jpeg", 0.85))
                        setChatImagePreview(compressed)
                        ;(chatVideoRef.current.srcObject as MediaStream)?.getTracks().forEach(t => t.stop())
                        setShowChatCamera(false)
                      }} className="w-16 h-16 rounded-full bg-primary border-4 border-white/20 shadow-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Camera className="w-7 h-7 text-background" />
                      </motion.button>
                      <motion.button onClick={() => {
                        ;(chatVideoRef.current?.srcObject as MediaStream)?.getTracks().forEach(t => t.stop())
                        setShowChatCamera(false)
                      }} className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <X className="w-7 h-7 text-foreground" />
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab !== "chat" && (
          <>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="fixed top-7 left-10 z-50">
              <Link href="/"><MotionButton label="Back" /></Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="fixed top-7 right-10 z-[200]">
              <SettingsPanel />
            </motion.div>

            <div className="relative min-h-screen flex items-center justify-center px-6 py-24">
              <div className="w-full max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-14">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{t.badge}</span>
                  </div>
                  <h1 className="text-6xl md:text-7xl font-black mb-5 text-foreground tracking-tight">
                    {t.uploadYour}{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t.problem}</span>
                  </h1>
                  <p className="text-xl text-muted-foreground">{t.heroSubtitle}</p>
                </motion.div>

                {/* 탭 + 고난도 토글 */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="flex justify-center items-center gap-4 mb-10">
                  <div className="inline-flex p-1.5 gap-1 rounded-2xl backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {tabs.map(({ id, label, icon: Icon }) => (
                      <button key={id} onClick={() => switchTab(id)}
                        className={cn("flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                          activeTab === id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
                        <Icon className="w-4 h-4" />{label}
                      </button>
                    ))}
                  </div>
                  <HardModeToggle enabled={hardMode} onChange={setHardMode} />
                </motion.div>

                {/* ✅ 고난도 모드 안내 — Stepzy Pro */}
                <AnimatePresence>
                  {hardMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center justify-center gap-2 mb-6 text-xs font-medium"
                      style={{ color: "#fbbf24" }}
                    >
                      <Zap className="w-3.5 h-3.5 fill-yellow-400" />
                      고난도 문제는 Stepzy Pro가 풉니다
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                  <AnimatePresence mode="wait">
                    {activeTab === "upload" && !uploadedImage && (
                      <motion.div key="upload" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                        className={cn("relative p-20 rounded-3xl border-2 border-dashed transition-all duration-300",
                          isDragging ? "border-primary bg-primary/5 scale-[1.02]" : hardMode ? "border-yellow-500/30 hover:border-yellow-500/50" : "border-border/30 hover:border-primary/40 hover:bg-white/[0.02]")}
                        style={{ background: isDragging ? undefined : "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}>
                        <div className="flex flex-col items-center gap-8">
                          <motion.div className="w-28 h-28 rounded-3xl flex items-center justify-center"
                            style={hardMode ? {
                              background: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.08))",
                              border: "1px solid rgba(251,191,36,0.35)",
                              boxShadow: "0 0 40px rgba(251,191,36,0.2)",
                            } : {
                              background: "linear-gradient(135deg, rgba(20,184,166,0.25), rgba(20,184,166,0.08))",
                              border: "1px solid rgba(20,184,166,0.35)",
                              boxShadow: "0 0 40px rgba(20,184,166,0.2)",
                            }}
                            animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}>
                            <Upload className="w-14 h-14" style={{ color: hardMode ? "#fbbf24" : "var(--primary)" }} />
                          </motion.div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground mb-3">{isDragging ? t.dropHere : t.dragDrop}</p>
                            <p className="text-muted-foreground text-lg mb-8">{t.orBrowse}</p>
                          </div>
                          <label>
                            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                            <motion.div
                              className="flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-lg cursor-pointer transition-shadow"
                              style={hardMode ? {
                                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                color: "black",
                                boxShadow: "0 0 40px rgba(251,191,36,0.3)",
                              } : {
                                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                                color: "var(--background)",
                              }}
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                              <Image className="w-6 h-6" />{t.chooseImage}
                            </motion.div>
                          </label>
                          <p className="text-sm text-muted-foreground/50">{t.supports}</p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "camera" && !uploadedImage && (
                      <motion.div key="camera" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                        className="relative rounded-3xl border border-border/30 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}>
                        {!cameraActive ? (
                          <div className="flex flex-col items-center gap-8 p-20">
                            <div className="w-28 h-28 rounded-3xl flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.25), rgba(20,184,166,0.08))", border: "1px solid rgba(20,184,166,0.35)", boxShadow: "0 0 40px rgba(20,184,166,0.2)" }}>
                              <Camera className="w-14 h-14 text-primary" />
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-foreground mb-3">{t.captureCamera}</p>
                              <p className="text-muted-foreground text-lg mb-8">{t.cameraSubtitle}</p>
                            </div>
                            <motion.button onClick={startCamera}
                              className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-background font-bold text-lg hover:shadow-[0_0_40px_rgba(20,184,166,0.35)] transition-shadow"
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                              <Camera className="w-6 h-6" />{t.startCamera}
                            </motion.button>
                          </div>
                        ) : (
                          <div className="relative">
                            <video ref={videoRef} className="w-full" autoPlay playsInline muted />
                            <div className="absolute bottom-8 inset-x-0 flex justify-center gap-4">
                              <motion.button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-primary border-4 border-white/20 shadow-xl flex items-center justify-center" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Camera className="w-9 h-9 text-background" />
                              </motion.button>
                              <motion.button onClick={stopCamera} className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <X className="w-9 h-9 text-foreground" />
                              </motion.button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "type" && !uploadedImage && !isAnalyzing && !hasSolution && (
                      <motion.div key="type" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                        className="rounded-3xl border border-border/30 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}>
                        <div className="p-10">
                          <textarea value={typedProblem} onChange={e => setTypedProblem(e.target.value)} placeholder={t.typePlaceholder}
                            className="w-full h-56 bg-transparent text-foreground placeholder:text-muted-foreground/40 resize-none outline-none text-xl leading-relaxed" />
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/20">
                            <span className="text-sm text-muted-foreground/50">{typedProblem.length} characters</span>
                            <motion.button onClick={() => { if (typedProblem.trim()) analyzeWithAI(typedProblem) }}
                              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-background font-bold text-lg hover:shadow-[0_0_40px_rgba(20,184,166,0.35)] transition-shadow"
                              whileHover={{ scale: typedProblem.trim() ? 1.04 : 1 }} whileTap={{ scale: 0.98 }}>
                              <Sparkles className="w-5 h-5" />{t.solve}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {isAnalyzing && (
                      <motion.div key="analyzing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="p-16 rounded-3xl border border-border/30" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}>
                        <div className="flex items-center justify-center gap-4">
                          <Loader2 className="w-7 h-7 animate-spin" style={{ color: hardMode ? "#fbbf24" : "var(--primary)" }} />
                          <span className="text-xl font-medium text-foreground">
                            {hardMode ? "Stepzy Pro가 분석 중..." : t.aiAnalyzing}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {uploadedImage && !isAnalyzing && (
                      <motion.div key="image-result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="relative rounded-3xl overflow-hidden border border-border/30" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}>
                          <img src={uploadedImage} alt="Uploaded problem" className="w-full max-h-96 object-contain" />
                          <motion.button onClick={clearAll} className="absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-sm border border-border/50 hover:bg-destructive/20 transition-all"
                            style={{ background: "rgba(0,0,0,0.5)" }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <X className="w-5 h-5" />
                          </motion.button>
                        </div>
                        {hasSolution && (
                          <div className="p-10 rounded-3xl border border-primary/20" style={{ background: "rgba(20,184,166,0.03)", backdropFilter: "blur(20px)" }}>
                            <div className="flex items-center gap-3 mb-8">
                              <CheckCircle className="w-7 h-7 text-primary" />
                              <h3 className="text-2xl font-bold text-foreground">{t.solution}</h3>
                              {hardMode && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                                  style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                                  Stepzy Pro
                                </span>
                              )}
                            </div>
                            <SolutionContent solution={solution!} />
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "type" && hasSolution && !uploadedImage && !isAnalyzing && (
                      <motion.div key="type-solution" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="p-10 rounded-3xl border border-primary/20" style={{ background: "rgba(20,184,166,0.03)", backdropFilter: "blur(20px)" }}>
                        <div className="flex items-center gap-3 mb-8">
                          <CheckCircle className="w-7 h-7 text-primary" />
                          <h3 className="text-2xl font-bold text-foreground">{t.solution}</h3>
                          {hardMode && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                              Stepzy Pro
                            </span>
                          )}
                          <button onClick={clearAll} className="ml-auto text-sm text-muted-foreground/60 hover:text-foreground transition-colors">{t.tryStepzy}</button>
                        </div>
                        <SolutionContent solution={solution!} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </main>
    </PageTransition>
  )
}

export default function SolvePage() {
  return (
    <LanguageProvider>
      <Suspense fallback={null}>
        <SolvePageInner />
      </Suspense>
    </LanguageProvider>
  )
}