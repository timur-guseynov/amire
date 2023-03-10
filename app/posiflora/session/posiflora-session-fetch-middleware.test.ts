import { rest } from "msw";
import { setupServer } from "msw/node";

import { posifloraSessionFetchMiddleware } from "~/posiflora/session/posiflora-session-fetch-middleware";
import { PosifloraFetch } from "~/posiflora/posiflora-fetch";

import type { IPosifloraSession } from "~/posiflora/session/posiflora-session";

class MockPosifloraSession implements IPosifloraSession {
  getAccessToken(): Promise<string> {
    return Promise.resolve("accessToken");
  }
}

test("adds access token to request headers except session ones", async () => {
  const session = new MockPosifloraSession();
  const fetch = new PosifloraFetch("https://test.posiflora.com/").use(
    posifloraSessionFetchMiddleware(session)
  );

  const server = setupServer(
    rest.get("/api/v1/test", (req, res, context) =>
      res(
        context.status(200),
        context.json({ token: req.headers.get("Authorization") })
      )
    ),
    rest.get("/api/v1/sessions", (req, res, context) =>
      res(
        context.status(200),
        context.json({ token: req.headers.get("Authorization") })
      )
    )
  );
  server.listen();

  const { token } = await fetch.do<{ token: string }>("/test");
  expect(token).toBe("Bearer accessToken");

  const { token: noToken } = await fetch.do<{ token: string }>("/sessions");
  expect(noToken).toBeNull();

  server.close();
});
