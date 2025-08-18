import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const libId = req.headers.get("x-library-id");

    if (!libId) {
        return NextResponse.json({message: "Midding Library Headers"}, {status: 400})
    }

    try {
        const result = await db.query('SELECT l.* FROM "Library" l WHERE l.id = $1', [libId])
        const libraries = result.rows;
        return NextResponse.json(libraries);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {message: "Error fetching libraries"}
        )
    }
}