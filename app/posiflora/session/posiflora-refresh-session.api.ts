import { posifloraFetch } from "~/posiflora/posiflora.api";

import type { PosifloraSessionResponse } from "~/posiflora/session/posiflora-session.response";

interface RequestBody {
  data: {
    type: "sessions";
    attributes: {
      refreshToken: string;
    };
  };
}

interface ResponseBody {
  data: {
    attributes: PosifloraSessionResponse;
  };
}

export async function refreshSession(
  refreshToken: string
): Promise<PosifloraSessionResponse> {
  const body: RequestBody = {
    data: {
      type: "sessions",
      attributes: {
        refreshToken,
      },
    },
  };

  const response = await posifloraFetch<RequestBody, ResponseBody>(
    "v1/sessions",
    {
      method: "post",
      body,
    }
  );

  return response.data.attributes;
}
