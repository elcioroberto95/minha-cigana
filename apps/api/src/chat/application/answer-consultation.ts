import type { ConsultationMemoryPort, MemoryProposal, PersonalContext } from '../../profile/application/consultation-memory.js';
import { bodyQuestionReply } from '../domain/editorial-reply.js';
import type { ChatLocale, ConsultationPrompt } from '../domain/consultation.js';

type DailyReflection = { title: string; reflection: string };
type ConsultationReply = { reply: string; model: string };
export type ConsultationIdentity = { owner: string; kind: 'visitor' | 'account' };

export type ConsultationToolRequest =
  | { type: 'daily_card' }
  | { type: 'remember_fact'; kind: MemoryProposal['kind'] };

type ConsultationToolResult = { status: 'not_revealed' | 'saved' | 'not_saved' }
  | ({ status: 'revealed' } & DailyReflection);

export type ConsultationTools = {
  dailyCard: boolean;
  memoryKind?: MemoryProposal['kind'];
  handle: (request: ConsultationToolRequest) => Promise<ConsultationToolResult>;
};

export type GenerateConsultationOptions = {
  daily?: DailyReflection;
  personal?: PersonalContext;
  tools?: ConsultationTools;
};

type AnswerConsultationPorts = {
  generate: (input: ConsultationPrompt, options: GenerateConsultationOptions) => Promise<ConsultationReply>;
  memory: ConsultationMemoryPort;
  dailyCards: {
    byId: (owner: string, id: string, locale: ChatLocale) => Promise<DailyReflection>;
    today: (owner: string, locale: ChatLocale) => Promise<DailyReflection | undefined>;
  };
};

export class MissingConsultationIdentity extends Error {}

export class AnswerConsultation {
  constructor(private readonly ports: AnswerConsultationPorts) {}

  async execute({ dailyCardId, ...input }: ConsultationPrompt & { dailyCardId?: string }, identity?: ConsultationIdentity) {
    if (dailyCardId && !identity) throw new MissingConsultationIdentity();
    const { generate, memory, dailyCards } = this.ports;
    const daily = dailyCardId && identity ? await dailyCards.byId(identity.owner, dailyCardId, input.locale) : undefined;
    const personal = identity ? await memory.context(identity.owner, input.topic) : undefined;
    const editorial = bodyQuestionReply(input.message, input.locale);
    if (editorial) return { reply: editorial, model: 'editorial' };

    const proposal = identity?.kind === 'account' ? await memory.propose(identity.owner, input.message) : undefined;
    const tools = identity ? this.tools(identity.owner, input.locale, !dailyCardId, proposal) : undefined;
    return generate(input, { daily, personal, tools });
  }

  private tools(owner: string, locale: ChatLocale, dailyCard: boolean, memory?: MemoryProposal): ConsultationTools {
    let used = false;
    return {
      dailyCard,
      memoryKind: memory?.kind,
      handle: async (request) => {
        if (used) throw new Error('A consulta já executou uma ferramenta.');
        if (request.type === 'daily_card' && dailyCard) {
          used = true;
          const card = await this.ports.dailyCards.today(owner, locale);
          return card ? { status: 'revealed', title: card.title, reflection: card.reflection } : { status: 'not_revealed' };
        }
        if (request.type === 'remember_fact' && memory && request.kind === memory.kind) {
          used = true;
          return { status: await memory.accept() ? 'saved' : 'not_saved' };
        }
        throw new Error('Ferramenta fora do contexto da consulta.');
      },
    };
  }
}
