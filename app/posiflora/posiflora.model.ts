export interface PosifloraPayloadData<
  Type extends string = string,
  Attributes = unknown
> {
  type: Type;
  attributes?: Attributes;
}

export interface PosifloraPayload<Data extends PosifloraPayloadData> {
  data: Data;
}

export interface IPosifloraUserCredentials {
  username: string;
  password: string;
}
