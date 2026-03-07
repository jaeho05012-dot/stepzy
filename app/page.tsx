"use client"

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, ArrowLeft, Upload, ImageIcon, X, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function SolvePage() {
  const [question, setQuestion] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [solution, setSolution] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }, [])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }, [])

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setUploadedImage(null)
    setFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSolve = async () => {
    if (!question.trim() && !uploadedImage) return

    setIsLoading(true)
    setSolution(null)

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock solution response
    const mockSolution = `## Solution

**Understanding the Problem:**
Based on your question, let me break this down into clear, understandable steps.

**Step 1: Identify the Key Components**
First, we need to identify what we're working with and what the question is asking us to find.

**Step 2: Apply the Relevant Concepts**
Now we'll apply the appropriate methods to solve this problem systematically.

**Step 3: Work Through the Calculation**
Let's work through this step by step:
- Start with the given information
- Apply the formula or method
- Simplify and solve

**Step 4: Verify the Answer**
Always check your work by substituting back or using an alternative method.

**Final Answer:**
The solution has been calculated following the steps above. Make sure you understand each step before moving on!

---
*Need more help? Try asking a follow-up question for clarification.*`

    setSolution(mockSolution)
    setIsLoading(false)
  }

  const hasInput = question.trim() || uploadedImage

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500">
              <Sparkles className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-semibold">Stepzy</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-28">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            Solve Your{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Homework
            </span>
          </h1>
          <p className="text-muted-foreground">
            Upload a photo or type your question below
          </p>
        </div>

        {/* Photo Upload Area */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Upload Homework Image
          </label>
          
          {!uploadedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                isDragging
                  ? "border-teal-500 bg-teal-500/10"
                  : "border-border/50 bg-card/30 hover:border-teal-500/50 hover:bg-card/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload homework image"
              />
              
              <div className="flex flex-col items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
                  isDragging
                    ? "bg-teal-500/20"
                    : "bg-gradient-to-br from-teal-500/10 to-cyan-500/10"
                }`}>
                  {isDragging ? (
                    <Upload className="h-8 w-8 text-teal-400" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-teal-400" />
                  )}
                </div>
                
                <div>
                  <p className="mb-1 text-lg font-medium">
                    {isDragging ? "Drop your image here" : "Drag and drop your homework image"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse from your device
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-3 py-1">PNG</span>
                  <span className="rounded-full bg-secondary px-3 py-1">JPG</span>
                  <span className="rounded-full bg-secondary px-3 py-1">HEIC</span>
                  <span className="rounded-full bg-secondary px-3 py-1">WebP</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30">
              <div className="relative aspect-video w-full">
                <Image
                  src={uploadedImage}
                  alt="Uploaded homework"
                  fill
                  className="object-contain"
                />
              </div>
              
              <div className="flex items-center justify-between border-t border-border/50 bg-card/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                    <CheckCircle className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground">Image uploaded successfully</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeImage}
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-sm text-muted-foreground">or type your question</span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* Question Input */}
        <div className="mb-6">
          <label htmlFor="question" className="mb-2 block text-sm font-medium text-muted-foreground">
            Type Your Question
          </label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Paste or type your homework question here..."
            className="min-h-[160px] resize-none rounded-2xl border-border/50 bg-card/30 p-5 text-base placeholder:text-muted-foreground/50 focus:border-teal-500/50 focus:ring-teal-500/20"
          />
        </div>

        {/* Solve Button */}
        <Button
          onClick={handleSolve}
          disabled={!hasInput || isLoading}
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-lg font-medium text-background transition-all hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Solve with AI
            </>
          )}
        </Button>

        {/* Solution Result */}
        {solution && (
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
              <h2 className="text-xl font-semibold">Step-by-Step Explanation</h2>
            </div>
            
            <div className="rounded-2xl border border-border/50 bg-card/30 p-8">
              <div className="prose prose-invert max-w-none">
                {solution.split("\n").map((line, index) => {
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={index} className="mb-4 text-2xl font-bold text-foreground">
                        {line.replace("## ", "")}
                      </h2>
                    )
                  }
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <h3 key={index} className="mb-2 mt-6 text-lg font-semibold text-teal-400">
                        {line.replace(/\*\*/g, "")}
                      </h3>
                    )
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={index} className="ml-4 text-muted-foreground">
                        {line.replace("- ", "")}
                      </li>
                    )
                  }
                  if (line === "---") {
                    return <hr key={index} className="my-6 border-border/50" />
                  }
                  if (line.startsWith("*") && line.endsWith("*")) {
                    return (
                      <p key={index} className="text-sm italic text-muted-foreground">
                        {line.replace(/\*/g, "")}
                      </p>
                    )
                  }
                  if (line.trim()) {
                    return (
                      <p key={index} className="mb-3 text-foreground/90">
                        {line}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
