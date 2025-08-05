import db from "@/app/lib/db";
import { Snippet } from "@/app/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  try {
    const result = await db.query(
      'SELECT s.* FROM "Snippet" s WHERE s."UserId" = $1 ',
      [userId]
    );

    const snippets: Snippet[] = result.rows;
    return NextResponse.json(snippets);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching Snippets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, language, description, title, text } = body;

  try {
    const result = await db.query(
      'INSERT INTO "Snippet" ("UserId", "Language", "Title", "Description", "Text") VALUES ($1, $2 ,$3 ,$4 ,$5 )',
      [userId, language, description, title, text]
    );

    return NextResponse.json({ staturs: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
