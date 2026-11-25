export type ChatLocale = 'pt-BR' | 'en-US';
export const chatTopics = ['love', 'money', 'work', 'future', 'spirituality', 'general'] as const;
export type ChatTopic = (typeof chatTopics)[number];
export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export type ConsultationPrompt = {
  locale: ChatLocale;
  topic: ChatTopic;
  message: string;
  history: ChatTurn[];
};

export function normalizedWords(value: string) {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
