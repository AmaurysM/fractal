import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { SnippetDTO } from "../parents/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  if (!userId) return NextResponse.json({ message: "Missing user ID" }, { status: 400 });

  const fileTitle = req.nextUrl.searchParams.get("fileTitle");
  if (!fileTitle) return NextResponse.json({ message: "Missing fileTitle" }, { status: 400 });

  try {

    const result = await db.query<SnippetDTO>(
      `SELECT s.id, s.title, sj.libraryid AS "parentId"
       FROM "Snippet" s
       LEFT JOIN "SnippetJunction" sj ON sj.snippetid = s.id
       WHERE (s.title ILIKE $1 OR s.language ILIKE $1 OR s.description ILIKE $1)
         AND s."userId" = $2`,
      [`%${fileTitle}%`, userId],
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching snippets" }, { status: 500 });
  }
}