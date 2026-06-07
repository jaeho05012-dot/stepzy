import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { compressImage } from "@/lib/compress-image"

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { question, imageBase64, hardMode } = body

    let finalQuestion = question?.trim() || ""
    let compressedImage: { data: string; mediaType: "image/jpeg" } | null = null

    if (imageBase64) {
      compressedImage = await compressImage(imageBase64)
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

    const isHTproblem = /h\(t\)/.test(finalQuestion) || /교점.*개수|개수.*교점/.test(finalQuestion)

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

    const hardModeExtra = (hardMode || isHTproblem) ? `
⚠️ 고난도 문제 — 반드시 이 순서:
1. 풀기 전 문제 구조 한 줄 파악
2. 각 단계 계산 후 결과 체크
3. 최종 답 검증
4. 모순 발견 시 처음부터
★ 단, 설명 최소화. 식만. 말 줄여.` : ""

    const absHtRule = `
[|g(x)-t| 또는 p(x)=|g(x)-t| 미분불가능 개수 문제인 경우]
미분불가능점 두 종류:
1. g(x)=t 이고 g'(x)=0인 점 (절댓값 꺾임 + 수평접선)
2. g(x) 자체가 미분불가능한 점 (단, g(x)가 전체 미분가능이면 이 경우 없음)
h(t) = 위 두 종류 합산
g(x) 증감표 먼저 → 극값 파악 → t값별 개수 분류
절대 금지: g'(x)=0인 점만 세거나 g(x)=t인 점만 세는 것`

    const absRootRule = `
[|f(x)|=t 실근 개수 h(t), aₙ=h(n) 수열 문제]
1. f'(x)=3(x-p)(x-q), p<q → x=p 극대, x=q 극소
2. 극댓값 M=f(p), 극솟값 m=f(q)
3. |f(x)| 두 봉우리: A=M (M>0이면), B=|m| (m<0이면)
4. 근 개수 패턴 (A≠B, min=α, max=K):
   t<α: 6개, t=α: 5개, α<t<K: 4개, t=K: 3개, t>K: 2개
5. a₁=h(1)=5 → min(A,B)=1
6. Σaₙ=S → (5, 4,...,4, 3, 2,...,2) 패턴으로 K 역산
   K=3이면: (5,4,3,2,2)=16 ✓
7. {M,|m|}={1,K} 설정 후 f'(x)=3(x-1)(x-q) 이용
8. M-m=(q-1)³/2 공식으로 q 계산
9. ∫조건으로 c 결정 후 f(k) 계산
★ 절대 금지: |f(x)| 변환 없이 f(x) 그래프로 교점 세기
★ Σaₙ 패턴 분석 없이 바로 f(x) 설정하기`

    const semicircleRule = `
[반원·호 AB·∠PAB·∠QBA·정삼각형 STU 문제인 경우] 반원 기하 극한 — 이 순서 그대로:
1. 좌표계: A=(-1,0), B=(1,0), 반원 중심 O=(0,0)
2. 각도 조건으로 직선 AP, BQ 방정식 세우기
3. 교점 R 좌표를 θ로 표현
★ 원주각-중심각: ∠QBA=2θ는 원주각 → 중심각 ∠AOQ=4θ (반드시 2배!)
   Q = (-cos4θ, sin4θ) ← 4θ 사용, 2θ 절대 금지
   sin4θ≈4θ, 1-cos4θ≈8θ² (θ→0 근사)
4. θ→0 극한: tanθ≈θ, sinθ≈θ, cosθ≈1 근사 사용
5. f(θ), g(θ)를 θ의 거듭제곱으로 표현
6. 극한값 = g(θ)/(θ×f(θ)) 계산
절대 금지: 극한 전 수치 대입, θ=0으로 바로 놓기, 원주각을 중심각으로 착각(∠QBA=2θ → ∠AOQ=4θ임)
★ f(θ) 계산 방법: 활꼴(부채꼴OAQ - 삼각형OAQ) + 삼각형ARQ 로 바로 분해. 다른 방법 탐색 없이 이 방향으로만 풀어라.
정삼각형 STU: UT∥AB → 한 변 길이를 R 좌표로 표현 후 넓이 = (√3/4)×변²`

    const systemPrompt = isMultipleChoice
      ? `수능 수학 전문가. 식 위주로 간결하게 풀어라.
규칙: LaTeX $...$ / $$...$$만 사용. π분수유지. 말 최소화. 표 사용 금지.
★ 수식($...$) 안에는 절대 한글을 넣지 마라. 한글 설명은 수식 밖에 써라. 예: ❌ $f(x)는 삼차함수$ → ⭕ $f(x)$는 삼차함수. \text{} 도 쓰지 말고 수식 밖으로 빼라.${sphereRule}${htRule}${tangentRule}${sequenceRule}${probabilityRule}${inverseIntegralRule}${semicircleRule}${absHtRule}${absRootRule}${hardModeExtra}

형식:
**Step 1** $식$
**Step 2** $식$
...
**정답: ③**`
      : `수능 수학 전문가. 식 위주로 간결하게 풀어라.
규칙: LaTeX $...$ / $$...$$만 사용. π분수유지. 말 최소화. 표 사용 금지.
★ 수식($...$) 안에는 절대 한글을 넣지 마라. 한글 설명은 수식 밖에 써라. 예: ❌ $f(x)는 삼차함수$ → ⭕ $f(x)$는 삼차함수. \text{} 도 쓰지 말고 수식 밖으로 빼라.${sphereRule}${htRule}${tangentRule}${sequenceRule}${probabilityRule}${inverseIntegralRule}${semicircleRule}${absHtRule}${absRootRule}${hardModeExtra}

형식:
**Step 1** $식$
**Step 2** $식$
...
$$\\boxed{answer}$$`

    const userPrompt = compressedImage
      ? `이미지의 문제를 읽고 풀어주세요. 그림(그래프·도형)도 직접 보고 분석하세요.${finalQuestion ? `\n참고 텍스트: ${finalQuestion}` : ""}`
      : `풀어주세요.\n\n${finalQuestion}`

    const claudeContent: Anthropic.MessageParam["content"] = compressedImage
      ? [
          { type: "image", source: { type: "base64", media_type: compressedImage.mediaType, data: compressedImage.data } },
          { type: "text", text: userPrompt },
        ]
      : userPrompt

    const maxTokens = hardMode ? 8000
      : (isHTproblem || !!compressedImage) ? 5000
      : isMultipleChoice ? 3000
      : 2500

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
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