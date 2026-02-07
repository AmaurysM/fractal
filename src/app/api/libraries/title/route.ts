import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
import { getServerSession } from "next-auth";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, title } = body;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Error fetching Snippets" },
      { status: 500 },
    );
  }

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const UserId = session.user.id;
  try {
    await db.query(
      `UPDATE "Library"
       SET title = $1
       WHERE id = $2 AND "userid" = $3
       RETURNING *`,
      [title.trim(), id, UserId]
    );

    return NextResponse.json(
      { message: "Snippet updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update snippet" },
      { status: 500 },
    );
  }
}
