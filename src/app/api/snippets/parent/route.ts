// app/api/snippets/parent/route.ts
import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const snippetId = req.headers.get("x-snippet-id");

    if (!snippetId) {
      return NextResponse.json(
        { error: "Snippet ID is required" },
        { status: 400 }
      );
    }

    // Query the snippet junction to find the parent library
    const result = await db.query(
      `SELECT libraryid FROM "SnippetJunction" WHERE id = $1 LIMIT 1`,
      [snippetId]
    );

    if (result.rows.length === 0) {
      // No parent found - this is a root level snippet
      return NextResponse.json({ parentId: null });
    }

    return NextResponse.json({ parentId: result.rows[0].libraryid });
  } catch (error) {
    console.error("Error fetching parent library for snippet:", error);
    return NextResponse.json(
      { error: "Failed to fetch parent library for snippet" },
      { status: 500 }
    );
  }
}