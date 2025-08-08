'use serverçç';

import { JSDOM } from 'jsdom';
import type { Word, Meaning } from './types';

export async function extractAndTranslateWords(
  input: string
): Promise<Word[]> {
  return new Promise(async (resolve, reject) => { // Make the callback async
    const result: Word[] = [];
    try {
      const list = extracWords(input);
      for (const word of list) {
        const htm = await loadPage("https://dict.laban.vn/find?type=1&query=" + encodeURIComponent(word));
        const parsedWord = await parseHtml(word, htm); // Await the parsed word
        console.log("Parsed word:", parsedWord);
        if (parsedWord) {
          result.push(parsedWord); // Use push to add to the array
        }
      }
      resolve(result); // Resolve with the result after the loop
    } catch (error) { // Correctly handle the error
      console.error("Error extracting and translating words:", error);
      reject(new Error("Failed to extract and translate words. Please try again later."));
    }
  });
}

function extracWords(input: string): string[] {
  const regex = /[^\p{L}\p{N}_-]+/u; // Added hyphen to the negated character class
  const words = input.split(regex)
    .filter(Boolean)
    .map(word => word.toLowerCase()) // Convert to lowercase
    .map(word => word.replace('-', ' ')) // Remove leading numbers
    .map(word => word.trim()) // Trim whitespace
    .filter(word => word.length > 0); // Filter out empty strings

  // Use a Set to filter out duplicates
  const seen = new Set<string>();
  const uniqueWords = words.filter(word => {
    if (seen.has(word)) {
      return false; // Skip duplicates
    }
    seen.add(word);
    return true; // Keep unique words
  });

  return uniqueWords;
}

async function loadPage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => resolve(text))
      .catch((error) => reject(error));
  });
}

async function parseHtml(word: string, html: string): Promise<Word> {
  const document = new JSDOM(html).window.document;
  const container = document.querySelector('.word_tab_title_0');
  const transcription = container?.children[0]?.children[0]?.textContent || '';

  const ukSoundUrl = await getSoundUrl("uk", word).catch((error) => {
    console.error(`Error fetching sound URL for word "${word}":`, error);
    return null;
  });
  const usSoundUrl = await getSoundUrl("us", word).catch((error) => {
    console.error(`Error fetching sound URL for word "${word}":`, error);
    return null;
  });
  return {
    word: word,
    vietnameseMeaning: parseToMeanings(document),
    phoneticTranscriptionUK: transcription,
    phoneticTranscriptionUS: transcription,
    ukSoundUrl: ukSoundUrl,
    usSoundUrl: usSoundUrl
  };
}

async function getSoundUrl(accent: string, word: string): Promise<string> {
  const url = "https://dict.laban.vn/ajax/getsound?accent=" + accent + "&word=" + encodeURIComponent(word);
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // {"error":0, "data":"https://stream-dict-laban.zdn.vn/uk/7b2447736085b4de41b6922d310ac280/198855a58da/F/feel.mp3", "id":34586}
        return response.json();
      })
      .then((data) => resolve(data.data))
      .catch((error) => reject(error));
  });
}

function parseToMeanings(doc: Document): Meaning[] {
  const meanings: Meaning[] = [];

  try {
    // Find the English-Vietnamese content section (rel="0").
    const englishVietnameseContent = doc.querySelector('li.slide_content[rel="0"] .content');
    if (!englishVietnameseContent) {
      console.error('Could not find the English-Vietnamese content section.');
      return meanings;
    }

    // Get all the parts of speech sections.
    const posSections = englishVietnameseContent.querySelectorAll('div.bg-grey');

    posSections.forEach(posSection => {
      // Extract the part of speech title from the <span> element.
      const posTitleElement = posSection.querySelector('span');
      // console.log('Part of speech element:', posTitleElement);
      if (!posTitleElement) return;

      const posTitle = posTitleElement.textContent?.trim();
      // console.log('Part of speech title:', posTitle);
      if (!posTitle) return;

      const definitions: string[] = [];

      // Find the parent container of the definitions.
      const definitionsContainer = posSection.nextElementSibling;
      // console.log('Definitions container:', definitionsContainer?.textContent?.trim());
      if (!definitionsContainer) return;

      // Iterate through sibling elements until the next part of speech section.
      let currentElement: Element | null = definitionsContainer;
      while (currentElement && !currentElement.classList.contains('bg-grey')) {
        // Definitions are typically in a div with a specific class.
        // We'll look for the green bold class or a grey bold for idioms.

        if (currentElement && currentElement.classList.contains('green')
          && currentElement.classList.contains('bold') && currentElement.textContent?.trim()
        ) {
          // console.log('Found definition:', currentElement.textContent.trim());
          definitions.push(currentElement.textContent.trim());
        }

        // Move to the next sibling element.
        currentElement = currentElement.nextElementSibling;
      }

      // Add the collected meanings to the result array if definitions were found.
      if (definitions.length > 0) {
        meanings.push({
          type: posTitle,
          meaning: definitions,
        });
      }
    });

  } catch (error) {
    console.error('An error occurred during HTML parsing:', error);
  }

  return meanings;
}