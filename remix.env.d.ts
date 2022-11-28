/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare namespace NodeJS {
  interface ProcessEnv {
    POSIFLORA_USERNAME: string;
    POSIFLORA_PASSWORD: string;
    POSIFLORA_API_BASE_URL: string;
  }
}
