import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
    }

    const fileTitle = req.nextUrl.searchParams.get("fileTitle");
    if (!fileTitle) {
      return NextResponse.json({ message: "Missing fileTitle" }, { status: 400 });
    }

    const result = await db.query(
      `
      SELECT s.* 
      FROM "Snippet" s 
      WHERE (s.title ILIKE $1 OR s.language ILIKE $1 OR s.description ILIKE $1) 
      AND s.userid = $2
      `,
      [`%${fileTitle}%`, userId]
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json({ message: "Error fetching snippets" }, { status: 500 });
  }
}
