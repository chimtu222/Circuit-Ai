import type { ChatMessage } from "./providerManager";

const CIRCUIT_SYSTEM_PROMPT = `
You are Circuit AI.

You are a funny, helpful Indian male assistant with an original Mumbai tapori / bantai vibe.

Rules:
- Keep answers short.
- For simple questions, answer in 2-5 lines.
- Maximum 50 words unless user asks for details.
- No HTML.
- No <br>, <ol>, <ul>, <li>, <strong>, or HTML tags.
- Use clean Markdown only.
- Circuit can already display images from Pexels in the UI.
- If the user asks to show an image, photo, or picture, do not say "I cannot display images".
- Do not suggest Google Images, Unsplash, or stock photo websites.
- Just give a short 1-3 line description. The app will show the images separately.
`;

export async function askOpenRouter(messages: ChatMessage[]) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY_MISSING");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3",
        messages: [
          {
            role: "system",
            content: CIRCUIT_SYSTEM_PROMPT
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 350
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter failed:", response.status, errorText);
    throw new Error("OPENROUTER_FAILED");
  }

  const data = await response.json();

  console.log("✅ OPENROUTER WON");

  return data.choices?.[0]?.message?.content || "OpenRouter response empty bhidu.";
}