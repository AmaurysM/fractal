import { DefaultUser, DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

export interface User extends DefaultUser {
  id: string;              
  username?: string;
  email?: string | null;           
  image?: string | null;
}

export interface Session extends DefaultSession {
  user: {
    id: string;
    username?: string;
    email?: string | null;
    image?: string | null;
  } & DefaultSession["user"];
}

export interface JWT extends DefaultJWT {
  id: string;
  username: string;
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