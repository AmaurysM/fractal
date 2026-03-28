import db from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const libId = req.headers.get("voronoi-library-id");

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    let result;

    if (libId) {
      result = await db.query(
        `SELECT s.id, s.title, sj.libraryid AS "parentId"
         FROM "Snippet" s
         INNER JOIN "SnippetJunction" sj ON s.id = sj.snippetid
         WHERE s."userId" = $1 AND sj.libraryid = $2
         ORDER BY s.title ASC`,
        [userId, libId],
      );
    } else {
      result = await db.query(
        `SELECT s.id, s.title, NULL AS "parentId"
         FROM "Snippet" s
         LEFT JOIN "SnippetJunction" sj ON s.id = sj.snippetid
         WHERE s."userId" = $1 AND sj.id IS NULL
         ORDER BY s.title ASC`,
        [userId],
      );
    }

    return NextResponse.json(result.rows as SnippetDTO[]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching snippets" },
      { status: 500 },
    );
  }
}

export type SnippetDTO = {
  id: string;
  title: string;
  parentId: string | null;
};