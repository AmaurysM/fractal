import db from "@/app/lib/db";
import { Snippet } from "../../../../types/types";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Error fetching Snippets" },
      { status: 500 }
    );
  }

  const userId = session.user.id;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  try {
    const result = await db.query(
      'SELECT s.* FROM "Snippet" s WHERE s.userid = $1 ',
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
  const { title, parentId } = body;

  console.log("Creating a file/snippet")

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Error fetching Snippets" },
      { status: 500 }
    );
  }

  const userId = session.user.id;

  try {
    const result = await db.query(
      'INSERT INTO "Snippet" (userid, title ) VALUES ($1, $2) RETURNING id',
      [userId, title]
    );
    const newFileId = result.rows[0].id;
    if (parentId) {
      await db.query(
        'INSERT INTO "SnippetJunction" (libraryid, snippetid) VALUES ($1, $2)',
        [parentId, newFileId]
      );
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
  const { fileId } = body;

  try {
    const result = await db.query('DELETE FROM "Snippet" WHERE id = ($1)', [
      fileId,
    ]);

    return NextResponse.json({ status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete file/snippet" },
      { status: 500 }
    );
  }
}
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { Id, Language, Title, Description, Text } = body;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Error fetching Snippets" },
      { status: 500 }
    );
  }

  const UserId = session.user.id;
  try {
    const result = await db.query(
      `UPDATE "Snippet"
       SET userid = $1,
           language = $2,
           title = $3,
           description = $4,
           text = $5
       WHERE id = $6`,
      [UserId, Language, Title, Description, Text, Id]
    );

    return NextResponse.json(
      { message: "Snippet updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update snippet" },
      { status: 500 }
    );
  }
}
