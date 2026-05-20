// lib/math-validator.ts
import { evaluate } from "mathjs"

/**
 * Stepzy 수학 답 검증 엔진
 * Claude 응답의 최종 답을 mathjs로 검산
 */

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
export type ValidationResult = {
  isValid: boolean
  confidence: "high" | "medium" | "low" | "unknown"
  claudeAnswer: string | null
  computedAnswer: string | null
  reason: string
}

export type ProblemContext = {
  question: string
  claudeResponse: string
}

// ─────────────────────────────────────────────
// 메인 함수
// ─────────────────────────────────────────────
export function validateMathAnswer(ctx: ProblemContext): ValidationResult {
  const { question, claudeResponse } = ctx

  // Claude 답에서 최종 정답 추출
  const claudeAnswer = extractFinalAnswer(claudeResponse)
  if (!claudeAnswer) {
    return {
      isValid: true,
      confidence: "unknown",
      claudeAnswer: null,
      computedAnswer: null,
      reason: "답 추출 불가 (서술형 응답)",
    }
  }

  // 문제 유형 판단 → 유형별 검증
  const type = detectProblemType(question)

  try {
    if (type === "equation") return validateEquation(question, claudeAnswer)
    if (type === "arithmetic") return validateArithmetic(question, claudeAnswer)
    if (type === "multiple_choice") return validateMultipleChoice(claudeAnswer)
  } catch (e) {
    return {
      isValid: true,
      confidence: "unknown",
      claudeAnswer,
      computedAnswer: null,
      reason: `검증 오류: ${(e as Error).message}`,
    }
  }

  return {
    isValid: true,
    confidence: "unknown",
    claudeAnswer,
    computedAnswer: null,
    reason: "검증 불가 유형 (적분/극한 등)",
  }
}

// ─────────────────────────────────────────────
// Claude 답변에서 최종 정답 추출
// ─────────────────────────────────────────────
function extractFinalAnswer(response: string): string | null {
  const patterns = [
    /정답[:\s]*\**\s*([①②③④⑤])/,                    // 객관식: 정답: ③
    /정답[:\s]*\**\s*([-+]?\d+(?:\.\d+)?)/,           // 숫자: 정답: 42
    /\\boxed\{([^}]+)\}/,                              // LaTeX: \boxed{7}
    /답[:\s]*([①②③④⑤])/,                              // 답: ④
    /답[:\s]*\**\s*([-+]?\d+(?:\.\d+)?)/,             // 답: 7
    /따라서[^.]*?([①②③④⑤])/,                          // 따라서 ... ③
    /\*\*\s*([①②③④⑤])\s*\*\*/,                        // **③**
    /따라서[^.]*?([-+]?\d+(?:\.\d+)?)\s*$/m,          // 따라서 ... 42
  ]

  for (const p of patterns) {
    const m = response.match(p)
    if (m) return m[1].trim()
  }
  return null
}

// ─────────────────────────────────────────────
// 문제 유형 감지
// ─────────────────────────────────────────────
function detectProblemType(
  question: string
): "equation" | "arithmetic" | "multiple_choice" | "unknown" {
  if (/[①②③④⑤]/.test(question)) return "multiple_choice"
  if (/=\s*0|해를?\s*구|방정식/.test(question)) return "equation"
  if (/[+\-*/^]\s*\d|계산|값을?\s*구/.test(question)) return "arithmetic"
  return "unknown"
}

// ─────────────────────────────────────────────
// 방정식 검증: Claude 답을 대입해서 0이 나오는지
// ─────────────────────────────────────────────
function validateEquation(question: string, claudeAnswer: string): ValidationResult {
  const eqMatch = question.match(/([a-z\d\s+\-*/^().]+?)\s*=\s*0/i)
  if (!eqMatch) {
    return { isValid: true, confidence: "unknown", claudeAnswer, computedAnswer: null, reason: "방정식 추출 실패" }
  }

  const expr = normalize(eqMatch[1])
  const num = toNumber(claudeAnswer)
  if (num === null) {
    return { isValid: true, confidence: "low", claudeAnswer, computedAnswer: null, reason: "답을 숫자로 변환 불가" }
  }

  try {
    const result = evaluate(expr, { x: num })
    const ok = Math.abs(result) < 1e-9
    return {
      isValid: ok,
      confidence: "high",
      claudeAnswer,
      computedAnswer: ok ? claudeAnswer : `대입 결과: ${result}`,
      reason: ok ? `x=${num} 대입 → 0 ✅` : `x=${num} 대입 → ${result} (≠ 0)`,
    }
  } catch {
    return { isValid: true, confidence: "unknown", claudeAnswer, computedAnswer: null, reason: "수식 평가 실패" }
  }
}

// ─────────────────────────────────────────────
// 산술 검증: 계산식 결과와 Claude 답 비교
// ─────────────────────────────────────────────
function validateArithmetic(question: string, claudeAnswer: string): ValidationResult {
  const exprMatch = question.match(/([\d+\-*/^().\s]+?)(?:의\s*값|을\s*구|=|\?|은\?|는\?)/)
  if (!exprMatch) {
    return { isValid: true, confidence: "unknown", claudeAnswer, computedAnswer: null, reason: "계산식 추출 실패" }
  }

  const expr = normalize(exprMatch[1])
  const num = toNumber(claudeAnswer)
  if (num === null) {
    return { isValid: true, confidence: "low", claudeAnswer, computedAnswer: null, reason: "답 숫자 변환 불가" }
  }

  try {
    const computed = evaluate(expr)
    const ok = Math.abs(computed - num) < 1e-6
    return {
      isValid: ok,
      confidence: "high",
      claudeAnswer,
      computedAnswer: String(computed),
      reason: ok ? `${expr} = ${computed} ✅` : `${expr} = ${computed} (Claude: ${num})`,
    }
  } catch {
    return { isValid: true, confidence: "unknown", claudeAnswer, computedAnswer: null, reason: "계산 실패" }
  }
}

// ─────────────────────────────────────────────
// 객관식: 형식만 체크 (①~⑤ 중 하나인지)
// ─────────────────────────────────────────────
function validateMultipleChoice(claudeAnswer: string): ValidationResult {
  const ok = /[①②③④⑤]/.test(claudeAnswer)
  return {
    isValid: ok,
    confidence: ok ? "medium" : "low",
    claudeAnswer,
    computedAnswer: null,
    reason: ok ? "객관식 형식 정상" : "①~⑤ 중 하나가 아님",
  }
}

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
function normalize(expr: string): string {
  return expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "").trim()
}

function toNumber(s: string): number | null {
  const map: Record<string, number> = { "①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5 }
  if (s in map) return map[s]
  const n = parseFloat(s.replace(/[^\d.\-+]/g, ""))
  return isNaN(n) ? null : n
}