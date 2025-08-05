export function parseJsonContent<T = unknown>(value: unknown): T | null {
  if (typeof value !== "string") return null;

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as T;
    }
    return null;
  } catch {
    return null;
  }
}
