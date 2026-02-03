import db from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const result = await db.query(
      'SELECT l.* FROM "Snippet" l LEFT JOIN "SnippetJunction" lj ON l.id = lj.snippetid WHERE l."userId" = $1 AND lj.id IS NULL ORDER BY l.title ASC',
      [userId]
    );
    const Snippets = result.rows;
    return NextResponse.json(Snippets);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching user" },
      { status: 500 }
    );
  }
}
