import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";

// PATCH /api/libraries/move
// Body: { libraryId, newParentId: string | null }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { libraryId, newParentId } = await req.json();
  if (!libraryId) return NextResponse.json({ error: "Missing libraryId" }, { status: 400 });

  // Guard: prevent circular nesting — newParentId must not be a descendant of libraryId
  if (newParentId) {
    const cycleCheck = await db.query(
      `WITH RECURSIVE descendants AS (
        SELECT childlibrary AS id FROM "LibraryJunction" WHERE parentlibrary = $1
        UNION
        SELECT lj.childlibrary
        FROM "LibraryJunction" lj
        INNER JOIN descendants d ON lj.parentlibrary = d.id
      )
      SELECT 1 FROM descendants WHERE id = $2`,
      [libraryId, newParentId]
    );
    if (cycleCheck.rows.length > 0) {
      return NextResponse.json({ error: "Cannot move a folder into its own descendant" }, { status: 400 });
    }
  }

  try {
    await db.query('BEGIN');

    // Remove existing parent junction
    await db.query(
      `DELETE FROM "LibraryJunction" WHERE childlibrary = $1`,
      [libraryId]
    );

    // Insert new parent junction if provided
    if (newParentId) {
      await db.query(
        `INSERT INTO "LibraryJunction" (parentlibrary, childlibrary) VALUES ($1, $2)`,
        [newParentId, libraryId]
      );
    }

    await db.query('COMMIT');
    return NextResponse.json({ libraryId, newParentId });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    return NextResponse.json({ error: "Failed to move library" }, { status: 500 });
  }
}