import { NextResponse } from "next/server";
import db from "@/app/lib/db";
import { User } from "@/app/lib/types";

export async function GET() {
  try {
    const result = await db.query('SELECT * FROM "Users" WHERE "Id" = $1', [
      "00000000-0000-0000-0000-000000000001",
    ]);

    const user: User | null = result.rows[0] || null;

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}
