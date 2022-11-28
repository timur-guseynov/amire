import { isFuture, parseISO } from "date-fns";

interface TokenApiResponse {
  token: string;
  expiresAt: string;
}

export class Token {
  private constructor(public token: string, public expiresAt: Date) {}

  static fromApiResponse({ token, expiresAt }: TokenApiResponse): Token {
    return new Token(token, parseISO(expiresAt));
  }

  hasExpired(): boolean {
    return isFuture(this.expiresAt);
  }
}
