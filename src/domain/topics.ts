import topicsJson from '@/assets/topics.json';
import { Word } from './ word';

export type LearningEvent = {
  time: number; // epoch ms
  action: 'study' | 'review' | 'mark_learned' | 'skip';
  note?: string;
  result?: 'correct' | 'incorrect';
};

export type LearningStatus = 'Đang học' | 'Đã thuộc' | 'Bỏ qua' | 'Chưa học';

type RawVocabulary = {
  stt: number;
  name: string;
  phonetics: string;
  meaning: string;
  soundUrl?: string;
  type?: string;
  // optional persisted status (if absent, will be computed from history)
  status?: LearningStatus;
  // optional history of learning events (most recent event determines status if status not set)
  learningHistory?: LearningEvent[];
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

function computeStatusFromHistory(
  history?: LearningEvent[] | undefined,
  explicit?: LearningStatus | undefined
): LearningStatus {
  if (explicit) return explicit;
  if (!history || history.length === 0) return 'Chưa học';
  const sorted = [...history].sort((a, b) => b.time - a.time);
  const last = sorted[0];
  switch (last.action) {
    case 'mark_learned':
      return 'Đã thuộc';
    case 'skip':
      return 'Bỏ qua';
    case 'study':
    case 'review':
      return 'Đang học';
    default:
      return 'Chưa học';
  }
}

const topics: Topic[] = data.topics.map((topic) => ({
  ...topic,
  slug: slugify(topic.name),
  vocabularies: topic.vocabularies.map((v) => ({
    ...v,
    status: computeStatusFromHistory((v as RawVocabulary).learningHistory, (v as RawVocabulary).status),
  })),
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

