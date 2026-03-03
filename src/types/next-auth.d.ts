import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
      telegramUsername?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    telegramUsername?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    telegramUsername?: string;
  }
}
