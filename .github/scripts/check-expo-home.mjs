import { spawn } from 'node:child_process';
import { on, once } from 'node:events';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const pageUrl = 'http://127.0.0.1:4173/';
const accountOptions = [['Seu encontro com Esmeralda', 'Continuar'], ['Your time with Esmeralda', 'Continue']];
const profile = await mkdtemp(join(process.env.RUNNER_TEMP || tmpdir(), 'expo-chrome-'));
const signal = AbortSignal.timeout(60_000);
const chrome = spawn(process.env.CHROME_BINARY || 'google-chrome', [
  '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run',
  '--disable-background-networking', '--remote-debugging-port=0', '--user-data-dir=' + profile, pageUrl,
], { stdio: ['ignore', 'ignore', 'inherit'] });

let socket;
let lastText = '';
try {
  await once(chrome, 'spawn', { signal });
  const target = await findPage();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await once(socket, 'open', { signal });
  for (let id = 1; ; id++) {
    const entry = await pageEntry(socket, id);
    lastText = entry?.text ?? '';
    if (entry?.inputs.length === 1 && entry.inputs[0] === 'email'
      && accountOptions.some((labels) => labels.every((label) => lastText.includes(label)))) break;
    await wait(250, undefined, { signal });
  }
} catch (error) {
  throw new Error('O Chrome não exibiu a entrada da conta. Último texto: ' + lastText.slice(0, 300), { cause: error });
} finally {
  socket?.close();
  chrome.kill();
}

async function findPage() {
  while (!signal.aborted) {
    if (chrome.exitCode !== null) throw new Error('Chrome encerrou antes de abrir a página.');
    try {
      const [port] = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split(/\r?\n/);
      const response = await fetch('http://127.0.0.1:' + port + '/json/list', { signal });
      const pages = await response.json();
      const page = pages.find((target) => target.type === 'page' && target.url === pageUrl);
      if (page) return page;
    } catch {
      signal.throwIfAborted();
    }
    await wait(250, undefined, { signal });
  }
  signal.throwIfAborted();
}

async function pageEntry(connection, id) {
  const messages = on(connection, 'message', { signal });
  connection.send(JSON.stringify({
    id, method: 'Runtime.evaluate', params: {
      expression: '({ text: document.body?.innerText ?? "", inputs: Array.from(document.querySelectorAll("input"), input => input.type) })',
      returnByValue: true,
    },
  }));
  for await (const [message] of messages) {
    const response = JSON.parse(message.data);
    if (response.id === id) return response.result?.result?.value;
  }
}
