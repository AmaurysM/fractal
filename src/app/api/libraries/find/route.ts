import db from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return NextResponse.json(
        { message: "Error fetching Snippets" },
        { status: 500 }
        );
    }

    const libId = req.headers.get("fractal-library-id");

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