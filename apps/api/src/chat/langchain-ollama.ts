import { ChatOllama } from '@langchain/ollama';
import { isAIMessage, type BaseMessageLike } from '@langchain/core/messages';

export async function invokeStructuredOllama({ baseUrl, model, keepAlive, numPredict, format, messages, signal }: {
  baseUrl: string;
  model: string;
  keepAlive: string;
  numPredict: number;
  format: Record<string, unknown>;
  messages: BaseMessageLike[];
  signal: AbortSignal;
}) {
  const client = new ChatOllama({
    baseUrl, model, keepAlive, numPredict, maxRetries: 0, checkOrPullModel: false,
    fetch: (input, init) => fetch(input, {
      ...init, redirect: 'error', signal: init?.signal ? AbortSignal.any([signal, init.signal]) : signal,
    }),
  });
  const structured = client.withStructuredOutput(format, { includeRaw: true, method: 'jsonSchema' });
  const { raw } = await structured.invoke(messages, { signal });
  if (!isAIMessage(raw)) throw new Error('Invalid Ollama message type');
  // Keep the raw JSON for the Tarot validator, including unexpected keys and card order.
  return {
    ...raw.response_metadata,
    message: { content: raw.content, tool_calls: [...(raw.tool_calls ?? []), ...(raw.invalid_tool_calls ?? [])] },
  };
}
