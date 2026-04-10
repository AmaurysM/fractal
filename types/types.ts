import { DefaultUser, DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

export interface User extends DefaultUser {
  id: string;
  username?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Session extends DefaultSession {
  user: {
    id: string;
    username?: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    image?: string | null;
  } & DefaultSession["user"];
}

export interface JWT extends DefaultJWT {
  id: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
}

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
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  image: string | null;
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

  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontLigatures: boolean;
  tabSize: number;

  insertSpaces: boolean;
  wordWrap: WordWrapValue;
  autoClosingBrackets: boolean;
  autoClosingQuotes: boolean;

  formatOnPaste: boolean;
  formatOnType: boolean;

  theme: ThemeValue;
  lineNumbers: LineNumbersValue;
  renderWhitespace: RenderWhitespaceValue;
  showMinimap: boolean;
  minimapSide: MinimapSideValue;
  renderLineHighlight: RenderLineHighlightValue;
  bracketPairColorization: boolean;
  indentGuides: boolean;

  smoothScrolling: boolean;
  scrollBeyondLastLine: boolean;

  cursorBlinking: CursorBlinkingValue;
  cursorStyle: CursorStyleValue;
  cursorSmoothCaretAnimation: boolean;

  folding: boolean;
  showFoldingControls: ShowFoldingControlsValue;

  autoSaveDelay: number;
}

export interface AppSettings {
  user: UserSettings;
  editor: EditorSettings;
}

export const DEFAULT_EDITOR_SETTINGS: Omit<EditorSettings, "id"> = {
  fontFamily: "Cascadia Code",
  fontSize: 13,
  lineHeight: 20,
  fontLigatures: true,
  tabSize: 2,

  insertSpaces: true,
  wordWrap: "off",
  autoClosingBrackets: true,
  autoClosingQuotes: true,

  formatOnPaste: false,
  formatOnType: false,

  theme: "vs-dark",
  lineNumbers: "on",
  renderWhitespace: "none",
  showMinimap: false,
  minimapSide: "right",
  renderLineHighlight: "all",
  bracketPairColorization: true,
  indentGuides: true,

  smoothScrolling: true,
  scrollBeyondLastLine: false,

  cursorBlinking: "blink",
  cursorStyle: "line",
  cursorSmoothCaretAnimation: false,

  folding: true,
  showFoldingControls: "mouseover",

  autoSaveDelay: 800,
};