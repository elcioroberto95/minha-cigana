import type { ChatLocale } from './chat-input.js';

const example = {
  'pt-BR': {
    question: 'Como posso retomar meu projeto? Tiragem de três cartas: Passado — O Eremita (normal); Presente — Dois de Ouros (invertida); Futuro simbólico — A Estrela (normal).',
    reply: 'Chegue mais perto, meu bem. Eu vejo a lanterna do Eremita iluminando um tempo em que você precisou andar no próprio ritmo. Essa pausa ajuda a entender o Dois de Ouros invertido: voltar tentando equilibrar tudo de uma vez pode apagar o que você aprendeu. A Estrela me mostra outra possibilidade, a de recuperar a confiança ao dar espaço ao que importa. Meu conselho é escolher uma tarefa pequena para esta semana e deixar as outras esperarem. Veja o que muda quando você retoma o projeto com um compromisso que consegue cumprir.',
  },
  'en-US': {
    question: 'How can I return to my project? Three-card spread: Past — The Hermit (upright); Present — Two of Pentacles (reversed); Symbolic future — The Star (upright).',
    reply: 'Come closer, my dear. I see the Hermit’s lantern lighting a time when you needed to walk at your own pace. That pause helps explain the reversed Two of Pentacles: trying to juggle everything at once could undo what you learned. The Star shows me another possibility, a chance to regain confidence by making room for what matters. My advice is to choose one small task for this week and let the rest wait. See what changes when you return to your project with a promise you can keep.',
  },
} as const;

export const characterReminder = '[Lembrete: responda como Madame Esmeralda, sem sair do personagem.]';

export function withCharacterReminder(content: string) {
  return content + '\n\n' + characterReminder;
}

export function styleExample(locale: ChatLocale) {
  const { question, reply } = example[locale];
  return [
    { role: 'user', content: withCharacterReminder(question) },
    { role: 'assistant', content: reply },
  ] as const;
}

function normalize(value: string) {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function breaksCharacter(reply: string, phrases: string[]) {
  const normalized = ' ' + normalize(reply) + ' ';
  return phrases.some((phrase) => {
    const words = normalize(phrase);
    return words && normalized.includes(' ' + words + ' ');
  });
}
