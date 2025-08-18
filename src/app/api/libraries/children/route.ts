// import db from "@/app/lib/db";
// import { Library, LibraryJunction } from "@/app/lib/types";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   const parentId = req.headers.get("x-parent-id");

//   if (!parentId) {
//     return NextResponse.json({ message: "Missing headers" }, { status: 400 });
//   }

//   try {
//     const result = await db.query('SELECT l.* FROM "LibraryJunction" l WHERE l."ParentLibrary" = $1',[parentId]
//     );
//     const libraryJunctions: LibraryJunction[] = result.rows;
//     const libraries: Library[] = [];
    
//     for (const item of libraryJunctions) {
//       const libraryItemResult = await db.query('SELECT * From "Library" WHERE "Id" = $1', [item.ChildLibrary]);
//       if (libraryItemResult.rows.length > 0) {
//         libraries.push(libraryItemResult.rows[0] as Library);
//       }
//     }

//     return NextResponse.json(libraries);    
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { message: "Error fetching user" },
//       { status: 500 }
//     );
//   }
// }

import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const libId = req.headers.get("x-library-id");

    if (!libId) {
        return NextResponse.json({message: "Midding Library Headers"}, {status: 400})
    }

    try {
        const result = await db.query('SELECT l.* FROM "Library" l LEFT JOIN "LibraryJunction" lj ON l.id = lj.childlibrary WHERE lj.parentlibrary = $1', [libId])
        const libraries = result.rows;
        return NextResponse.json(libraries);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {message: "Error fetching libraries"}
        )
    }
}