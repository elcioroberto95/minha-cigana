import { memoryCandidate, retentionDays, type LearnedFact } from '../domain/learned-fact.js';

type CheckIn = {
  mood: 'calm' | 'happy' | 'worried' | 'sad' | 'tired' | 'mixed';
  topic: 'love' | 'work' | 'family' | 'other';
};

export type PersonalContext = {
  name: string | null;
  today: CheckIn | null;
  recentCheckIns: (CheckIn & { date: string })[];
  savedQuestions: string[];
  learned?: LearnedFact[];
};

export type MemoryProposal = { kind: LearnedFact['kind']; accept: () => Promise<boolean> };

export type ConsultationMemoryPort = {
  context(owner: string, topic: string): Promise<PersonalContext | undefined>;
  propose(owner: string, message: string): Promise<MemoryProposal | undefined>;
};

type ConsultationMemoryRepository = {
  chatContext(owner: string, topic: string): Promise<PersonalContext | undefined>;
  learningEnabled(owner: string): Promise<boolean>;
  rememberIfEnabled(owner: string, fact: LearnedFact, expiresInDays: number | null): Promise<boolean>;
};

export class ConsultationMemory implements ConsultationMemoryPort {
  constructor(private readonly repository: ConsultationMemoryRepository) {}

  context(owner: string, topic: string) {
    return this.repository.chatContext(owner, topic);
  }

  async propose(owner: string, message: string) {
    const fact = memoryCandidate(message);
    if (!fact || !await this.repository.learningEnabled(owner).catch(() => false)) return;
    return {
      kind: fact.kind,
      accept: () => this.repository.rememberIfEnabled(owner, fact, retentionDays(fact)),
    };
  }
}
