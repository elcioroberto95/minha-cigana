import { createContext, useContext, useState } from 'react';

const DraftContext = createContext<{
  question: string;
  setQuestion: (value: string) => void;
  readingQuestion: string;
  setReadingQuestion: (value: string) => void;
} | null>(null);

export function DraftProvider({ children }: { children: React.ReactNode }) {
  const [question, setQuestion] = useState('');
  const [readingQuestion, setReadingQuestion] = useState('');
  return <DraftContext.Provider value={{ question, setQuestion, readingQuestion, setReadingQuestion }}>
    {children}
  </DraftContext.Provider>;
}

export function useQuestionDraft() {
  const draft = useContext(DraftContext);
  if (!draft) throw new Error('DraftProvider is missing.');
  return draft;
}
