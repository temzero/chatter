// src/constants/routes.js
export const ROUTES = {
  PUBLIC: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password/:token",
    VERIFY_EMAIL: "/auth/verify-email/:firstName/:email/:token",
  },
  PRIVATE: {
    HOME: "/",
    CHAT: ":id",
    INVITE: "invite/:token",
  },
};
