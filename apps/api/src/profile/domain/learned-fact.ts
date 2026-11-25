export type LearnedFact = { kind: 'occupation' | 'relationship' | 'career_goal'; value: string };

const relationshipStates = {
  casado: 'married', casada: 'married', married: 'married',
  solteiro: 'single', solteira: 'single', single: 'single',
  divorciado: 'divorced', divorciada: 'divorced', divorced: 'divorced',
} as const;

const careerGoals = [
  [/^(mudar de emprego|trocar de emprego|change jobs)$/i, 'change_jobs'],
  [/^(conseguir um emprego|arrumar um emprego|find a job)$/i, 'find_job'],
  [/^(abrir (?:meu|minha|um) (?:negócio|empresa|salão)|start (?:my own|a) business)$/i, 'start_business'],
  [/^(conseguir uma promoção|get a promotion)$/i, 'promotion'],
] as const;

export function memoryCandidate(message: string): LearnedFact | undefined {
  for (const part of message.match(/[^.!?;\n]+[.!?;\n]?/g) ?? []) {
    if (part.endsWith('?')) continue;
    const sentence = part.replace(/[.!;\n]$/, '').trim();
    const relationship = /^(?:eu )?(?:sou|estou|i am|i['’]m) (\p{L}+)$/iu.exec(sentence)?.[1].toLowerCase();
    if (relationship && Object.hasOwn(relationshipStates, relationship)) {
      return { kind: 'relationship', value: relationshipStates[relationship as keyof typeof relationshipStates] };
    }
    const occupation = /^(?:eu )?(?:trabalho como|minha profissão é|i work as (?:a |an )?)\s*(\p{L}[\p{L}\p{M} -]{1,63})$/iu.exec(sentence)?.[1].trim();
    if (occupation && occupation.split(/\s+/).length <= 5 && !/\b(e|que|mas|para|and|but|for|with)\b/i.test(occupation)) {
      return { kind: 'occupation', value: occupation };
    }
    const goal = /^(?:eu |i )?(?:quero|want to) (.+)$/iu.exec(sentence)?.[1].trim();
    if (goal) {
      const match = careerGoals.find(([pattern]) => pattern.test(goal));
      if (match) return { kind: 'career_goal', value: match[1] };
    }
  }
}

export function retentionDays(fact: LearnedFact) {
  return fact.kind === 'career_goal' ? 30 : null;
}

export function relevantLearnedKinds(topic: string): LearnedFact['kind'][] {
  if (topic === 'general') return ['occupation', 'career_goal', 'relationship'];
  if (topic === 'money' || topic === 'work') return ['occupation', 'career_goal'];
  return topic === 'love' ? ['relationship'] : [];
}
