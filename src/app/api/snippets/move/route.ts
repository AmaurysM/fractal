import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { snippetId, newParentId } = await req.json();
  if (!snippetId) return NextResponse.json({ error: "Missing snippetId" }, { status: 400 });

  try {
    await db.query('BEGIN');

    await db.query(
      `DELETE FROM "SnippetJunction" WHERE snippetid = $1`,
      [snippetId]
    );

    if (newParentId) {
      await db.query(
        `INSERT INTO "SnippetJunction" (libraryid, snippetid) VALUES ($1, $2)`,
        [newParentId, snippetId]
      );
    }

    await db.query('COMMIT');
    return NextResponse.json({ snippetId, newParentId });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    return NextResponse.json({ error: "Failed to move snippet" }, { status: 500 });
  }
}