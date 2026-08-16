import { askGemini } from "./gemini";
import { askGroq } from "./groq";
import { askOpenRouter } from "./openrouter";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function cleanAIResponse(text: string) {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/?(ol|ul)[^>]*>/gi, "\n")
    .replace(/<\/?strong[^>]*>/gi, "**")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function askCircuitAI(messages: ChatMessage[]) {
  try {
    const response = await Promise.any([
      askGemini(messages),
      askGroq(messages),
      askOpenRouter(messages)
    ]);

    return cleanAIResponse(response);
  } catch (error) {
    console.error(error);
    return "Arey bhidu, saare AI providers busy lag rahe hain.";
  }
}