// api/library/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createSSEStream } from "@/app/lib/sse";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const stream = await createSSEStream({
    userId: session.user.id,
    initialQuery: `SELECT * FROM "Library" WHERE userid = $1`,
    queryParams: [session.user.id],
    channel: "library_changes",
    req,
    topLevelKey: "libraries",
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
