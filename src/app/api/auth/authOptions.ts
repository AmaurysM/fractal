import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { Pool } from "pg";
import { User } from "../../../../types/types";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function getOrCreateUser(user: User) {
  const res = await pool.query(
    `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
    [user.email],
  );

  if (res.rows.length > 0) return res.rows[0];

  const insert = await pool.query(
    `INSERT INTO "User" (email, image)
     VALUES ($1, $2)
     RETURNING id`,
    [user.email, user.image],
  );

  return insert.rows[0];
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      issuer: "https://github.com/login/oauth",
      profile(profile) {
        const fullName = profile.name ?? profile.login ?? "";
        const [firstName, ...rest] = fullName.split(" ");
        return {
          id: String(profile.id),
          name: fullName,
          first_name: firstName ?? null,
          last_name: rest.join(" ") || null,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          first_name: profile.given_name ?? null,
          last_name: profile.family_name ?? null,
          email: profile.email,
          image: profile.picture,
          username: profile.email.split("@")[0],
        };
      },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_ID ?? "",
      clientSecret: process.env.DISCORD_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          first_name: profile.username ?? null,
          last_name: null,
          email: profile.email,
          image: profile.avatar,
          username: profile.username,
        };
      },
    }),
  ],

  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        try {
          const dbUser = await getOrCreateUser(user as User);
          token.id = dbUser.id;
        } catch (error) {
          console.error("Error in JWT callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
