import { NextResponse } from "next/server"

export async function POST(req: Request) {

  const body = await req.json()
  const question = body.question

  const result = `
Step 1: Understand the problem
Step 2: Identify the formula
Step 3: Calculate the result

Explanation for: ${question}
`

  return NextResponse.json({
    answer: result
  })
}