"use server";

import { extractAndTranslateWords } from "@/domain/extract-and-translate-words";
import type { ExtractAndTranslateResult } from "@/domain/types";

export async function handleExtractAndTranslate(
  prevState: ExtractAndTranslateResult,
  formData: FormData
): Promise<ExtractAndTranslateResult> {
  const text = formData.get("text") as string;

  if (!text || text.trim().length < 1) {
    return { data: null, error: "Please enter text.", inputText: text };
  }

  try {
    const result = await extractAndTranslateWords(text);
    if (!result || result.length === 0) {
      return { data: [], error: null, inputText: text };
    }
    return { data: result, error: null, inputText: text };
  } catch (error) {
    console.error("Error:", error);
    return { data: null, error: "An unexpected error occurred while processing the text. Please try again later.", inputText: text };
  }
}
