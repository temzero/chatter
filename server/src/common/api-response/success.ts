export class SuccessResponse<D> {
  constructor(
    public readonly payload: D,
    public readonly message?: string,
  ) {}
}

export class GetOrCreateResponse<D> {
  constructor(
    public readonly payload: D,
    public readonly wasExisting: boolean,
    public readonly message?: string,
  ) {}
}
