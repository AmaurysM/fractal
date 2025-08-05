import db from "@/app/lib/db";
import { Library } from "@/app/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ message: "Missing headers" }, { status: 400 });
  }

  try {
    const result = await db.query(
      'SELECT * FROM "Library" WHERE "UserId" = $1',
      [userId]
    );
    const librarys: Library[] = result.rows;
    return NextResponse.json(librarys);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching user" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const  {userId, title } = body;

  try {
    const result = await db.query('INSERT INTO "Library" ("UserId", "LibraryName") VALUES ($1, $2)', [userId, title]);
    
    return NextResponse.json({staturs : 201});


  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong'}, { status: 500});
  }
}