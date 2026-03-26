import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
import { getServerSession } from "next-auth";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { library } = body;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Error fetching Snippets" },
      { status: 500 },
    );
  }

  if (!library) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!library.title || !library.userid) {
    return NextResponse.json({ error: "Title and userid are required" }, { status: 400 });
  }


  const UserId = session.user.id;
  try {
    const editedLibrary = await db.query(
      `UPDATE "Library"
       SET title = $1, userid = $2
       WHERE id = $3 AND "userid" = $4
       RETURNING *`,
      [library.title.trim(), library.userid, library.id, UserId]
    );

    return NextResponse.json({ editedLibrary });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update snippet" },
      { status: 500 },
    );
  }
}
