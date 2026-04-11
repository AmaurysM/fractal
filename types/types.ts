import { DefaultUser, DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

// export interface User extends DefaultUser {
//   id: string;
//   username?: string;
//   first_name?: string | null;
//   last_name?: string | null;
//   email?: string | null;
//   image?: string | null;
// }

// export interface Session extends DefaultSession {
//   user: {
//     id: string;
//     username?: string;
//     first_name?: string | null;
//     last_name?: string | null;
//     email?: string | null;
//     image?: string | null;
//   } & DefaultSession["user"];
// }

// export interface JWT extends DefaultJWT {
//   id: string;
//   username: string;
//   first_name?: string | null;
//   last_name?: string | null;
//   email: string;
// }

export type Snippet = {
  id: string;
  userId: string;
  language?: string;
  title: string;
  description?: string;
  text?: string;
};

export type Library = {
  id: string;
  userid: string;
  title: string;
};

export type LibraryJunction = {
  id: string;
  parentlibrary: string;
  childlibrary: string;
};

export type SnippetJunction = {
  id: string;
  libraryid: string;
  snippetid: string;
};

export enum ExplorerItemType {
  File,
  Folder
}

export enum BadgeType {
  Java = "Java",
  Cpp = "C++",
  CSharp = "C#",
  C = "C",
  Kotlin = "Kotlin",
  JavaScript = "JavaScript",
  TypeScript = "TypeScript",
  Python = "Python",
  NodeJs = "Node.js",
}

export type Badge = {
  id: string;
  snippetId: string;
  badge: BadgeType;
};


export enum ActivityItem {
    Explorer = "Explorer",
    Search = "Search"
}

export interface UserSettings {
  id: string;
  first_name: string;
  last_name: string;
  username: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface User extends DefaultUser {
  id: string;
  email?: string | null;
  image?: string | null;
}

export interface Session extends DefaultSession {
  user: {
    id: string;
    email?: string | null;
    image?: string | null;
  } & DefaultSession["user"];
}

export interface JWT extends DefaultJWT {
  id: string;
  email: string;
}

export interface AppSettings {
  user: UserSettings;
  editor: EditorSettings;
}

export type ThemeValue = "vs-dark" | "vs-light" | "hc-black";
export type WordWrapValue = "on" | "off" | "wordWrapColumn" | "bounded";
export type LineNumbersValue = "on" | "off" | "relative" | "interval";
export type RenderWhitespaceValue = "none" | "boundary" | "selection" | "trailing" | "all";
export type MinimapSideValue = "left" | "right";
export type RenderLineHighlightValue = "none" | "gutter" | "line" | "all";
export type CursorBlinkingValue = "blink" | "smooth" | "phase" | "expand" | "solid";
export type CursorStyleValue = "line" | "block" | "underline" | "line-thin" | "block-outline" | "underline-thin";
export type ShowFoldingControlsValue = "always" | "mouseover";

export interface EditorSettings {
  id: string;

  font_family: string;
  font_size: number;
  line_height: number;
  font_ligatures: boolean;
  tab_size: number;

  insert_spaces: boolean;
  word_wrap: WordWrapValue;
  auto_closing_brackets: boolean;
  auto_closing_quotes: boolean;

  format_on_paste: boolean;
  format_on_type: boolean;

  theme: ThemeValue;
  line_numbers: LineNumbersValue;
  render_whitespace: RenderWhitespaceValue;
  show_minimap: boolean;
  minimap_side: MinimapSideValue;
  render_line_highlight: RenderLineHighlightValue;
  bracket_pair_colorization: boolean;
  indent_guides: boolean;

  smooth_scrolling: boolean;
  scroll_beyond_last_line: boolean;

  cursor_blinking: CursorBlinkingValue;
  cursor_style: CursorStyleValue;
  cursor_smooth_caret_animation: "on" | "off" | "explicit";

  folding: boolean;
  show_folding_controls: ShowFoldingControlsValue;

  auto_save_delay: number;
}

export const DEFAULT_EDITOR_SETTINGS: Omit<EditorSettings, "id"> = {
  font_family: "Cascadia Code",
  font_size: 13,
  line_height: 20,
  font_ligatures: true,
  tab_size: 2,

  insert_spaces: true,
  word_wrap: "off",
  auto_closing_brackets: true,
  auto_closing_quotes: true,

  format_on_paste: false,
  format_on_type: false,

  theme: "vs-dark",
  line_numbers: "on",
  render_whitespace: "none",
  show_minimap: false,
  minimap_side: "right",
  render_line_highlight: "all",
  bracket_pair_colorization: true,
  indent_guides: true,

  smooth_scrolling: true,
  scroll_beyond_last_line: false,

  cursor_blinking: "blink",
  cursor_style: "line",
  cursor_smooth_caret_animation: "off",

  folding: true,
  show_folding_controls: "mouseover",

  auto_save_delay: 800,
};