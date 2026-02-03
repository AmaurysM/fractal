// app/api/libraries/parent/route.ts
import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const libraryId = req.headers.get("x-library-id");

    if (!libraryId) {
      return NextResponse.json(
        { error: "Library ID is required" },
        { status: 400 }
      );
    }

    // Query the library junction to find the parent
    const result = await db.query(
      `SELECT parentlibrary FROM "LibraryJunction" WHERE childlibrary = $1 LIMIT 1`,
      [libraryId]
    );

    if (result.rows.length === 0) {
      // No parent found - this is a root level library
      return NextResponse.json({ parentId: null });
    }

    return NextResponse.json({ parentId: result.rows[0].parentlibrary });
  } catch (error) {
    console.error("Error fetching parent library:", error);
    return NextResponse.json(
      { error: "Failed to fetch parent library" },
      { status: 500 }
    );
  }
}