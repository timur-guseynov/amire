import { logger, Logger, LogCall } from "~/logger/logger.server";

import { Token } from "~/posiflora/session/posiflora-session-token";

import type { IPosifloraSessionStorage } from "~/posiflora/session/posiflora-session-storage";
import type { IPosifloraSessionRepository } from "~/posiflora/session/posiflora-session-repository";
import type { IPosifloraSessionResponse } from "~/posiflora/session/posiflora-session-response";

export interface IPosifloraSession {
  getAccessToken(): Promise<string>;
}

const sessionLogger = logger.makeChildLoggerFor("posiflora:session");

@Logger({ logger: sessionLogger })
export class PosifloraSession implements IPosifloraSession {
  constructor(
    private repository: IPosifloraSessionRepository,
    private storage: IPosifloraSessionStorage
  ) {}

  @LogCall()
  async getAccessToken(): Promise<string> {
    let accessToken = await this.storage.readAccessToken();
    if (accessToken && !accessToken.hasExpired()) {
      sessionLogger.info(
        "access token was found in cache and it has not yet expired"
      );
      sessionLogger.debug("%O", accessToken);

      return accessToken.value;
    }

    sessionLogger.info("no access token was found in cache");
    const session = await this.createOrRefreshSession();
    sessionLogger.info("received session info");
    sessionLogger.debug("%O", session);
    accessToken = Token.fromAccessTokenResponse(session);
    const refreshToken = Token.fromRefreshTokenResponse(session);

    sessionLogger.info("caching tokens...");
    await this.cacheTokens(accessToken, refreshToken);

    return accessToken!.value;
  }

  @LogCall()
  private async createOrRefreshSession(): Promise<IPosifloraSessionResponse> {
    const refreshToken = await this.storage.readRefreshToken();
    if (refreshToken && !refreshToken.hasExpired()) {
      sessionLogger.info(
        "refresh token was found in cache and it has not yet expired"
      );
      sessionLogger.debug("%O", refreshToken);

      sessionLogger.info("refreshing session...");
      return this.repository.refresh(refreshToken.value);
    }

    sessionLogger.info("no refresh token was found in cache");
    sessionLogger.info("creating new session...");
    return this.repository.create();
  }

  @LogCall({ output: false })
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
