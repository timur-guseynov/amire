import { rest } from "msw";
import { setupServer } from "msw/node";

import { PosifloraSession } from "~/posiflora/session/posiflora-session";
import { PosifloraSessionRepository } from "~/posiflora/session/posiflora-session-repository";
import { PosifloraInMemorySessionStorage } from "~/posiflora/session/posiflora-session-storage";
import { PosifloraFetch } from "~/posiflora/posiflora-fetch";

import type { IPosifloraUserCredentials } from "~/posiflora/posiflora.model";

const baseUrl = "https://test.posiflora.com/";
const credentials: IPosifloraUserCredentials = {
  username: "florist",
  password: "flora",
};

const accessToken = "floristToken";
const refreshedAccessToken = "floristRefreshedToken";
const renewedAccessToken = "floristRenewedToken";
const refreshToken = "floristRefresh";

function makePosifloraSession() {
  const fetch = new PosifloraFetch(baseUrl);
  const repository = new PosifloraSessionRepository(fetch, credentials);

  const storage = new PosifloraInMemorySessionStorage();

  return new PosifloraSession(repository, storage);
}

test("gets access token, refreshes it when expired and gets a new one when both tokens expired", async () => {
  const currentDate = "2022-12-04T00:00:00.000Z";
  const expirationDate = "2022-12-05T00:00:00.000Z";
  const dateToExpireAccessToken = "2022-12-05T05:00:00.000Z";
  const refreshExpirationDate = "2022-12-06T00:00:00.000Z";
  const dateToExpireRefreshToken = "2022-12-06T05:00:00.000Z";

  vi.useFakeTimers();
  vi.setSystemTime(currentDate);

  let createSessionCallAmount = 0;
  const server = setupServer(
    rest.post("/api/v1/sessions", (req, res, ctx) => {
      createSessionCallAmount++;
      return res(
        ctx.status(200),
        ctx.json({
          data: {
            type: "sessions",
            attributes: {
              accessToken:
                createSessionCallAmount === 1
                  ? accessToken
                  : renewedAccessToken,
              expireAt: expirationDate,
              refreshToken,
              refreshExpireAt: refreshExpirationDate,
            },
          },
        })
      );
    }),

    rest.patch("/api/v1/sessions", (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          data: {
            type: "sessions",
            attributes: {
              accessToken: refreshedAccessToken,
              expireAt: expirationDate,
              refreshToken,
              refreshExpireAt: refreshExpirationDate,
            },
          },
        })
      )
    )
  );
  server.listen();
  const posifloraSession = makePosifloraSession();

  // gets access token
  const newToken = await posifloraSession.getAccessToken();
  expect(newToken).toBe(accessToken);

  // refreshes token when access token expires
  vi.setSystemTime(dateToExpireAccessToken);
  const refreshedToken = await posifloraSession.getAccessToken();
  expect(refreshedToken).toBe(refreshedAccessToken);

  // renews token when both access and refresh tokens expire
  vi.setSystemTime(dateToExpireRefreshToken);
  const renewedToken = await posifloraSession.getAccessToken();
  expect(renewedToken).toBe(renewedAccessToken);

  server.close();
  vi.useRealTimers();
});
