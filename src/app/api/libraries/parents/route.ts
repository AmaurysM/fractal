import db from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const libId = req.headers.get("voronoi-library-id");

  if (!session) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  const userId = session.user.id;

  if (!userId) {
    return NextResponse.json({ message: "Not Signed in" }, { status: 400 });
  }

  try {
    let result;

    if (libId) {
      result = await db.query(
        `SELECT l.id, l.title, lj.parentlibrary AS "parentId"
         FROM "Library" l
         INNER JOIN "LibraryJunction" lj ON l.id = lj.childlibrary
         WHERE lj.parentlibrary = $1 AND l.userid = $2
         ORDER BY l.title ASC`,
        [libId, userId],
      );
    } else {
      result = await db.query(
        `SELECT l.id, l.title, NULL AS "parentId"
         FROM "Library" l
         LEFT JOIN "LibraryJunction" lj ON l.id = lj.childlibrary
         WHERE l.userid = $1 AND lj.id IS NULL
         ORDER BY l.title ASC`,
        [userId],
      );
    }

    return NextResponse.json(result.rows as LibraryDTO[]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching libraries" },
      { status: 500 },
    );
  }
}

export type LibraryDTO = {
  id: string;
  title: string;
  parentId: string | null;
};