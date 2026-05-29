import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { compressImage } from "@/lib/compress-image"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { question, imageBase64, hardMode } = body

    let finalQuestion = question?.trim() || ""
    let compressedImage: { data: string; mediaType: "image/jpeg" } | null = null

    if (imageBase64) {
      compressedImage = await compressImage(imageBase64)

      if (!finalQuestion) {
        const ocrResult = await anthropic.messages.create({
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
        finalQuestion = ocrResult.content.filter(b => b.type === "text").map(b => (b as Anthropic.TextBlock).text).join("").trim()
      }
    }

    if (!finalQuestion && !compressedImage) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 })
    }

    const isMultipleChoice =
      /[①②③④⑤]/.test(finalQuestion) ||
      /\([1-5]\)/.test(finalQuestion) ||
      /^[1-5]\./m.test(finalQuestion) ||
      /\b[ABCDE]\./m.test(finalQuestion) ||
      /(선택지|보기|다음 중|옳은 것|틀린 것|고르면|골라|answer choice)/i.test(finalQuestion)

    const isSphereShadow = /(구|공|그림자|손전등|지면)/.test(finalQuestion)
    const isHTproblem = /h\(t\)/.test(finalQuestion) || /교점.*개수|개수.*교점/.test(finalQuestion)
    const isTangentCircle = /(접선|접점|부채꼴|원\s*O|원\s*O')/.test(finalQuestion)

    const sphereRule = isSphereShadow ? `
⚠️ 구 그림자 — 닮음비만 사용:
AO = AH - r (A는 HO 위, H는 지면)
닮음비: r : AO = x : AH → x = r×AH/AO
넓이 = πx²
절대 금지: 좌표계, 접선 방정식, m값 계산, 피타고라스로 접선길이 구하기` : ""

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

    const isSequence = /(수열|점화식|a_n|an|등차|등비)/.test(finalQuestion)
    const sequenceRule = isSequence ? `
⚠️ 수열: 점화식 인덱스 n, n+1 혼동 금지
등차/등비 판단 먼저, 일반항 구한 후 계산` : ""

    const isProbability = /(확률|경우의 수|조합|순열|nCr|nPr)/.test(finalQuestion)
    const probabilityRule = isProbability ? `
⚠️ 확률: 전체 경우의 수 먼저, 여사건 활용 검토` : ""

    const inverseIntegralRule = `
⚠️ 역함수 정적분: ∫f(x)dx + ∫g(y)dy = xy 공식 최우선 사용.
치환/부분적분보다 직사각형 넓이 해석 먼저. 다항식 나눗셈 시 반드시 검산.`

    const systemPrompt = isMultipleChoice
      ? `수능 수학 전문가. 식 위주로 간결하게 풀어라.
규칙: LaTeX $...$ / $$...$$만 사용. π분수유지. 말 최소화. 표 사용 금지.${sphereRule}${htRule}${tangentRule}${sequenceRule}${probabilityRule}${inverseIntegralRule}

형식:
**Step 1** $식$
**Step 2** $식$
...
**정답: ③**`
      : `수능 수학 전문가. 식 위주로 간결하게 풀어라.
규칙: LaTeX $...$ / $$...$$만 사용. π분수유지. 말 최소화. 표 사용 금지.${sphereRule}${htRule}${tangentRule}${sequenceRule}${probabilityRule}${inverseIntegralRule}

형식:
**Step 1** $식$
**Step 2** $식$
...
$$\\boxed{answer}$$`

    const userPrompt = compressedImage
      ? `풀어주세요.${finalQuestion ? `\nOCR: ${finalQuestion}` : ""}`
      : `풀어주세요.\n\n${finalQuestion}`

    const claudeContent: Anthropic.MessageParam["content"] = compressedImage
      ? [
          { type: "image", source: { type: "base64", media_type: compressedImage.mediaType, data: compressedImage.data } },
          { type: "text", text: userPrompt },
        ]
      : userPrompt

    const maxTokens = (hardMode || isHTproblem) ? 8000
      : isMultipleChoice ? 3000
      : 2500

    const stream = await anthropic.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: maxTokens,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: claudeContent }],
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
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to analyze problem" }, { status: 500 })
  }
}