import type { PosifloraFetchRequestTransformer } from "~/posiflora/posiflora-fetch";
import type { IPosifloraSession } from "~/posiflora/session/posiflora-session";

export const posifloraSessionFetchMiddleware: (
  session: IPosifloraSession
) => PosifloraFetchRequestTransformer =
  (session: IPosifloraSession) => async (req, url) => {
    if (url.includes("sessions")) {
      return;
    }

    const token = await session.getAccessToken();
    req.headers = {
      ...req.headers,
      Authorization: `Bearer ${token}`,
    };
  };
