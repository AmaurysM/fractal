// // ─── User Settings ───────────────────────────────────────────────────────────

// export type UserSettings = {
//   id: string;           // uuid, FK → auth.users(id)
//   firstName: string;
//   lastName: string;
//   username: string;
//   email: string;        // read-only mirror from auth
//   createdAt: string;    // ISO string, read-only
// };

// // ─── Editor Settings ─────────────────────────────────────────────────────────

// export type FontFamily =
//   | "cascadia-code"
//   | "fira-code"
//   | "jetbrains-mono"
//   | "source-code-pro"
//   | "inconsolata"
//   | "commit-mono"
//   | "monolisa";

// export type FontSize = 11 | 12 | 13 | 14 | 15 | 16 | 18 | 20;
// export type LineHeight = 16 | 18 | 20 | 22 | 24 | 26 | 28;
// export type TabSize = 2 | 4 | 8;
// export type CursorStyle = "line" | "block" | "underline" | "line-thin" | "block-outline" | "underline-thin";
// export type WordWrap = "off" | "on" | "wordWrapColumn" | "bounded";
// export type EditorTheme = "vs-dark" | "vs-light" | "hc-black" | "hc-light";
// export type LineNumbers = "on" | "off" | "relative" | "interval";
// export type RenderWhitespace = "none" | "boundary" | "selection" | "trailing" | "all";

// export type EditorSettings = {
//   id: string;                         // uuid, FK → auth.users(id)
//   // Typography
//   fontFamily: FontFamily;
//   fontSize: FontSize;
//   lineHeight: LineHeight;
//   fontLigatures: boolean;
//   // Indentation
//   tabSize: TabSize;
//   insertSpaces: boolean;              // tabs vs spaces
//   // Behavior
//   wordWrap: WordWrap;
//   autoClosingBrackets: boolean;
//   autoClosingQuotes: boolean;
//   formatOnPaste: boolean;
//   formatOnType: boolean;
//   // Appearance
//   theme: EditorTheme;
//   lineNumbers: LineNumbers;
//   renderWhitespace: RenderWhitespace;
//   showMinimap: boolean;
//   minimapSide: "left" | "right";
//   renderLineHighlight: "none" | "gutter" | "line" | "all";
//   bracketPairColorization: boolean;
//   indentGuides: boolean;
//   // Scroll & layout
//   smoothScrolling: boolean;
//   cursorBlinking: "blink" | "smooth" | "phase" | "expand" | "solid";
//   cursorStyle: CursorStyle;
//   cursorSmoothCaretAnimation: "off" | "explicit" | "on";
//   scrollBeyondLastLine: boolean;
//   folding: boolean;
//   showFoldingControls: "always" | "mouseover";
//   // Saving
//   autoSaveDelay: number;              // ms, 0 = off
// };

// // ─── Combined settings payload ────────────────────────────────────────────────

// export type AppSettings = {
//   user: UserSettings;
//   editor: EditorSettings;
// };

// // ─── Defaults ────────────────────────────────────────────────────────────────

// export const DEFAULT_EDITOR_SETTINGS: Omit<EditorSettings, "id"> = {
//   fontFamily: "cascadia-code",
//   fontSize: 13,
//   lineHeight: 20,
//   fontLigatures: true,
//   tabSize: 2,
//   insertSpaces: true,
//   wordWrap: "off",
//   autoClosingBrackets: true,
//   autoClosingQuotes: true,
//   formatOnPaste: false,
//   formatOnType: false,
//   theme: "vs-dark",
//   lineNumbers: "on",
//   renderWhitespace: "none",
//   showMinimap: false,
//   minimapSide: "right",
//   renderLineHighlight: "all",
//   bracketPairColorization: true,
//   indentGuides: true,
//   smoothScrolling: true,
//   cursorBlinking: "blink",
//   cursorStyle: "line",
//   cursorSmoothCaretAnimation: "off",
//   scrollBeyondLastLine: false,
//   folding: true,
//   showFoldingControls: "always",
//   autoSaveDelay: 800,
// };