"use server";

import { extractAndTranslateWords, type ExtractAndTranslateWordsOutput } from "@/app/extract-and-translate-words";

type FormState = {
  data: ExtractAndTranslateWordsOutput | null;
  error: string | null;
  inputText: string;
}

export async function handleExtractAndTranslate(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const text = formData.get("text") as string;

  if (!text || text.trim().length < 1) {
    return { data: null, error: "Please enter text.", inputText: text };
  }

  try {
    const result = await extractAndTranslateWords({ text });
    if (!result || result.length === 0) {
      return { data: [], error: null, inputText: text };
    }
    return { data: result, error: null, inputText: text };
  } catch (error) {
    console.error("Error in GenAI flow:", error);
    return { data: null, error: "An unexpected error occurred while processing the text. Please try again later.", inputText: text };
  }
}
