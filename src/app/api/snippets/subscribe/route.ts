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
    initialQuery: `SELECT * FROM "Snippet" WHERE userid = $1`,
    queryParams: [session.user.id],
    channel: "snippet_changes",
    req,
    topLevelKey: "snippets",
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
