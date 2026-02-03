import db from "@/app/lib/db";
import { Library } from "../../../../types/types";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Error fetching Snippets" },
      { status: 500 }
    );
  }

  const userId = session.user.id;
  if (!userId) {
    return NextResponse.json({ message: "Missing headers" }, { status: 400 });
  }

  try {
    const result = await db.query('SELECT * FROM "Library" WHERE userid = $1', [
      userId,
    ]);
    const librarys: Library[] = result.rows;
    return NextResponse.json(librarys);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching user" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, parentId } = body;

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
      `INSERT INTO "Library" (userid, title) 
       VALUES ($1, $2) 
       RETURNING id`,
      [userId, title]
    );

    const newLibraryId = result.rows[0].id;
    

    if (parentId) {
      await db.query(
        `INSERT INTO "LibraryJunction" (parentlibrary, childlibrary) 
         VALUES ($1, $2)`,
        [parentId, newLibraryId]
      );
    }

    return NextResponse.json({ status: 201, libraryId: newLibraryId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { libraryId } = await req.json();

  try {
    await db.query('BEGIN');
    
    // Step 1: Find all libraries in the tree (current + all descendants)
    const libraryTreeResult = await db.query(
      `WITH RECURSIVE library_tree AS (
        -- Start with the target library
        SELECT id FROM "Library" WHERE id = $1
        UNION
        -- Recursively find children via LibraryJunction
        SELECT l.id 
        FROM "Library" l
        INNER JOIN "LibraryJunction" lj ON l.id = lj.childlibrary
        INNER JOIN library_tree lt ON lj.parentlibrary = lt.id
      )
      SELECT id FROM library_tree`,
      [libraryId]
    );

    const libraryIds = libraryTreeResult.rows.map(row => row.id);

    if (libraryIds.length === 0) {
      await db.query('ROLLBACK');
      return NextResponse.json({ error: "Library not found" }, { status: 404 });
    }

    // Step 2: Delete all snippets associated with these libraries
    await db.query(
      `DELETE FROM "Snippet"
       WHERE id IN (
         SELECT snippetid 
         FROM "SnippetJunction" 
         WHERE libraryid = ANY($1)
       )`,
      [libraryIds]
    );

    // Step 3: Delete all libraries in the tree
    // CASCADE will automatically delete LibraryJunction and SnippetJunction records
    await db.query(
      `DELETE FROM "Library" WHERE id = ANY($1)`,
      [libraryIds]
    );

    await db.query('COMMIT');
    return NextResponse.json({ status: 200 });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}