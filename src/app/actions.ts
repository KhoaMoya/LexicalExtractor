"use server";

import { extractAndTranslateWords } from "@/domain/extract-and-translate-words";
import type { ExtractAndTranslateResult } from "@/domain/types";
import { addToHistory, loadHistory, saveHistory } from "@/domain/history-manager";

export async function handleExtractAndTranslate(
  prevState: ExtractAndTranslateResult,
  formData: FormData
): Promise<ExtractAndTranslateResult> {
  const text = formData.get("text") as string;

  if (!text || text.trim().length < 1) {
    return { words: null, error: "Please enter text.", input: text };
  }

  try {
    const result = await extractAndTranslateWords(text);

    if (!result || result.length === 0) {
      return { words: [], error: null, input: text };
    } else {
      return { words: result, error: null, input: text };
    }
  } catch (error) {
    console.error("Error:", error);
    return { words: null, error: "An unexpected error occurred while processing the text. Please try again later.", input: text };
  }
}
