import { LogCall, Logger, logger } from "~/logger/logger.server";

import type { Token } from "~/posiflora/session/posiflora-session-token";

export interface IPosifloraSessionStorage {
  readAccessToken(): Promise<Token | undefined>;
  writeAccessToken(accessToken: Token): Promise<void>;

  readRefreshToken(): Promise<Token | undefined>;
  writeRefreshToken(refreshToken: Token): Promise<void>;
}

const storageLogger = logger.makeChildLoggerFor(
  "posiflora:session:in-memory-storage"
);

@Logger({ logger: storageLogger })
export class PosifloraInMemorySessionStorage
  implements IPosifloraSessionStorage
{
  private accessToken: Token | undefined;
  private refreshToken: Token | undefined;

  @LogCall()
  async readAccessToken(): Promise<Token | undefined> {
    return this.accessToken;
  }

  @LogCall()
  async readRefreshToken(): Promise<Token | undefined> {
    return this.refreshToken;
  }

  @LogCall({ output: false })
  async writeAccessToken(accessToken: Token): Promise<void> {
    this.accessToken = accessToken;
  }

  @LogCall({ output: false })
  async writeRefreshToken(refreshToken: Token): Promise<void> {
    this.refreshToken = refreshToken;
  }
}
