import db from "@/app/lib/db";
import { Snippet } from "../../../../../types/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const libraryId = req.headers.get("x-library-id");

  if (!libraryId) {
    return NextResponse.json({ error: "Missing lib id" }, { status: 400 });
  }

  try {
    const result = await db.query(
      'SELECT s.* FROM "SnippetJunction" sj JOIN "Snippet" s ON sj.snippetid = s.id WHERE sj.libraryid = $1 ',
      [libraryId]
    );

    const snippets: Snippet[] = result.rows;
    return NextResponse.json(snippets);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching Snippets" },
      { status: 500 }
    );
  }
}
