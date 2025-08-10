import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ message: "Missing headers" }, { status: 400 });
  }

  try {
    const result = await db.query('SELECT l.* FROM "Snippet" l LEFT JOIN "SnippetJunction" lj ON l."Id" = lj."SnippetId" WHERE l."UserId" = $1 AND lj."Id" IS NULL ORDER BY l."Title" ASC',[userId]
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
