import { NextResponse } from "next/server";

import { getIntelligenceFeed } from "@/lib/intelligence";

const OPENAI_CHAT_COMPLETIONS_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const FALLBACK_MODEL = "gpt-4o-mini";

type IncomingMessage = {
  role: "assistant" | "user";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      company?: string;
      messages?: IncomingMessage[];
    };

    if (!body.company || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const feed = getIntelligenceFeed(body.company);
    if (!feed) {
      return NextResponse.json({ error: "Unknown company slug" }, { status: 404 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY environment variable missing" }, { status: 500 });
    }

    const systemNarrative = buildSystemPrompt(feed);
    const sanitizedMessages = body.messages
      .filter((message): message is IncomingMessage => typeof message.content === "string" && Boolean(message.content.trim()))
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content.trim()
      }));

    const openAiResponse = await fetch(OPENAI_CHAT_COMPLETIONS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? FALLBACK_MODEL,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: systemNarrative
          },
          ...sanitizedMessages
        ]
      })
    });

    const payload = (await openAiResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!openAiResponse.ok) {
      console.error("[intelligence-chat] OpenAI error", payload.error);
      return NextResponse.json(
        { error: payload.error?.message ?? "Failed to generate response" },
        { status: openAiResponse.status }
      );
    }

    const reply = payload.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: "Empty response from OpenAI" }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[intelligence-chat] Unexpected error", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

function buildSystemPrompt(feed: ReturnType<typeof getIntelligenceFeed>) {
  if (!feed) {
    return "You are an AI concierge but live feed data is unavailable. Respond politely and note the data gap.";
  }

  const lines: string[] = [
    "You are the dedicated intelligence concierge for this microsite.",
    "Use the latest intelligence feed to brief investors. Keep answers concise, high-signal, and forward-looking.",
    `Headline: ${feed.headline}`,
    `Summary: ${feed.summary}`
  ];

  if (feed.aiNarrative) {
    lines.push(`AI Narrative: ${feed.aiNarrative}`);
  }

  if (feed.moodIndex) {
    lines.push(`Mood Index score ${feed.moodIndex.score} (${feed.moodIndex.change ?? "stable"})`);
  }

  if (feed.predictions?.length) {
    lines.push(
      "Active predictions:",
      ...feed.predictions.map(
        (prediction) =>
          `- ${prediction.title} (${prediction.timeframe}, probability ${prediction.probability}): ${prediction.narrative}`
      )
    );
  }

  if (feed.contrast) {
    lines.push(
      `Contrast module: current ${feed.contrast.current} vs previous ${feed.contrast.previous} (${feed.contrast.change}). Narrative: ${feed.contrast.narrative}.`
    );
  }

  if (feed.cards.length) {
    lines.push(
      "Key cards:",
      ...feed.cards.slice(0, 6).map(
        (card) =>
          `- [${card.type}] ${card.title}: ${card.summary}${card.metrics?.length ? ` Metrics: ${card.metrics.map((metric) => `${metric.label} ${metric.value}${metric.change ? ` (${metric.change})` : ""}`).join("; ")}` : ""}`
      )
    );
  }

  lines.push(
    "Ground each answer in these signals. Highlight why it matters, note when data is illustrative, and suggest next steps (e.g., watchlist, book diligence) when relevant.",
    "If information is not available, acknowledge it transparently."
  );

  return lines.join("\n");
}
