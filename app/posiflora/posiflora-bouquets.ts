import type { IPosifloraFetch } from "~/posiflora/posiflora-fetch";

export interface IPosifloraBouquets {
  getList(): Array<any>;
}

export class PosifloraBouquets implements IPosifloraBouquets {
  constructor(private fetch: IPosifloraFetch) {}

  getList() {}
}
