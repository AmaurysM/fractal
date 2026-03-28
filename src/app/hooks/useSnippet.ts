import { Library, Snippet } from "./../../../types/types";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import React from "react";
import { SnippetDTO } from "../api/snippets/parents/route";
import { useTabStore } from "../store/tabStore";
import { useLibraryStore } from "../store/libraryStore";
import { abort } from "process";

export const useSnippet = () => {
  const fetchParentController = new AbortController();
  const searchController = new AbortController();
  const addController = new AbortController();
  const deleteController = new AbortController();
  const editController = new AbortController();
  const editTitleController = new AbortController();
  const fetchController = new AbortController();

  const fetchParentSnippets = async (
    libraryId: string = "",
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);

    try {
      const res = await fetch(`/api/snippets/parents`, {
        method: "GET",
        headers: { "voronoi-library-id": libraryId },
        signal: fetchParentController.signal,
      });

      if (!res.ok) throw new Error("Failed to fetch snippets");

      const data: SnippetDTO[] = await res.json();
      return data;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("Fetch snippets cancelled");
      } else {
        console.error("Failed to fetch snippets", e);
      }
      return;
    } finally {
      setLoading?.(false);
    }
  };

  const searchSnippets = async (
    query: string,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    if (!query) {
      return;
    }

    setLoading?.(true);

    try {
      const res = await fetch(
        `/api/snippets/search?fileTitle=${encodeURIComponent(query)}`,
        {
          signal: searchController.signal,
        },
      );
      if (!res.ok) throw new Error("Failed to find libraries");

      const data: SnippetDTO[] = await res.json();
      return data;
    } catch (error) {
      console.error("Error finding libraries:", error);
      return;
    } finally {
      setLoading?.(false);
    }
  };

  const addSnippet = async (
    title: string,
    parentId?: string,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);

    try {
      const res = await fetch(`/api/snippets`, {
        method: "POST",
        body: JSON.stringify({
          parentId,
          title,
        }),
        signal: addController.signal,
      });

      if (!res.ok) throw new Error("Failed to add folder");

      const data: SnippetDTO = await res.json();
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

  const deleteSnippet = async (
    snippetId: string,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);

    try {
      const res = await fetch(`/api/snippets`, {
        method: "DELETE",
        body: JSON.stringify({ snippetId }),
        signal: deleteController.signal,
      });

      if (!res.ok) {
        throw new Error("Failed to delete folder");
      }

      const oldLibrary: SnippetDTO = await res.json();

      const tabStore = useTabStore.getState();
      const libraryStore = useLibraryStore.getState();

      tabStore.closeTab(snippetId);

      if (libraryStore.selectedItem === snippetId) {
        libraryStore.setSelectedItem(null);
      }
      return oldLibrary;
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

  const editSnippet = async (
    snippet: Snippet,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);

    try {
      const res = await fetch(`/api/snippets`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snippet }),
        signal: editController.signal,
      });

      if (!res.ok) throw new Error("Failed to edit snippet");

      const updatedSnippet: Snippet = await res.json();
      return updatedSnippet;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("edit snippet cancelled");
      } else {
        console.error("Failed to fetch libraries:", e);
      }
      return;
    } finally {
      setLoading?.(false);
    }
  };

  const editSnippetTitle = async (
    id: string,
    title: string,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);

    try {
      const res = await fetch(`/api/snippets/title`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
        signal: editTitleController.signal,
      });

      if (!res.ok) throw new Error("Failed to edit snippet");
      const data = await res.json();

      const updatedSnippet: Snippet = data.snippet;
      return updatedSnippet;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("Edit snippet cancelled");
      } else {
        console.error("Failed to edit snippet", e);
      }
      return;
    } finally {
      setLoading?.(false);
    }
  };

  const fetchSnippet = async (
    snipId: string,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);

    try {
      const res = await fetch(`/api/snippet`, {
        method: "GET",
        headers: { "voronoi-snippet-id": snipId },
        signal: fetchController.signal,
      });

      if (!res.ok) throw new Error("Failed to fetch snippets");

      const data: Snippet = await res.json();
      return data;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("Fetch snippets cancelled");
      } else {
        console.error("Failed to fetch snippet:", e);
      }
    } finally {
      setLoading?.(false);
    }
  };

  const moveSnippet = async (
    snippetId: string,
    newParentId: string | null,
    setLoading?: Dispatch<SetStateAction<boolean>>,
  ) => {
    setLoading?.(true);
    try {
      const res = await fetch(`/api/snippets/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snippetId, newParentId }),
      });
      if (!res.ok) throw new Error("Failed to move snippet");
      return await res.json();
    } catch (e) {
      console.error("Failed to move snippet:", e);
      return;
    } finally {
      setLoading?.(false);
    }
  };

  return {
    fetchParentSnippets,
    searchSnippets,
    addSnippet,
    deleteSnippet,
    editSnippet,
    editSnippetTitle,
    fetchSnippet,
    fetchController,
    searchController,
    addController,
    deleteController,
    editController,
    editTitleController,
    fetchParentController,
    moveSnippet,
  };
};
