import { createContext, useContext, useState } from 'react';
import { useIdentityRevision } from '../../lib/session-token';

const DraftContext = createContext<{
  question: string;
  setQuestion: (value: string) => void;
  readingQuestion: string;
  setReadingQuestion: (value: string) => void;
} | null>(null);

export function DraftProvider({ children }: { children: React.ReactNode }) {
  const revision = useIdentityRevision();
  const empty = { revision, question: '', readingQuestion: '' };
  const [stored, setStored] = useState(empty);
  const draft = stored.revision === revision ? stored : empty;

  return <DraftContext.Provider value={{
    question: draft.question,
    readingQuestion: draft.readingQuestion,
    setQuestion: (question) => setStored((previous) => ({ ...(previous.revision === revision ? previous : empty), question })),
    setReadingQuestion: (readingQuestion) => setStored((previous) => ({ ...(previous.revision === revision ? previous : empty), readingQuestion })),
  }}>
    {children}
  </DraftContext.Provider>;
}

export function useQuestionDraft() {
  const draft = useContext(DraftContext);
  if (!draft) throw new Error('DraftProvider is missing.');
  return draft;
}
