import { Token } from "~/posiflora/session/posiflora-session-token";

import type { IPosifloraSessionStorage } from "~/posiflora/session/posiflora-session-storage";
import type { IPosifloraSessionRepository } from "~/posiflora/session/posiflora-session-repository";
import type { IPosifloraSessionResponse } from "~/posiflora/session/posiflora-session-response";

export interface IPosifloraSession {
  getAccessToken(): Promise<string>;
}

export class PosifloraSession implements IPosifloraSession {
  constructor(
    private repository: IPosifloraSessionRepository,
    private storage: IPosifloraSessionStorage
  ) {}

  async getAccessToken(): Promise<string> {
    let accessToken = await this.storage.readAccessToken();
    if (accessToken && !accessToken.hasExpired()) {
      return accessToken.value;
    }

    const session = await this.createOrRefreshSession();
    accessToken = Token.fromAccessTokenResponse(session);
    const refreshToken = Token.fromRefreshTokenResponse(session);

    await this.cacheTokens(accessToken, refreshToken);

    return accessToken!.value;
  }

  private async createOrRefreshSession(): Promise<IPosifloraSessionResponse> {
    const refreshToken = await this.storage.readRefreshToken();
    if (refreshToken && !refreshToken.hasExpired()) {
      return this.repository.refresh(refreshToken.value);
    }

    return this.repository.create();
  }

  private cacheTokens(
    accessToken: Token,
    refreshToken: Token
  ): Promise<void[]> {
    return Promise.all([
      this.storage.writeAccessToken(accessToken),
      this.storage.writeRefreshToken(refreshToken),
    ]);
  }
}
