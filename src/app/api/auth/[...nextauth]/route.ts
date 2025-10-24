import NextAuth from "next-auth";
import { authOptions } from "../authOptions";

const handler = NextAuth(authOptions);

export const runtime = "edge";
export { handler as GET, handler as POST };

// import { authOptions } from "@/app/api/auth/authOptions";

