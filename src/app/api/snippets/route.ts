import db from "@/app/lib/db";
import { Snippet } from "@/app/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  try {
    const result = await db.query(
      'SELECT s.* FROM "Snippet" s WHERE s."UserId" = $1 ',
      [userId]
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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, fileTitle, parentId} = body;

  try {
    const result = await db.query(
      'INSERT INTO "Snippet" ("UserId", "Title" ) VALUES ($1, $2) RETURNING "Id"',
      [userId, fileTitle]
    );
    
    const newFileId = result.rows[0].Id;

    if(parentId) {
      await db.query(
        'INSERT INTO "SnippetJunction" ("LibraryId", "SnippetId") VALUES ($1, $2)', [parentId,newFileId]
      )
    }

    return NextResponse.json({ status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add file/snippet" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const {fileId} = body;

  try {
    const result = await db.query(
      'DELETE FROM "Snippet" WHERE "Id" = ($1)',
      [fileId]
    );

    return NextResponse.json({ status: 201})
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete file/snippet" },
      { status: 500 }
    );
  }
}
