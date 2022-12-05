import type { IPosifloraFetch } from "~/posiflora/posiflora-fetch";
import type { IPosifloraUserCredentials } from "~/posiflora/posiflora.model";
import type { IPosifloraSessionResponse } from "~/posiflora/session/posiflora-session-response";

export interface IPosifloraSessionRepository {
  create: () => Promise<IPosifloraSessionResponse>;
  refresh: (refreshToken: string) => Promise<IPosifloraSessionResponse>;
}

interface CreateSessionRequestBody {
  data: {
    type: "sessions";
    attributes: IPosifloraUserCredentials;
  };
}

interface RefreshSessionRequestBody {
  data: {
    type: "sessions";
    attributes: {
      refreshToken: string;
    };
  };
}

interface ResponseBody {
  data: {
    attributes: IPosifloraSessionResponse;
  };
}

export class PosifloraSessionRepository implements IPosifloraSessionRepository {
  constructor(
    private fetch: IPosifloraFetch,
    private credentials: IPosifloraUserCredentials
  ) {}

  async create(): Promise<IPosifloraSessionResponse> {
    const body: CreateSessionRequestBody = {
      data: {
        type: "sessions",
        attributes: this.credentials,
      },
    };

    const response = await this.fetch.do<ResponseBody>("/sessions", {
      method: "post",
      body,
    });
    return response.data.attributes;
  }

  async refresh(refreshToken: string): Promise<IPosifloraSessionResponse> {
    const body: RefreshSessionRequestBody = {
      data: {
        type: "sessions",
        attributes: {
          refreshToken,
        },
      },
    };

    const response = await this.fetch.do<ResponseBody>("/sessions", {
      method: "patch",
      body,
    });
    return response.data.attributes;
  }
}
