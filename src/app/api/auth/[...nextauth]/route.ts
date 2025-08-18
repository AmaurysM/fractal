import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { Pool } from "pg";

// Create a DB pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // This runs only the first time a user signs in
      //console.log("INSIDE JWT", { user, token });

      if (user) {
        const res = await pool.query(
          'SELECT id, username FROM "User" WHERE email = $1 LIMIT 1',
          [user.email]
        );

        let dbUser;

        if (res.rows.length > 0) {
          dbUser = res.rows[0];
        } else {
          const insert = await pool.query(
            'INSERT INTO "User" (email, username, image) VALUES ($1, $2) RETURNING id, username',
            [
              user.email,
              user.name ?? "", // GitHub provider doesn't give `username`, only `name`
              user.image,
            ]
          );
          dbUser = insert.rows[0];
        }

        // Attach DB data to the token
        token.id = dbUser.id;
        token.username = dbUser.username;
      }

      // On subsequent requests, token already has id/username
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
