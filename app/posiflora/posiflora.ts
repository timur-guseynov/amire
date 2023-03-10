import { PosifloraSession } from "~/posiflora/session/posiflora-session";
import { PosifloraSessionRepository } from "~/posiflora/session/posiflora-session-repository";
import { PosifloraFetch } from "~/posiflora/posiflora-fetch";
import { PosifloraInMemorySessionStorage } from "~/posiflora/session/posiflora-session-storage";
import { posifloraSessionFetchMiddleware } from "~/posiflora/session/posiflora-session-fetch-middleware";

import type { IPosifloraFetch } from "~/posiflora/posiflora-fetch";

interface PosifloraOptions {
  baseUrl: string;
  username: string;
  password: string;
}

function makeFetch({
  baseUrl,
  username,
  password,
}: PosifloraOptions): IPosifloraFetch {
  const fetch = new PosifloraFetch(baseUrl);

  const session = new PosifloraSession(
    new PosifloraSessionRepository(fetch, {
      username,
      password,
    }),
    new PosifloraInMemorySessionStorage()
  );

  fetch.use(posifloraSessionFetchMiddleware(session));

  return fetch;
}

export class Posiflora {
  private readonly fetch: IPosifloraFetch;

  constructor(options: PosifloraOptions) {
    this.fetch = makeFetch(options);
  }
}
