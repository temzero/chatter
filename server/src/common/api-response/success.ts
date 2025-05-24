export class SuccessResponse<D> {
  constructor(
    public readonly payload: D,
    public readonly message?: string,
  ) {}
}

// Specialized version for auth responses
export class AuthResponse {
  constructor(
    public readonly accessToken: string,
    public readonly message?: string,
  ) {}
}

// refresh-response.ts
export class RefreshResponse {
  constructor(
    public readonly accessToken: string,
    public readonly email: string,
    public readonly deviceName: string,
    public readonly message?: string,
  ) {}
}
