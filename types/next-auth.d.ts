import NextAuth, { DefaultSession } from "next-auth";

// next-auth.d.ts
declare module "next-auth" {
  interface User {
    username?: string;
    first_name?: string | null;
    last_name?: string | null;
  }

  interface Session {
    user: {
      id: string;
      username?: string;
      first_name?: string | null;
      last_name?: string | null;
    } & DefaultSession["user"]; // DefaultSession["user"] already has name, email, image
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    first_name?: string | null;
    last_name?: string | null;
  }
}