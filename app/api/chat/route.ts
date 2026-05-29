import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { compressImage } from "@/lib/compress-image"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const IDENTITY = `
## Identity
- Your name is Stepzy AI, built by the Stepzy team.
- If asked "what AI are you?", "who made you?", "are you Claude?", always say: "I'm Stepzy AI, made by the Stepzy team." Never mention any other AI company or model name.`

export async function POST(req: Request) {
  try {
    const { messages, context, imageBase64, hardMode } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 })
    }

    // ── 1. 이미지 처리: 압축 + OCR (explain 방식 그대로) ──
    let compressedImage: { data: string; mediaType: "image/jpeg" } | null = null
    let ocrText = ""

    if (imageBase64) {
      compressedImage = await compressImage(imageBase64)

      // 마지막 유저 메시지에 텍스트가 없으면 OCR 실행
      const lastUserMsg = [...messages].reverse().find((m: { role: string; content: string }) => m.role === "user")
      const lastContent = lastUserMsg?.content?.trim() || ""

      if (!lastContent || lastContent === "이 문제를 풀어주세요." || lastContent === "이 문제를 풀어주세요") {
        const ocrResult = await client.messages.create({
          model: "claude-opus-4-8",
          max_tokens: 800,
          system: "You are an OCR engine. Extract ALL text from the image completely and accurately. Include ALL answer choices (①②③④⑤ or 1.2.3.4.5 or A.B.C.D.E). No solving. Output the exact text only.",
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: compressedImage.mediaType, data: compressedImage.data } },
              { type: "text", text: "Extract ALL text including answer choices exactly as written. Output text only." },
            ],
          }],
        })
        ocrText = ocrResult.content.filter(b => b.type === "text").map(b => (b as Anthropic.TextBlock).text).join("").trim()
      }
    }

    // ── 2. 분석 대상 텍스트 결정 ──
    const lastUserMsg = [...messages].reverse().find((m: { role: string; content: string }) => m.role === "user")
    const lastContent = lastUserMsg?.content || ""
    const analyzeText = ocrText || lastContent

    // ── 3. 문제 유형 감지 (explain 로직 그대로) ──
    const isMultipleChoice =
      /[①②③④⑤]/.test(analyzeText) ||
      /\([1-5]\)/.test(analyzeText) ||
      /^[1-5]\./m.test(analyzeText) ||
      /\b[ABCDE]\./m.test(analyzeText) ||
      /(선택지|보기|다음 중|옳은 것|틀린 것|고르면|골라|answer choice)/i.test(analyzeText)

    const isSphereShadow = /(구|공|그림자|손전등|지면)/.test(analyzeText)
    const isHTproblem = /h\(t\)/.test(analyzeText) || /교점.*개수|개수.*교점/.test(analyzeText)
    const isTangentCircle = /(접선|접점|부채꼴|원\s*O|원\s*O')/.test(analyzeText)

    const sphereRule = isSphereShadow ? `
⚠️ 구 그림자 — 오직 닮음비만:
HO는 수직선, A는 HO 위의 점(수평 아님)
AO=AH-r, x=r×AH/AO, 넓이=πx²
좌표계/접선벡터/삼각함수 절대 금지` : ""

    const htRule = isHTproblem ? `
⚠️ h(t) 문제 — 이 순서 그대로만:
1. g'(x)=(x-1)f(x) 부호표로 극대/극소 위치 확인
2. g(1), g(3) 수치 계산
3. x→-∞ 거동 확인 (x<1 구간 최고차항)
4. h(t) 값: t<극소 → 1, t=극소 → 2, 극소<t<극대 → 3, t=극대 → 2, t>극대 → 1
5. |lim(t→a+)h(t) - lim(t→a-)h(t)|=2 인 a: 극대값과 극소값만 검토
6. S = 조건 만족하는 모든 |a| 합산
재검토/재확인 절대 금지. 표 금지.` : ""

    const tangentRule = isTangentCircle ? `
⚠️ 접선/부채꼴 — 원이 커지는 문제:
"원 O를 원 O'이 될 때까지 늘인다" = 하나의 원이 커지는 것, 두 개의 고정된 원이 아님!
접점 A 고정 → PA 고정 → 원이 커지면 중심도 이동 (PO+OO' 방식 절대 금지)
PO = √(PA² + r²), PO' = √(PA² + r'²) (각각 따로 계산)
∠APB = 2×arcsin(r/PO) ← 반드시 2배, 전체각
∠APC = 2×arcsin(r'/PO') ← 반드시 2배, 전체각
∠BPC = ∠APC - ∠APB ← 전체각끼리 빼기
절대 금지: π/3 - π/4 같이 반각끼리 빼기 (∠BPC = π/12 나오면 틀린 것)
절대 금지: PO = PO' 로 놓는 것, PO' = PO + OO' 방식
PB = PC = PA (접선 길이)
부채꼴 넓이 = ½ × PB² × ∠BPC (라디안)` : ""

    const isSequence = /(수열|점화식|a_n|an|등차|등비)/.test(analyzeText)
    const sequenceRule = isSequence ? `
⚠️ 수열: 점화식 인덱스 n, n+1 혼동 금지
등차/등비 판단 먼저, 일반항 구한 후 계산` : ""

    const isProbability = /(확률|경우의 수|조합|순열|nCr|nPr)/.test(analyzeText)
    const probabilityRule = isProbability ? `
⚠️ 확률: 전체 경우의 수 먼저, 여사건 활용 검토` : ""

    const inverseIntegralRule = `
⚠️ 역함수 정적분: ∫f(x)dx + ∫g(y)dy = xy 공식 최우선 사용.
치환/부분적분보다 직사각형 넓이 해석 먼저. 다항식 나눗셈 시 반드시 검산.`

    const hardModeExtra = hardMode ? `
⚠️ 고난도 문제:
- 계산 전 구조 먼저 파악
- 각 단계 검산 필수
- 최종 답 선지와 대조 확인
- 풀이 중 모순 발견 시 처음부터 다시` : ""

    // ── 4. 시스템 프롬프트 (explain 수준의 정밀한 형식) ──
    const mathFormat = isMultipleChoice
      ? `형식:
**Step 1** $식$
**Step 2** $식$
...
**정답: ③**`
      : `형식:
**Step 1** $식$
**Step 2** $식$
...
$$\\boxed{answer}$$`

    const mathCore = `수능 수학 전문가. 식 위주로 간결하게 풀어라.
규칙: LaTeX $...$ / $$...$$만 사용. π분수유지. 말 최소화. 표 사용 금지.${sphereRule}${htRule}${tangentRule}${sequenceRule}${probabilityRule}${inverseIntegralRule}${hardModeExtra}

${mathFormat}`

    let systemPrompt: string

    if (context) {
      // 후속 질문 (이전 풀이 컨텍스트 있음)
      systemPrompt = `You are Stepzy AI, an expert AI tutor.

Previous solution context:
${context}

${mathCore}
- 문맥에 맞게 이어서 답변. 학생 언어로 답변.${IDENTITY}`
    } else if (compressedImage || isMultipleChoice || isHTproblem || isSphereShadow || isTangentCircle) {
      // 수학 문제 감지됨 → explain 수준 프롬프트
      systemPrompt = `${mathCore}${IDENTITY}`
    } else {
      // 일반 대화
      systemPrompt = `You are Stepzy AI, an expert AI tutor for education and mathematics.

${mathCore}
- 학생 언어로 답변
- 수학: Step 형식으로 핵심 계산만
- 일반 질문: 간결하게${IDENTITY}`
    }

    // ── 5. 메시지 포맷 (이미지 + OCR 텍스트 주입) ──
    const formattedMessages = messages.map((m: { role: string; content: string }, idx: number) => {
      // 마지막 유저 메시지에 이미지 + OCR 결합
      if (idx === messages.length - 1 && m.role === "user" && compressedImage) {
        const userText = m.content?.trim() || ""
        const promptText = ocrText
          ? `풀어주세요.${userText && userText !== "이 문제를 풀어주세요." ? `\n${userText}` : ""}\nOCR: ${ocrText}`
          : userText || "이 문제를 풀어주세요."

        const content: Anthropic.MessageParam["content"] = [
          { type: "image", source: { type: "base64", media_type: compressedImage.mediaType, data: compressedImage.data } },
          { type: "text", text: promptText },
        ]
        return { role: m.role, content }
      }
      return { role: m.role, content: m.content }
    })

    // ── 6. 토큰 조절 ──
    const isMathProblem = compressedImage || isMultipleChoice || isHTproblem || isSphereShadow || isTangentCircle
    const maxTokens = context
      ? 2000
      : isMathProblem
        ? (hardMode || isHTproblem) ? 8000
          : isMultipleChoice ? 3000
          : 2500
        : 2000

    // ── 7. 스트리밍 ──
    const model = (isMathProblem || context) ? "claude-opus-4-8" : "claude-sonnet-4-6"
    const stream = await client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: formattedMessages as Anthropic.MessageParam[],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
          controller.close()
        } catch { controller.close() }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to chat" }, { status: 500 })
  }
}