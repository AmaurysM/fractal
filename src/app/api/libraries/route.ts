import db from "@/app/lib/db";
import { Library } from "../../../../types/types";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
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
    await db.query(`DELETE FROM "Library" WHERE id = $1`, [libraryId]);
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
