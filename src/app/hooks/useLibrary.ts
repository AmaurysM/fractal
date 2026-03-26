import { Library } from "./../../../types/types";
import { Dispatch, SetStateAction } from "react";
import { LibraryDTO } from "../api/libraries/parents/route";

export const useLibrary = () => {
  const fetchParentController = new AbortController();
  const searchController = new AbortController();
  const addController = new AbortController();
  const deleteController = new AbortController();
  const editTitleController = new AbortController();

  const fetchParentLibraries = async (
    libraryId: string = "",
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);
    try {
      const res = await fetch(`/api/libraries/parents`, {
        method: "GET",
        headers: { "voronoi-library-id": libraryId },
        signal: fetchParentController.signal,
      });

      if (!res.ok) throw new Error("Failed to fetch libraries");

      const data: LibraryDTO[] = await res.json();

      return data;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("Fetch libraries cancelled");
      } else {
        console.error("Failed to fetch libraries:", e);
      }
      return;
    } finally {
      setLoading?.(false);
    }
  };

  const searchLibraries = async (
    query: string,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    if (!query) {
      return;
    }

    setLoading?.(true);

    try {
      const res = await fetch(
        `/api/libraries/search?folderTitle=${encodeURIComponent(query)}`,
        {
          signal: searchController.signal
        }
      );
      if (!res.ok) throw new Error("Failed to find libraries");

      const data: LibraryDTO[] = await res.json();
      return data;
    } catch (error) {
      console.error("Error finding libraries:", error);
      return;
    } finally {
      setLoading?.(false);
    }
  };

  const addLibrary = async (
    title: string,
    parentId?: string,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);

    try {
      const res = await fetch(`/api/libraries`, {
        method: "POST",
        body: JSON.stringify({
          parentId,
          title,
        }),
        signal: addController.signal
      });

      if (!res.ok) throw new Error("Failed to add folder");

      const newLibrary: Library = await res.json();
      return newLibrary;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("Add librarie cancelled");
      } else {
        console.error("Failed to add libraries:", e);
      }
      return;
    } finally {
      setLoading?.(false);
    }
  };

  const deleteLibrary = async (
    libraryId: string,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);

    try {
      const res = await fetch(`/api/libraries`, {
        method: "DELETE",
        body: JSON.stringify({ libraryId }),
        signal: deleteController.signal
      });

      if (!res.ok) {
        throw new Error("Failed to delete folder");
      }

      const oldLibrary: Library = await res.json();
      return oldLibrary;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("Delete librarie cancelled");
      } else {
        console.error("Failed to delete libraries:", e);
      }
      return;
    } finally {
      setLoading?.(false);
    }
  };

  const editLibraryTitle = async (
    id: string,
    title: string,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);

    try {
      const res = await fetch(`/api/libraries/title`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
        signal: editTitleController.signal
      });

      if (!res.ok) throw new Error("Failed to edit folder");

      const data = await res.json();

      const updatedFolder: Library = data.library;
      return updatedFolder;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("Edit libraries cancelled");
      } else {
        console.error("Failed to Edit libraries:", e);
      }
      return;
    } finally {
      setLoading?.(false);
    }
  };

  return {
    fetchParentLibraries,
    searchLibraries,
    addLibrary,
    deleteLibrary,
    editLibraryTitle,
    fetchParentController,
    searchController,
    addController,
    deleteController,
    editTitleController
  };
};
