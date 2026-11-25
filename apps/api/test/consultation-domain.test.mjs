import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AnswerConsultation, MissingConsultationIdentity } from '../dist/chat/application/answer-consultation.js';
import { ConsultationMemory } from '../dist/profile/application/consultation-memory.js';
import { relevantLearnedKinds } from '../dist/profile/domain/learned-fact.js';

const account = { owner: 'account-a', kind: 'account' };
const prompt = { locale: 'pt-BR', topic: 'work', message: 'Trabalho como desenvolvedora.', history: [] };
const reply = { reply: 'Vamos refletir.', model: 'fixture' };

function fixture(generate, enabled = true) {
  const preference = { enabled };
  const saved = [];
  const card = { title: 'A Estrela', reflection: 'Cultive esperança.' };
  const memory = new ConsultationMemory({
    chatContext: async () => undefined,
    learningEnabled: async () => preference.enabled,
    rememberIfEnabled: async (owner, fact, expiresInDays) => {
      if (!preference.enabled) return false;
      saved.push({ owner, fact, expiresInDays });
      return true;
    },
  });
  return {
    preference, saved, card,
    consultation: new AnswerConsultation({
      generate,
      memory,
      dailyCards: {
        byId: async (owner, id, locale) => {
          assert.deepEqual([owner, id, locale], [account.owner, 'saved-card', 'pt-BR']);
          return card;
        },
        today: async (owner, locale) => {
          assert.deepEqual([owner, locale], [account.owner, 'pt-BR']);
          return card;
        },
      },
    }),
  };
}

test('ESM-16 memória desligada impede gravação e a consulta responde', async () => {
  const { consultation, saved } = fixture(async (_prompt, { tools }) => {
    assert.equal(tools.memoryKind, undefined);
    await assert.rejects(tools.handle({ type: 'remember_fact', kind: 'occupation' }));
    return reply;
  }, false);
  assert.deepEqual(await consultation.execute(prompt, account), reply);
  assert.deepEqual(saved, []);
});

test('ESM-16 guarda o fato da mensagem para o proprietário e aplica a validade de carreira', async () => {
  const { consultation, saved } = fixture(async (_prompt, { tools }) => {
    assert.equal(tools.memoryKind, 'career_goal');
    await assert.rejects(tools.handle({ type: 'remember_fact', kind: 'relationship' }));
    assert.deepEqual(await tools.handle({ type: 'remember_fact', kind: 'career_goal' }), { status: 'saved' });
    await assert.rejects(tools.handle({ type: 'remember_fact', kind: 'career_goal' }));
    return reply;
  });
  assert.deepEqual(await consultation.execute({ ...prompt, message: 'Quero mudar de emprego.' }, account), reply);
  assert.deepEqual(saved, [{
    owner: account.owner, fact: { kind: 'career_goal', value: 'change_jobs' }, expiresInDays: 30,
  }]);
  assert.deepEqual(relevantLearnedKinds('love'), ['relationship']);
  assert.deepEqual(relevantLearnedKinds('work'), ['occupation', 'career_goal']);
});

test('ESM-16 desativar a memória depois da proposta impede a escrita', async () => {
  const { consultation, preference, saved } = fixture(async (_prompt, { tools }) => {
    assert.equal(tools.memoryKind, 'occupation');
    preference.enabled = false;
    assert.deepEqual(await tools.handle({ type: 'remember_fact', kind: 'occupation' }), { status: 'not_saved' });
    return reply;
  });
  assert.deepEqual(await consultation.execute(prompt, account), reply);
  assert.deepEqual(saved, []);
});

test('ESM-16 usa a carta explícita com a identidade correta e preserva o caminho editorial', async () => {
  let count = 0;
  const { consultation, card } = fixture(async (_prompt, options) => {
    count++;
    assert.deepEqual(options.daily, card);
    assert.equal(options.tools.dailyCard, false);
    await assert.rejects(options.tools.handle({ type: 'daily_card' }));
    return reply;
  });
  const explicit = { ...prompt, dailyCardId: 'saved-card' };
  await assert.rejects(consultation.execute(explicit), MissingConsultationIdentity);
  assert.deepEqual(await consultation.execute(explicit, account), reply);
  const editorial = await consultation.execute({ ...explicit, message: 'Meu pênis vai crescer?' }, account);
  assert.equal(editorial.model, 'editorial');
  assert.equal(count, 1);
});
