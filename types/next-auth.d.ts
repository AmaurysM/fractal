import NextAuth, { DefaultSession } from "next-auth";

import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    // Auth identity only — profile data lives in user_settings
  }

  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]; // carries name, email, image from OAuth
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}