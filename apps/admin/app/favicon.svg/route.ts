import { readFile } from "node:fs/promises"

const faviconPath = new URL("../../../web/public/favicon.svg", import.meta.url)

export async function GET(): Promise<Response> {
  const favicon = await readFile(faviconPath)
  return new Response(favicon, {
    headers: {
      "cache-control": "public, max-age=86400",
      "content-type": "image/svg+xml",
    },
  })
}
