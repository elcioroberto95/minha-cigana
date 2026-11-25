import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { ConflictException, HttpException, HttpStatus, Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { Pool, type PoolClient } from 'pg';
import { credentialHash } from '../visitor/visitor-identity.js';
import type { readCredentials, readRegistration } from './auth-input.js';

export type Identity =
  | { kind: 'visitor'; owner: string }
  | { kind: 'account'; owner: string; email: string; sessionHash: string };

type Account = { owner: string; digest: Buffer; salt: Buffer };

const dummySalt = randomBytes(16);
const dummyDigest = randomBytes(64);
const keyOptions = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

@Injectable()
export class AuthService implements OnModuleDestroy {
  private readonly logger = new Logger(AuthService.name);
  private readonly pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5_000, max: 4 })
    : undefined;
  private activeHashes = 0;

  constructor() {
    this.pool?.on('error', () => this.logger.warn('Conexão de autenticação interrompida.'));
  }

  onModuleDestroy() {
    return this.pool?.end();
  }

  hasAccount(email: string) {
    return this.database(async (pool) => {
      const result = await pool.query('SELECT 1 FROM accounts WHERE email = $1', [email]);
      return result.rowCount === 1;
    });
  }

  register(owner: string, { name, email, sex, password }: ReturnType<typeof readRegistration>) {
    return this.database(async (pool) => {
      const salt = randomBytes(16);
      const digest = await this.hash(password, salt);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const account = await client.query(
          `INSERT INTO accounts (owner_hash, email, password_hash, password_salt)
           VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
          [owner, email, digest, salt],
        );
        if (!account.rowCount) throw new ConflictException({ error: 'registration_conflict' });
        await client.query(
          `INSERT INTO visitor_profiles (owner_hash, name, email, sex) VALUES ($1, $2, $3, $4)
           ON CONFLICT (owner_hash) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, sex = EXCLUDED.sex`,
          [owner, name, email, sex],
        );
        const session = await this.issueSession(client, owner);
        await client.query('COMMIT');
        return session;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    });
  }

  login({ email, password }: ReturnType<typeof readCredentials>) {
    return this.database(async (pool) => {
      const { rows: [account] } = await pool.query<Account>(
        'SELECT owner_hash AS owner, password_hash AS digest, password_salt AS salt FROM accounts WHERE email = $1', [email],
      );
      const digest = await this.hash(password, account?.salt ?? dummySalt);
      const matches = timingSafeEqual(digest, account?.digest ?? dummyDigest);
      if (!account || !matches) throw new UnauthorizedException({ error: 'invalid_credentials' });

      await pool.query('DELETE FROM account_sessions WHERE owner_hash = $1 AND expires_at <= now()', [account.owner]);
      return this.issueSession(pool, account.owner);
    });
  }

  logout(sessionHash: string) {
    return this.database(async (pool) => {
      await pool.query('DELETE FROM account_sessions WHERE token_hash = $1', [sessionHash]);
    });
  }

  async identify(authorization: string): Promise<Identity> {
    const accountToken = /^Bearer (a_[a-f0-9]{64})$/.exec(authorization)?.[1];
    if (accountToken) {
      const sessionHash = credentialHash(accountToken);
      return this.database(async (pool) => {
        const { rows: [session] } = await pool.query<{ owner: string; email: string }>(
          `SELECT s.owner_hash AS owner, a.email FROM account_sessions s JOIN accounts a USING (owner_hash)
           WHERE s.token_hash = $1 AND s.expires_at > now()`,
          [sessionHash],
        );
        if (!session) throw new UnauthorizedException({ error: 'session_invalid' });
        return { kind: 'account', ...session, sessionHash };
      });
    }

    const visitor = /^Bearer ([a-f0-9]{64})$/.exec(authorization)?.[1];
    if (!visitor) throw new UnauthorizedException({ error: 'visitor_required' });
    const owner = credentialHash(visitor);
    if (this.pool) {
      await this.database(async (pool) => {
        const account = await pool.query('SELECT 1 FROM accounts WHERE owner_hash = $1', [owner]);
        if (account.rowCount) throw new UnauthorizedException({ error: 'visitor_converted' });
      });
    }
    return { kind: 'visitor', owner };
  }

  private async issueSession(db: Pool | PoolClient, owner: string) {
    const token = 'a_' + randomBytes(32).toString('hex');
    await db.query('INSERT INTO account_sessions (token_hash, owner_hash) VALUES ($1, $2)', [credentialHash(token), owner]);
    return { token };
  }

  private async hash(password: string, salt: Buffer) {
    if (this.activeHashes >= 4) throw new HttpException({ error: 'auth_busy' }, HttpStatus.TOO_MANY_REQUESTS);
    this.activeHashes++;
    try {
      return await new Promise<Buffer>((resolve, reject) => {
        scrypt(password, salt, 64, keyOptions, (error, digest) => error ? reject(error) : resolve(digest));
      });
    } finally {
      this.activeHashes--;
    }
  }

  private async database<T>(execute: (pool: Pool) => Promise<T>) {
    if (!this.pool) throw new ServiceUnavailableException({ error: 'auth_unavailable' });
    try {
      return await execute(this.pool);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.warn('Falha no acesso ao banco de autenticação.');
      throw new ServiceUnavailableException({ error: 'auth_unavailable' });
    }
  }
}
