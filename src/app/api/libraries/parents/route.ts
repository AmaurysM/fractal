import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ message: "Missing headers" }, { status: 400 });
  }

  try {
    const result = await db.query('SELECT l.* FROM "Library" l LEFT JOIN "LibraryJunction" lj ON l."Id" = lj."ParentLibrary" WHERE l."UserId" = $1 AND lj."Id" IS NOT NULL',[userId]
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
