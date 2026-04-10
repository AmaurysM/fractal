import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/authOptions";
import { getServerSession } from "next-auth";
import { DEFAULT_EDITOR_SETTINGS } from "../../../../types/types";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  if (!userId) {
    return NextResponse.json({ message: "Missing User" }, { status: 400 });
  }

  try {
    await db.query(
      `INSERT INTO public."User" (id, email)
   VALUES ($1, $2)
   ON CONFLICT (id) DO NOTHING`,
      [userId, session.user.email],
    );

    const [userResult, editorResult] = await Promise.all([
      db.query(`SELECT * FROM "user_settings" WHERE id = $1`, [userId]),
      db.query(`SELECT * FROM "editor_settings" WHERE id = $1`, [userId]),
    ]);

    if (userResult.rows.length === 0) {
      await db.query(
        `INSERT INTO "user_settings" (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`,
        [userId],
      );
    }

    if (editorResult.rows.length === 0) {
      const d = DEFAULT_EDITOR_SETTINGS;
      await db.query(
        `INSERT INTO "editor_settings" (
          id, font_family, font_size, line_height, font_ligatures,
          tab_size, insert_spaces, word_wrap, auto_closing_brackets,
          auto_closing_quotes, format_on_paste, format_on_type, theme,
          line_numbers, render_whitespace, show_minimap, minimap_side,
          render_line_highlight, bracket_pair_colorization, indent_guides,
          smooth_scrolling, cursor_blinking, cursor_style, cursor_smooth_caret,
          scroll_beyond_last_line, folding, show_folding_controls, auto_save_delay
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
          $18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
        ) ON CONFLICT (id) DO NOTHING`,
        [
          userId,
          d.fontFamily,
          d.fontSize,
          d.lineHeight,
          d.fontLigatures,
          d.tabSize,
          d.insertSpaces,
          d.wordWrap,
          d.autoClosingBrackets,
          d.autoClosingQuotes,
          d.formatOnPaste,
          d.formatOnType,
          d.theme,
          d.lineNumbers,
          d.renderWhitespace,
          d.showMinimap,
          d.minimapSide,
          d.renderLineHighlight,
          d.bracketPairColorization,
          d.indentGuides,
          d.smoothScrolling,
          d.cursorBlinking,
          d.cursorStyle,
          d.cursorSmoothCaretAnimation,
          d.scrollBeyondLastLine,
          d.folding,
          d.showFoldingControls,
          d.autoSaveDelay,
        ],
      );
    }

    // Re-fetch after potential inserts
    const [u, e] = await Promise.all([
      db.query(`SELECT * FROM "user_settings" WHERE id = $1`, [userId]),
      db.query(`SELECT * FROM "editor_settings" WHERE id = $1`, [userId]),
    ]);

    return NextResponse.json({
      user: u.rows[0] ?? null,
      editor: e.rows[0] ?? null,
    });
  } catch (error) {
    console.error("GET /api/settings:", error);
    return NextResponse.json(
      { message: "Error fetching settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  if (!userId) {
    return NextResponse.json({ message: "Missing User" }, { status: 400 });
  }

  const body = await req.json();
  const { table, patch } = body as {
    table: "user" | "editor";
    patch: Record<string, unknown>;
  };

  if (!table || !patch || typeof patch !== "object") {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  try {
    if (table === "user") {
      const { firstName, lastName, username } = patch as {
        firstName?: string;
        lastName?: string;
        username?: string;
      };

      await db.query(
        `INSERT INTO "user_settings" (id, first_name, last_name, username)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           first_name = EXCLUDED.first_name,
           last_name  = EXCLUDED.last_name,
           username   = EXCLUDED.username,
           updated_at = now()`,
        [userId, firstName ?? "", lastName ?? "", username ?? ""],
      );

      const result = await db.query(
        `SELECT * FROM "user_settings" WHERE id = $1`,
        [userId],
      );
      return NextResponse.json({ user: result.rows[0] });
    }

    if (table === "editor") {
      const e = patch as Record<string, unknown>;

      await db.query(
        `INSERT INTO "editor_settings" (
          id, font_family, font_size, line_height, font_ligatures,
          tab_size, insert_spaces, word_wrap, auto_closing_brackets,
          auto_closing_quotes, format_on_paste, format_on_type, theme,
          line_numbers, render_whitespace, show_minimap, minimap_side,
          render_line_highlight, bracket_pair_colorization, indent_guides,
          smooth_scrolling, cursor_blinking, cursor_style, cursor_smooth_caret,
          scroll_beyond_last_line, folding, show_folding_controls, auto_save_delay
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
          $18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
        )
        ON CONFLICT (id) DO UPDATE SET
          font_family               = EXCLUDED.font_family,
          font_size                 = EXCLUDED.font_size,
          line_height               = EXCLUDED.line_height,
          font_ligatures            = EXCLUDED.font_ligatures,
          tab_size                  = EXCLUDED.tab_size,
          insert_spaces             = EXCLUDED.insert_spaces,
          word_wrap                 = EXCLUDED.word_wrap,
          auto_closing_brackets     = EXCLUDED.auto_closing_brackets,
          auto_closing_quotes       = EXCLUDED.auto_closing_quotes,
          format_on_paste           = EXCLUDED.format_on_paste,
          format_on_type            = EXCLUDED.format_on_type,
          theme                     = EXCLUDED.theme,
          line_numbers              = EXCLUDED.line_numbers,
          render_whitespace         = EXCLUDED.render_whitespace,
          show_minimap              = EXCLUDED.show_minimap,
          minimap_side              = EXCLUDED.minimap_side,
          render_line_highlight     = EXCLUDED.render_line_highlight,
          bracket_pair_colorization = EXCLUDED.bracket_pair_colorization,
          indent_guides             = EXCLUDED.indent_guides,
          smooth_scrolling          = EXCLUDED.smooth_scrolling,
          cursor_blinking           = EXCLUDED.cursor_blinking,
          cursor_style              = EXCLUDED.cursor_style,
          cursor_smooth_caret       = EXCLUDED.cursor_smooth_caret,
          scroll_beyond_last_line   = EXCLUDED.scroll_beyond_last_line,
          folding                   = EXCLUDED.folding,
          show_folding_controls     = EXCLUDED.show_folding_controls,
          auto_save_delay           = EXCLUDED.auto_save_delay,
          updated_at                = now()`,
        [
          userId,
          e.fontFamily,
          e.fontSize,
          e.lineHeight,
          e.fontLigatures,
          e.tabSize,
          e.insertSpaces,
          e.wordWrap,
          e.autoClosingBrackets,
          e.autoClosingQuotes,
          e.formatOnPaste,
          e.formatOnType,
          e.theme,
          e.lineNumbers,
          e.renderWhitespace,
          e.showMinimap,
          e.minimapSide,
          e.renderLineHighlight,
          e.bracketPairColorization,
          e.indentGuides,
          e.smoothScrolling,
          e.cursorBlinking,
          e.cursorStyle,
          e.cursorSmoothCaretAnimation,
          e.scrollBeyondLastLine,
          e.folding,
          e.showFoldingControls,
          e.autoSaveDelay,
        ],
      );

      const result = await db.query(
        `SELECT * FROM "editor_settings" WHERE id = $1`,
        [userId],
      );
      return NextResponse.json({ editor: result.rows[0] });
    }

    return NextResponse.json({ message: "Unknown table" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/settings:", error);
    return NextResponse.json(
      { message: "Error saving settings" },
      { status: 500 },
    );
  }
}
