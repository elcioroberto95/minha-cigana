import { readFileSync } from 'node:fs';

const modelFile = readFileSync(new URL('../../../../Modelfile', import.meta.url), 'utf8');
const persona = /^SYSTEM\s+"""\s*([\s\S]*?)\s*"""\s*$/m.exec(modelFile)?.[1];
if (!persona) throw new Error('O Modelfile precisa de um bloco SYSTEM.');

export const defaultPersona = persona;
export const maxChatHistory = 24;

const defaultBreakPhrases = [
  'sou uma IA', 'sou uma inteligência artificial', 'modelo de linguagem',
  'não sou especialista', 'não sou uma especialista', 'não sou um especialista', 'não é especialista em tarô', 'não é especialista em tarot',
  'não posso prever', 'não posso fazer previsões', 'não consigo prever', 'como assistente',
  'I am an AI', "I'm an AI", 'as an AI', 'language model', 'not a tarot expert',
  'not an expert', 'cannot predict', "can't predict", 'as an assistant',
];

export function chatConfig() {
  const requestedLimit = Number(process.env.CHAT_HISTORY_LIMIT?.trim() || '12');
  const limit = Number.isInteger(requestedLimit) && requestedLimit >= 0 && requestedLimit <= maxChatHistory
    ? requestedLimit : 12;
  const phrases = process.env.CHAT_CHARACTER_BREAK_PHRASES?.split('|').map((phrase) => phrase.trim()).filter(Boolean);
  return {
    model: process.env.OLLAMA_MODEL?.trim() ?? 'esmeralda',
    base: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    keepAlive: process.env.OLLAMA_KEEP_ALIVE?.trim() || '30m',
    personaFile: process.env.CHAT_PERSONA_FILE,
    historyLimit: limit - (limit % 2),
    breakPhrases: phrases?.length ? phrases : defaultBreakPhrases,
  };
}
