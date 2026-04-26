import sharp from "sharp"

const MAX_BYTES = 4 * 1024 * 1024 // 4MB

export async function compressImage(base64: string): Promise<{ data: string; mediaType: "image/jpeg" }> {
  // base64 → Buffer
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "")
  const buffer = Buffer.from(base64Data, "base64")

  console.log(`[compress] original size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`)

  // 무조건 리사이즈 + jpeg 변환 (bypass 없음)
  let quality = 85
  let width = 1500

  let compressed = await sharp(buffer)
    .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer()

  console.log(`[compress] after first pass: ${(compressed.length / 1024 / 1024).toFixed(2)} MB`)

  // 4MB 초과면 계속 줄임
  while (compressed.length > MAX_BYTES && quality > 20) {
    quality -= 15
    width = Math.floor(width * 0.8)
    compressed = await sharp(buffer)
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer()
    console.log(`[compress] retry q=${quality} w=${width}: ${(compressed.length / 1024 / 1024).toFixed(2)} MB`)
  }

  console.log(`[compress] final size: ${(compressed.length / 1024 / 1024).toFixed(2)} MB`)

  return {
    data: compressed.toString("base64"),
    mediaType: "image/jpeg",
  }
}