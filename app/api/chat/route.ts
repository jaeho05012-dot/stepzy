import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { compressImage } from "@/lib/compress-image"

export const maxDuration = 60

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
          model: "claude-haiku-4-5-20251001",
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

    const sphereRule = `
[구·공·그림자·손전등·지면 문제인 경우] 닮음비만 사용:
AO = AH - r (A는 HO 위, H는 지면)
닮음비: r : AO = x : AH → x = r×AH/AO, 넓이 = πx²
절대 금지: 좌표계, 접선 방정식, m값 계산, 피타고라스로 접선길이 구하기`

    const htRule = `
[h(t) 또는 교점 개수 문제인 경우] 이 순서 그대로만:
1. g'(x)=(x-1)f(x) 부호표로 극대/극소 위치 확인
2. g(1), g(3) 수치 계산
3. x→-∞ 거동 확인 (x<1 구간 최고차항)
4. h(t) 값: t<극소 → 1, t=극소 → 2, 극소<t<극대 → 3, t=극대 → 2, t>극대 → 1
5. |lim(t→a+)h(t) - lim(t→a-)h(t)|=2 인 a: 극대값과 극소값만 검토
6. S = 조건 만족하는 모든 |a| 합산
재검토/재확인 절대 금지. 표 금지.`

    const tangentRule = `
[접선·접점·부채꼴·원 O 문제인 경우] 원이 커지는 문제:
"원 O를 원 O'이 될 때까지 늘인다" = 하나의 원이 커지는 것, 두 개의 고정된 원이 아님!
접점 A 고정 → PA 고정 → 원이 커지면 중심도 이동 (PO+OO' 방식 절대 금지)
PO = √(PA² + r²), PO' = √(PA² + r'²) (각각 따로 계산)
∠APB = 2×arcsin(r/PO) ← 반드시 2배, 전체각
∠APC = 2×arcsin(r'/PO') ← 반드시 2배, 전체각
∠BPC = ∠APC - ∠APB ← 전체각끼리 빼기
절대 금지: π/3 - π/4 같이 반각끼리 빼기, PO = PO' 로 놓는 것
PB = PC = PA (접선 길이), 부채꼴 넓이 = ½ × PB² × ∠BPC (라디안)`

    const sequenceRule = `
[수열·점화식·등차·등비 문제인 경우] 점화식 인덱스 n, n+1 혼동 금지
등차/등비 판단 먼저, 일반항 구한 후 계산`

    const probabilityRule = `
[확률·경우의 수·조합·순열 문제인 경우] 전체 경우의 수 먼저, 여사건 활용 검토`

    const inverseIntegralRule = `
⚠️ 역함수 정적분: ∫f(x)dx + ∫g(y)dy = xy 공식 최우선 사용.
치환/부분적분보다 직사각형 넓이 해석 먼저. 다항식 나눗셈 시 반드시 검산.`

    const semicircleRule = `
[반원·호 AB·∠PAB·∠QBA·정삼각형 STU 문제인 경우] 반원 기하 극한 — 이 순서 그대로:
1. 좌표계: A=(-1,0), B=(1,0), 반원 중심 O=(0,0)
2. 각도 조건으로 직선 AP, BQ 방정식 세우기
3. 교점 R 좌표를 θ로 표현
4. θ→0 극한: tanθ≈θ, sinθ≈θ, cosθ≈1 근사 사용
5. f(θ), g(θ)를 θ의 거듭제곱으로 표현
6. 극한값 = g(θ)/(θ×f(θ)) 계산
절대 금지: 극한 전 수치 대입, θ=0으로 바로 놓기
정삼각형 STU: UT∥AB → 한 변 길이를 R 좌표로 표현 후 넓이 = (√3/4)×변²`

    const hardModeExtra = (hardMode || isHTproblem) ? `
⚠️ 고난도 문제 — 반드시 이 순서:
1. 풀기 전 문제 구조 한 줄 파악
2. 각 단계 계산 후 결과가 말이 되는지 체크
3. 최종 답을 문제 조건에 대입해서 검증
4. 풀이 중 모순 발견 시 처음부터 다시` : ""

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
규칙: LaTeX $...$ / $$...$$만 사용. π분수유지. 말 최소화. 표 사용 금지.
★ 수식($...$) 안에는 절대 한글을 넣지 마라. 한글 설명은 수식 밖에 써라. 예: ❌ $f(x)는 삼차함수$ → ⭕ $f(x)$는 삼차함수. \text{} 도 쓰지 말고 수식 밖으로 빼라.${sphereRule}${htRule}${tangentRule}${sequenceRule}${probabilityRule}${inverseIntegralRule}${semicircleRule}${hardModeExtra}

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
        ? (hardMode || isHTproblem) ? 5000
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