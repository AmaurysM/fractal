import { DefaultUser, DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

// --------------------
// USER TYPE EXTENSIONS
// --------------------
export interface User extends DefaultUser {
  id: string;              // NextAuth expects lowercase "id" in most cases
  username?: string;
  email?: string | null;           // default NextAuth field, matches your "UserEmail"
  image?: string | null;
}

// --------------------
// NEXTAUTH SESSION TYPE
// --------------------
export interface Session extends DefaultSession {
  user: {
    id: string;
    username?: string;
    email?: string | null;
    image?: string | null;
  } & DefaultSession["user"];
}

// --------------------
// JWT TYPE
// --------------------
export interface JWT extends DefaultJWT {
  id: string;
  username: string;
  email: string;
}

// --------------------
// DATABASE OBJECT TYPES
// --------------------
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

export const getLanguageColor = (badgeType: BadgeType) => {
  const colors = {
    JavaScript: "text-yellow-600",
    TypeScript: "text-blue-600",
    Python: "text-green-600",
    Java: "text-red-600",
    "C++": "text-purple-600",
    "C#": "text-indigo-600",
    C: "text-gray-600",
    Kotlin: "text-orange-600",
    "Node.js": "text-red-300",
  };
  return colors[badgeType] || "text-gray-500";
};
