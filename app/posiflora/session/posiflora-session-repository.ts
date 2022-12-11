import type { IPosifloraFetch } from "~/posiflora/posiflora-fetch";
import type { IPosifloraUserCredentials } from "~/posiflora/posiflora.model";
import type { IPosifloraSessionResponse } from "~/posiflora/session/posiflora-session-response";
import { LogCall, Logger, logger } from "~/logger/logger.server";

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

const repositoryLogger = logger.makeChildLoggerFor(
  "posiflora:session:repository"
);

@Logger({ logger: repositoryLogger })
export class PosifloraSessionRepository implements IPosifloraSessionRepository {
  constructor(
    private fetch: IPosifloraFetch,
    private credentials: IPosifloraUserCredentials
  ) {}

  @LogCall()
  async create(): Promise<IPosifloraSessionResponse> {
    const body: CreateSessionRequestBody = {
      data: {
        type: "sessions",
        attributes: this.credentials,
      },
    };
    repositoryLogger.debug("request body %O", body);

    repositoryLogger.info("sending POST /sessions request...");
    const response = await this.fetch.do<ResponseBody>("/sessions", {
      method: "post",
      body,
    });
    return response.data.attributes;
  }

  @LogCall()
  async refresh(refreshToken: string): Promise<IPosifloraSessionResponse> {
    const body: RefreshSessionRequestBody = {
      data: {
        type: "sessions",
        attributes: {
          refreshToken,
        },
      },
    };
    repositoryLogger.debug("request body %O", body);

    repositoryLogger.info("sending PATCH /sessions request...");
    const response = await this.fetch.do<ResponseBody>("/sessions", {
      method: "patch",
      body,
    });
    return response.data.attributes;
  }
}
