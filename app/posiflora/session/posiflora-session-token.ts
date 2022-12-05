import { isPast, parseISO } from "date-fns";
import type { IPosifloraSessionResponse } from "~/posiflora/session/posiflora-session-response";

export class Token {
  private constructor(public value: string, public expiresAt: Date) {}

  static fromAccessTokenResponse({
    accessToken,
    expireAt,
  }: IPosifloraSessionResponse): Token {
    return new Token(accessToken, parseISO(expireAt));
  }

  static fromRefreshTokenResponse({
    refreshToken,
    refreshExpireAt,
  }: IPosifloraSessionResponse): Token {
    return new Token(refreshToken, parseISO(refreshExpireAt));
  }

  hasExpired(): boolean {
    return isPast(this.expiresAt);
  }
}
