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
★ 원주각-중심각: ∠QBA=2θ는 원주각 → 중심각 ∠AOQ=4θ (반드시 2배!)
   Q = (-cos4θ, sin4θ) ← 4θ 사용, 2θ 절대 금지
   sin4θ≈4θ, 1-cos4θ≈8θ² (θ→0 근사)
4. θ→0 극한: tanθ≈θ, sinθ≈θ, cosθ≈1 근사 사용
5. f(θ), g(θ)를 θ의 거듭제곱으로 표현
6. 극한값 = g(θ)/(θ×f(θ)) 계산
절대 금지: 극한 전 수치 대입, θ=0으로 바로 놓기, 원주각을 중심각으로 착각(∠QBA=2θ → ∠AOQ=4θ임)
★ f(θ) 계산 방법: 활꼴(부채꼴OAQ - 삼각형OAQ) + 삼각형ARQ 로 바로 분해. 다른 방법 탐색 없이 이 방향으로만 풀어라.
정삼각형 STU: UT∥AB → 한 변 길이를 R 좌표로 표현 후 넓이 = (√3/4)×변²`

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

    const contradictionRule = `
⚠️ 모순 발견 시: 두 방법으로 같은 값을 구했는데 결과가 다르면 절대 한쪽을 임의로 선택해 진행 금지. 멈추고 어느 단계가 틀렸는지 찾아 처음부터 다시 풀 것.
⚠️ 수선·수심 도형 문제: 두 수선의 교점이 수심임을 먼저 확정 → 세 번째 수선·닮음 관계 적극 활용.`

    const trigFracRule = `
[g=1/(c+sin f(x)) 류 합성 분수형 삼각함수 킬러 문항]
1. 극값 분석은 반드시 g′(x) 직접 계산: g′ = −cos(f)·f′ / (c+sin f)²
2. 극값 후보 두 부류: f′(x)=0 / cos(f(x))=0 — 둘 다 검토, 한 종류로 단정 금지
3. "분모 최소=극대" 같은 직관적 단정으로 후보 좁히기 금지
4. 주어진 g값(예: g(0)=2/5)은 그대로 sin(f) 역산에 사용
   f의 상수항을 π/2 등 임의 값으로 가정 금지 — 반드시 조건에서 유도
5. αₙ = g′=0인 점 전체를 오름차순 나열 (극대·극소·f′=0·cos(f)=0 혼재)
   한 종류라고 단정 금지`

    const killer30Rule = `
[30번 킬러 범용 접근]
1. 조각함수면 각 구간 경계에서 연속·미분가능 조건 먼저
2. h(n) 유형이면 그래프 그려서 수평선 y=c와 교점 수 패턴 분류
3. 전역 최솟값/최댓값 조건 → 등호 조건 설정
4. n=1~5 각각 어느 구간에 속하는지 먼저 결정
5. 집합 조건 → 각 h값이 모두 달라야 함 → 각 케이스 1개씩 배정
6. a값은 역산으로 결정`

    const gLimitRule = `
[g(x)=-f(x)(x<t), f(x)(x≥t) + g(x)/x(x-2) 극한 문제]
1. g 연속 → f(t)=0
2. lim g(x)/x(x-2) 모든 a에서 존재 → g(0)=0, g(2)=0 → f(0)=0, f(2)=0
3. f(x)=ax(x-2)(x-k), a>0 (최고차항 계수 양수)
4. t는 f의 근: 0, 2, k 중 하나
5. lim(x→m+) g(x)/x(x-2) 음수 조건:
   x>2에서 f(x)<0인 구간의 자연수 m 파악
6. 집합 원소 2개 → t=2, 3<k≤4, m={2,3}
7. g(-1)=3a(k+1), g(1)=-a(k-1) 계산
   집합={g(-1), -7/2·g(1)} 조건으로 a,k 결정
8. g(-5)=-f(-5) (x<t=2이므로) 계산
★ g(0)=0, g(2)=0이 f(x) 인수 결정의 핵심
★ t=2 결정 후 x<2에서 g(x)=-f(x) 적용
★ 절대 금지: t=0 또는 t=k로 가정하기`

    const polyDivRule = `
[Q(x²)²+P(x)² 나누어떨어짐 + Q(x+1)-Q(x) 조건 문제]
1. Q(x+1)-Q(x) = (x+1)³-x³ 확인 → Q(x)=x³+c, Q(0)으로 c 결정
2. x=i 대입: Q(-1)²+P(i)²=0 → P(i)=±i
3. P(x)=x⁴+ax³+5x²+(a+s)x+4 (s=±1), P(0)=4
4. x³≡-2(mod Q(x)) 이용해 나머지 바로 계산:
   r(x)=5x²+(a+s-2)x+(4-2a)
5. r(1)=계수합=2 → a=s+5
6. P(1)<조건으로 s 결정: s=1이면 a=6, s=-1이면 a=4
7. r(2) 계산
★ x³≡-2(mod x³+2) 치환이 핵심
★ P(i)=±i → 실수부=0, 허수부=±1
★ 절대 금지: Q(x)에 일차항 있다고 가정하기`

    const absGQuarticRule = `
[p(x)=|g(x)-t| 미분불가능 + g(x) 사차 조각함수 문제]
1. x=0 연속·미분가능: 24-f(k)=f(0), -f'(k)=f'(0)
2. f(0)=4 → f(k)=20, f'(0)=0, f'(k)=0
3. f'(x)=4x(x-k)(x-m), m>k (극소점 추가)
4. ∫₀ᵏ f'(x)dx = f(k)-f(0) = 16으로 k³(2m-k)=48
5. g(x) 극값이 4,20만 되려면 f(m)≤0 또는 f(m)=4
6. f(m)=4이면 m=2k → k⁴=16 → k=2, m=4
7. f(x) = x⁴-8x³+16x²+4 → f(k+3)=f(5)=29
★ g(x) x<0 부분 극값도 반드시 확인
★ h(t) 불연속점 = g(x) 극값 (양수만)`

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
규칙: LaTeX $...$ / $$...$$만 사용. π분수유지. 표 사용 금지.
⛔ 출력 규칙: ~이므로/~따라서/~입니다 등 완전한 서술 문장 금지. 식과 결과만, → 로 연결. 단, 케이스 분기 이유는 한 단어 수준으로 허용. ❌ "x=i를 대입하면 됩니다" ✅ "x=i → Q(-1)=1 → P(i)=±i"
★ 수식($...$) 안에는 절대 한글을 넣지 마라. 한글 설명은 수식 밖에 써라. 예: ❌ $f(x)는 삼차함수$ → ⭕ $f(x)$는 삼차함수. \text{} 도 쓰지 말고 수식 밖으로 빼라.${sphereRule}${htRule}${tangentRule}${sequenceRule}${probabilityRule}${inverseIntegralRule}${semicircleRule}${contradictionRule}${trigFracRule}${killer30Rule}${gLimitRule}${polyDivRule}${absHtRule}${absRootRule}${absGQuarticRule}${hardModeExtra}

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
    const model = hardMode
      ? "claude-opus-4-6"
      : (isMathProblem || context)
        ? "claude-opus-4-8"
        : "claude-sonnet-4-6"
    const stream = client.messages.stream({
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