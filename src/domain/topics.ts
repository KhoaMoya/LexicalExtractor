import topicsJson from '@/assets/topics.json';
import { Word } from './types';

type RawVocabulary = {
  stt: number;
  name: string;
  phonetics: string;
  meaning: string;
  soundUrl?: string;
  type?: string;
};

type RawTopic = {
  name: string;
  vocabularies: RawVocabulary[];
};

type TopicsFile = {
  topics: RawTopic[];
};

export type Topic = {
  name: string;
  slug: string;
  vocabularies: RawVocabulary[];
};

const data = topicsJson as TopicsFile;

const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const topics: Topic[] = data.topics.map((topic) => ({
  ...topic,
  slug: slugify(topic.name),
}));

export function getTopics(): Topic[] {
  return topics;
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((topic) => topic.slug === slug);
}

export function getWordsForTopic(slug: string): Word[] | null {
  const topic = getTopicBySlug(slug);
  if (!topic) return null;

  return topic.vocabularies.map(mapVocabularyToWord);
}

function mapVocabularyToWord(vocab: RawVocabulary): Word {
  return {
    word: vocab.name,
    vietnameseMeaning: [
      {
        type: vocab.type ?? '',
        meaning: [vocab.meaning],
      },
    ],
    phoneticTranscriptionUK: vocab.phonetics,
    phoneticTranscriptionUS: vocab.phonetics,
    ukSoundUrl: vocab.soundUrl ?? null,
    usSoundUrl: vocab.soundUrl ?? null,
  };
}

