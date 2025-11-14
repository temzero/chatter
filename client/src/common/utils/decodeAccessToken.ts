export function decodeAccessToken(token: string | null) {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return {
      ...payload,
      expDate: new Date(payload.exp * 1000),
      iatDate: new Date(payload.iat * 1000),
    };
  } catch (e) {
    console.error("[JWT] Failed to decode:", e);
    return null;
  }
}
