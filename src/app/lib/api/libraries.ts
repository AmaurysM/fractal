import { Library } from "../../../../types/types";

export async function createFolder(
  userId: string,
  title: string,
  parentId?: string
) {
  const res = await fetch(`/api/libraries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      parentId: parentId,
      title: title,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to add folder/library");
  }
  return res.json() as Promise<Library>;
}

export async function deleteFolder(libraryId: string) {
  const res = await fetch(`/api/libraries`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ libraryId }),
  });
  if (!res.ok) throw new Error("Failed to delete library");
  return res.json();
}

export async function fetchFolders(userId: string) {
  const res = await fetch(`/api/libraries/parents`, {
    method: "GET",
    headers: {
      "x-user-id": userId,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch libraries");
  return res.json() as Promise<Library[]>;
}

export async function fetchFolderById(libraryId: string) {
  const res = await fetch(`/api/libraries`, {
    method: "GET",
    headers: {
        "x-library-id": libraryId,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch library");
  return res.json() as Promise<Library>;
}

export async function findFolder(title: string) {
  const res = await fetch(
    `/api/libraries/search?folderTitle=${encodeURIComponent(title)}`
  );
  if (!res.ok) throw new Error("Failed to find libraries");

  //const data: Library[] = await res.json();
  return res.json() as Promise<Library[]>;
}
