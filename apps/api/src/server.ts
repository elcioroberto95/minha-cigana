import { createApiServer } from './http.ts';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || '3000');

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
}

const server = createApiServer();
server.listen(port, host, () => {
  console.log(`API disponível em ${host}:${port}`);
});
