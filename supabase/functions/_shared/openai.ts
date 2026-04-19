const OPENAI_URL = "https://api.openai.com/v1/chat/completions"

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string }

export async function openaiChatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY")
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }
  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini"

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 400,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 500)}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error("Empty OpenAI response")
  return text
}
