// src/common/helpers/env.helper.ts

export class EnvConfig {
  // -------------------- App --------------------
  static get appEnv(): "development" | "production" {
    return import.meta.env.VITE_APP_ENV as "development" | "production";
  }

  static get apiUrl(): string {
    // If we're running on a phone/network IP, use network URL
    const currentHost = window.location.hostname;

    // List of localhost variations
    const isLocalDev =
      currentHost === "localhost" ||
      currentHost === "127.0.0.1" ||
      currentHost === "";

    if (isLocalDev) {
      return import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
    } else {
      // For network access, use the network URL
      return (
        import.meta.env.VITE_SERVER_URL_NETWORK ||
        `http://${currentHost.split(":")[0]}:3000`
      );
    }
  }

  static get livekitWsUrl(): string {
    return import.meta.env.VITE_LIVEKIT_WS_URL || "";
  }

  // -------------------- Supabase --------------------
  static get supabase() {
    return {
      url: import.meta.env.VITE_SUPABASE_URL || "",
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
      avatarBucket: import.meta.env.VITE_SUPABASE_AVATAR_BUCKET || "avatars",
      attachmentsBucket:
        import.meta.env.VITE_SUPABASE_ATTACHMENTS_BUCKET || "attachments",
    };
  }

  // -------------------- Validation --------------------
  static validate() {
    const missing: string[] = [];

    if (!this.apiUrl) missing.push("VITE_SERVER_URL");

    if (!this.supabase.url) missing.push("VITE_SUPABASE_URL");
    if (!this.supabase.anonKey) missing.push("VITE_SUPABASE_ANON_KEY");

    if (!this.livekitWsUrl) missing.push("VITE_LIVEKIT_WS_URL");

    if (missing.length) {
      throw new Error(`Missing environment variables: ${missing.join(", ")}`);
    }
  }
}

// Run validation on import
EnvConfig.validate();
