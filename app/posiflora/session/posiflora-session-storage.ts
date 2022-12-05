import type { Token } from "~/posiflora/session/posiflora-session-token";

export interface IPosifloraSessionStorage {
  readAccessToken(): Promise<Token | undefined>;
  writeAccessToken(accessToken: Token): Promise<void>;

  readRefreshToken(): Promise<Token | undefined>;
  writeRefreshToken(refreshToken: Token): Promise<void>;
}

export class PosifloraInMemorySessionStorage
  implements IPosifloraSessionStorage
{
  private accessToken: Token | undefined;
  private refreshToken: Token | undefined;

  async readAccessToken(): Promise<Token | undefined> {
    return this.accessToken;
  }

  async readRefreshToken(): Promise<Token | undefined> {
    return this.refreshToken;
  }

  async writeAccessToken(accessToken: Token): Promise<void> {
    this.accessToken = accessToken;
  }

  async writeRefreshToken(refreshToken: Token): Promise<void> {
    this.refreshToken = refreshToken;
  }
}
