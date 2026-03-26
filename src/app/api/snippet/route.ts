import db from "@/app/lib/db";
import { Snippet } from "../../../../types/types";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const snipId = req.headers.get("voronoi-snippet-id");

  if (!session) {
    return NextResponse.json(
      { message: "Error fetching Snippets" },
      { status: 500 },
    );
  }

  try {
    const result = await db.query(
      'SELECT s.* FROM "Snippet" s WHERE s.id = $1 ',
      [snipId],
    );

    const snippet = result.rows[0];

    if (!snippet) {
      return NextResponse.json(
        { message: "Snippet not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(JSON.parse(JSON.stringify(snippet)));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching Snippets" },
      { status: 500 },
    );
  }
}
