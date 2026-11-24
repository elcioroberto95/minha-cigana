import { apiUrl } from '../../lib/api-url';
import { getOrCreateVisitorToken, getVisitorToken } from '../../lib/visitor-token';
import type { ChatMessage } from '../chat/chat-api';
import type { Topic } from '../tarot/domain';

export const savedMessageLimit = 40;

export type SavedSession = { id: string; topic: Topic; title: string; updatedAt: string };
export type SavedConversation = SavedSession & { messages: ChatMessage[] };

function historyRequest(path: string, token: string, options: RequestInit = {}) {
  return fetch(apiUrl('/api/history' + path), {
    ...options,
    headers: { ...options.headers, Authorization: 'Bearer ' + token },
  });
}

export async function saveConversation(id: string, topic: Topic, messages: ChatMessage[]) {
  const response = await historyRequest('/' + id, await getOrCreateVisitorToken(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, messages }),
  });
  if (!response.ok) throw new Error('Unable to save conversation');
}

export async function listConversations(signal: AbortSignal): Promise<SavedSession[]> {
  const token = await getVisitorToken();
  if (!token) return [];
  const response = await historyRequest('', token, { signal });
  if (!response.ok) throw new Error('Unable to fetch history');
  return response.json();
}

export async function getConversation(id: string, signal: AbortSignal): Promise<SavedConversation | null> {
  const token = await getVisitorToken();
  if (!token) return null;
  const response = await historyRequest('/' + id, token, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to fetch conversation');
  return response.json();
}

export async function deleteConversation(id: string) {
  const token = await getVisitorToken();
  if (!token) throw new Error('Missing visitor token');
  const response = await historyRequest('/' + id, token, { method: 'DELETE' });
  if (!response.ok) throw new Error('Unable to delete conversation');
}
