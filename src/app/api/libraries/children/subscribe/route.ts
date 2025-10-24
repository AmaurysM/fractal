import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createSSEStream } from "@/app/lib/sse";
import { authOptions } from "@/app/api/auth/authOptions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const libId = url.searchParams.get("libraryId");

  if (!libId) {
    return NextResponse.json(
      { message: "Missing Library ID in query" },
      { status: 400 }
    );
  }
  const stream = await createSSEStream({
    userId: session.user.id,
    initialQuery: `SELECT l.* FROM "Library" l LEFT JOIN "LibraryJunction" lj ON l.id = lj.childlibrary WHERE lj.parentlibrary = $1`,
    queryParams: [libId],
    channel: "library_changes",
    req,
    topLevelKey: "libraries",
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
