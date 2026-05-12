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
  const response = buildDemoResponse(prompt, mode);

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

function buildDemoResponse(prompt: string, mode: keyof typeof SYSTEM_PROMPTS) {
  const topic = cleanTopic(prompt);
  const lowerPrompt = prompt.toLowerCase();

  if (mode === "code") {
    return buildCodeDemo(topic, lowerPrompt);
  }

  if (mode === "answer") {
    return buildAnswerDemo(topic);
  }

  if (lowerPrompt.includes("email")) {
    return buildEmailDemo(topic);
  }

  if (lowerPrompt.includes("caption") || lowerPrompt.includes("post")) {
    return buildSocialDemo(topic);
  }

  return buildEssayDemo(topic);
}

function cleanTopic(prompt: string) {
  const topic = prompt
    .replace(/write|create|generate|make|an|a|essay|email|post|caption|about|on/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return topic || prompt.trim();
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function buildEssayDemo(topic: string) {
  const title = titleCase(topic);

  return [
    `Essay: ${title}`,
    "",
    "Introduction",
    `${title} is an important topic because it connects everyday life with progress, comfort, and practical problem solving. In modern society, people depend on useful tools, ideas, and systems to save time, improve quality of life, and create new opportunities.`,
    "",
    "Main Body",
    `One major benefit of ${topic} is convenience. It helps people complete tasks faster and with better results. For example, when something is designed well, it reduces effort and allows people to focus on more meaningful work.`,
    "",
    `Another important point is growth. ${title} continues to improve as technology, creativity, and user needs change. These improvements make it more reliable, accessible, and valuable for students, professionals, families, and businesses.`,
    "",
    `At the same time, ${topic} should be used responsibly. Every powerful idea or tool has both advantages and challenges. People should understand its impact, avoid misuse, and choose solutions that are safe, affordable, and helpful for society.`,
    "",
    "Conclusion",
    `In conclusion, ${topic} plays a meaningful role in modern life. When used wisely, it can improve productivity, support learning, and make daily activities easier. Its value depends not only on how advanced it is, but also on how responsibly people use it.`
  ].join("\n");
}

function buildEmailDemo(topic: string) {
  const title = titleCase(topic);

  return [
    `Subject: Introducing ${title}`,
    "",
    "Hi there,",
    "",
    `I wanted to share something useful with you: ${title}. It is designed to make work easier, save time, and help people get better results without unnecessary complexity.`,
    "",
    "Here is why it matters:",
    "- It solves a clear everyday problem",
    "- It is simple to understand and easy to use",
    "- It helps users move faster with more confidence",
    "",
    `If you are looking for a practical way to improve your workflow, ${topic} is worth exploring.`,
    "",
    "Best,",
    "PromptPilot AI"
  ].join("\n");
}

function buildSocialDemo(topic: string) {
  const title = titleCase(topic);

  return [
    `${title} is more than just a simple idea. It can save time, improve daily life, and help people work smarter.`,
    "",
    "The best solutions are not always the most complicated ones. They are the ones people can actually use.",
    "",
    `#${title.replace(/\s/g, "")} #Productivity #Innovation #Learning`
  ].join("\n");
}

function buildAnswerDemo(topic: string) {
  const title = titleCase(topic);

  return [
    `${title}`,
    "",
    `${title} is useful because it helps solve a real problem in a simpler and more organized way. The main idea is to understand the need, choose the right approach, and apply it consistently.`,
    "",
    "Key points:",
    `- ${title} can improve speed and convenience`,
    "- It should be easy for people to understand and use",
    "- Responsible use matters because every tool has limits",
    "- Good results come from clear goals and regular improvement",
    "",
    "Short answer:",
    `${title} is valuable when it saves time, reduces effort, and creates a better experience for users.`
  ].join("\n");
}

function buildCodeDemo(topic: string, lowerPrompt: string) {
  if (lowerPrompt.includes("rate limit") || lowerPrompt.includes("credit")) {
    return [
      "Here is a simple TypeScript credit limiter:",
      "",
      "```ts",
      "type User = { id: string; credits: number };",
      "",
      "export function useCredit(user: User) {",
      "  if (user.credits <= 0) {",
      "    return { allowed: false, credits: user.credits, message: \"No credits remaining\" };",
      "  }",
      "",
      "  return {",
      "    allowed: true,",
      "    credits: user.credits - 1,",
      "    message: \"Credit used successfully\"",
      "  };",
      "}",
      "```",
      "",
      "In production, store the updated credit count in a database and validate the user session on the server."
    ].join("\n");
  }

  return [
    `Code starter for: ${topic}`,
    "",
    "```ts",
    "type Result = { success: boolean; message: string };",
    "",
    "export function runTask(input: string): Result {",
    "  if (!input.trim()) {",
    "    return { success: false, message: \"Input is required\" };",
    "  }",
    "",
    "  return {",
    "    success: true,",
    "    message: `Processed: ${input}`",
    "  };",
    "}",
    "```",
    "",
    "You can customize this starter with validation, database storage, and API route handling."
  ].join("\n");
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

  let upstream: Response;

  try {
    upstream = await fetch("https://api.openai.com/v1/chat/completions", {
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
  } catch {
    return Response.json(
      { error: "Could not connect to OpenAI. Check the deployment network and try again." },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const message = await parseOpenAIError(upstream);
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

async function parseOpenAIError(response: Response) {
  const fallback = `OpenAI request failed with status ${response.status}.`;
  const body = await response.text();

  if (!body) return fallback;

  try {
    const json = JSON.parse(body);
    return json.error?.message || json.message || fallback;
  } catch {
    return body.slice(0, 500);
  }
}
