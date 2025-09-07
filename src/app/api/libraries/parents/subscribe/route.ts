// api/library/parents/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createSSEStream } from "@/app/lib/sse";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const stream = await createSSEStream({
    userId: session.user.id,
    initialQuery: `SELECT l.* 
                     FROM "Library" l 
                     LEFT JOIN "LibraryJunction" lj ON l.id = lj.childlibrary 
                     WHERE l.userid = $1 AND lj.id IS NULL 
                     ORDER BY l.libraryname ASC`,
    queryParams: [session.user.id],
    channel: "library_changes",
    req,
    topLevelKey: "libraries"
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
