import type { PosifloraSessionResponse } from "~/posiflora/session/posiflora-session.response";
import { posifloraFetch } from "~/posiflora/posiflora.api";

interface UserCredentials {
  username: string;
  password: string;
}

interface RequestBody {
  data: {
    type: "sessions";
    attributes: UserCredentials;
  };
}

interface ResponseBody {
  data: {
    attributes: PosifloraSessionResponse;
  };
}

export async function createSession(
  credentials: UserCredentials
): Promise<PosifloraSessionResponse> {
  const body: RequestBody = {
    data: {
      type: "sessions",
      attributes: credentials,
    },
  };

  const response = await posifloraFetch<RequestBody, ResponseBody>(
    "v1/sessions",
    {
      method: "patch",
      body,
    }
  );

  return response.data.attributes;
}
