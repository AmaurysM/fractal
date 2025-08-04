import db from "@/app/lib/db";
import { Snippet } from "@/app/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const libraryId = req.headers.get("x-library-id");

  if (!libraryId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  
  try{
    const result = await db.query('SELECT s.* FROM "SnippetJunction" sj JOIN "Snippet" s ON sj."SnippetId" = s."Id" WHERE sj."LibraryId" = $1 ', [libraryId]);
    
    const snippets: Snippet[] = result.rows;
    return NextResponse.json(snippets);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
        {message: "Error fetching Snippets"},
        {status: 500}
    )
  }
}
