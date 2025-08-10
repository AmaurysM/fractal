export type User = {
  Id: string;
  Username: string;
  UserEmail: string;
};

export type Snippet = {
  Id: string;
  UserId: string;
  Language?: string;
  Title: string;
  Description?: string;
  Text?: string;
};

export type Library = {
  Id: string;
  UserId: string;
  LibraryName: string;
};

export type LibraryJunction = {
  Id: string;
  ParentLibrary: string;
  ChildLibrary: string;
};

export type SnippetJunction = {
  Id: string;
  LibraryId: string;
  SnippetId: string;
};

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
  Id: string;
  SnippetId: string;
  Badge: BadgeType;
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
