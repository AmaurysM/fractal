import db from "@/app/lib/db";
import { Snippet } from "@/app/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  try{
    const result = await db.query('SELECT s.* FROM "Snippet" s WHERE s."UserId" = $1 ', [userId]);
    
    const snippets: Snippet[] = result.rows;
    return NextResponse.json(snippets);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
        {message: "Error fetching Snippets"},
        {status: 500}
    )
  }
}
