import db from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

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
    const result = await db.query('SELECT l.* FROM "Library" l LEFT JOIN "LibraryJunction" lj ON l.id = lj.childlibrary WHERE l.userid = $1 AND lj.id IS NULL ORDER BY l.libraryname ASC',[userId]
    );
    const libraries = result.rows;
    return NextResponse.json(libraries);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching user" },
      { status: 500 }
    );
  }
}
