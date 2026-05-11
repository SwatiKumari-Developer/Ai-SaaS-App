import { NextRequest } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().min(3).max(4000),
  mode: z.enum(["content", "code", "answer"]),
  model: z.string().min(2).max(80)
});

const SYSTEM_PROMPTS = {
  content:
    "You are a sharp content strategist. Create clear, polished, practical content with headings and useful structure.",
  code:
    "You are a senior software engineer. Provide correct, secure code and explain key choices briefly.",
  answer:
    "You are a concise expert assistant. Answer directly, include assumptions, and avoid filler."
} as const;

function demoStream(prompt: string, mode: keyof typeof SYSTEM_PROMPTS) {
  const encoder = new TextEncoder();
  const response = [
    `Demo ${mode} response for: "${prompt.slice(0, 120)}"`,
    "",
    "Add an OPENAI_API_KEY in your environment to enable real AI streaming.",
    "",
    "Suggested output:",
    "- Clarify the user goal",
    "- Generate a useful first draft",
    "- Refine for tone, accuracy, and conversion"
  ].join("\n");

  return new ReadableStream({
    async start(controller) {
      for (const token of response.split(" ")) {
        controller.enqueue(encoder.encode(`${token} `));
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
      controller.close();
    }
  });
}

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "Invalid prompt request." }, { status: 400 });
  }

  const { prompt, mode, model } = parsed.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(demoStream(prompt, mode), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache"
      }
    });
  }

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model || process.env.OPENAI_MODEL || "gpt-4.1-mini",
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[mode] },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!upstream.ok || !upstream.body) {
    const message = await upstream.text();
    return Response.json(
      { error: message || "AI provider request failed." },
      { status: upstream.status || 500 }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.replace("data: ", "").trim();
          if (payload === "[DONE]") continue;

          try {
            const json = JSON.parse(payload);
            const text = json.choices?.[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            continue;
          }
        }
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache"
    }
  });
}
