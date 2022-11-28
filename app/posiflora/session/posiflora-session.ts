import { Token } from "~/posiflora/session/posiflora-session.token";
import { refreshSession } from "~/posiflora/session/posiflora-refresh-session.api";
import { createSession } from "~/posiflora/session/posiflora-create-session.api";

import type { PosifloraSessionResponse } from "~/posiflora/session/posiflora-session.response";

let accessToken: Token;
let refreshToken: Token;

async function getToken(): Promise<Token> {
  if (accessToken && !accessToken.hasExpired()) {
    return Promise.resolve(accessToken);
  }

  const session = await createOrRefreshSession();
  cacheTokensFrom(session);

  return accessToken;
}

function createOrRefreshSession(): Promise<PosifloraSessionResponse> {
  if (refreshToken && !refreshToken.hasExpired()) {
    return refreshSession(refreshToken.token);
  }

  return createSession({
    username: process.env.POSIFLORA_USERNAME,
    password: process.env.POSIFLORA_PASSWORD,
  });
}

function cacheTokensFrom(session: PosifloraSessionResponse): void {
  accessToken = Token.fromApiResponse({
    token: session.accessToken,
    expiresAt: session.expireAt,
  });

  refreshToken = Token.fromApiResponse({
    token: session.refreshToken,
    expiresAt: session.refreshExpireAt,
  });
}
