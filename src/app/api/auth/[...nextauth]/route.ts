import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getOrCreateUser(user: any) {
  const res = await pool.query(
    'SELECT id, username FROM "User" WHERE email = $1 LIMIT 1',
    [user.email]
  );

  if (res.rows.length > 0) return res.rows[0];

  const insert = await pool.query(
    'INSERT INTO "User" (email, username, image) VALUES ($1, $2, $3) RETURNING id, username',
    [user.email, user.name ?? "", user.image]
  );

  return insert.rows[0];
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_ID ?? "",
      clientSecret: process.env.DISCORD_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await getOrCreateUser(user);
        token.id = dbUser.id;
        token.username = dbUser.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin", 
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
