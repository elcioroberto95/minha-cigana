import { normalizedWords, type ChatLocale } from './consultation.js';

const bodyReplies = {
  'pt-BR': {
    body: 'Entendo a curiosidade, meu bem. As cartas não conseguem dizer se o seu pênis vai crescer. Se o tamanho ou alguma mudança no seu corpo está te preocupando, vale conversar com um profissional de saúde. O que mais você gostaria de explorar sobre o seu futuro?',
    growth: /\b(cresc\w*|aument\w*|tamanho|diminu\w*)\b/,
    anatomy: /\b(penis|meu pau|meu pinto|meu caralho|meu kct)\b/,
  },
  'en-US': {
    body: 'I understand the curiosity, my dear. The cards cannot tell whether your penis will grow. If its size or changes in your body are worrying you, a healthcare professional can help. What else about your future would you like to explore?',
    growth: /\b(grow\w*|bigger|smaller|size|shrink\w*)\b/,
    anatomy: /\b(penis|my dick|my cock)\b/,
  },
} as const;

export function bodyQuestionReply(message: string, locale: ChatLocale) {
  const { anatomy, growth, body } = bodyReplies[locale];
  const words = normalizedWords(message);
  return anatomy.test(words) && growth.test(words) ? body : undefined;
}
