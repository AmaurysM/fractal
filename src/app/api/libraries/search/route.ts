import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  if (!userId) return NextResponse.json({ message: "Missing user ID" }, { status: 400 });

  const libTitle = req.nextUrl.searchParams.get("folderTitle");
  if (!libTitle) return NextResponse.json({ message: "Missing folderTitle" }, { status: 400 });

  try {
    const result = await db.query(
      'SELECT l.* FROM "Library" l WHERE l.libraryname ILIKE $1 AND l.userid = $2',
      [`%${libTitle}%`, userId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching libraries" }, { status: 500 });
  }
}

