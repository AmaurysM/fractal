// ExplorerProvider.tsx
"use client";
import { createContext, useContext, useState } from "react";
import { useSSE } from "../lib/useSSE";
import { Library, Snippet } from "../../../types/types";

// Define the shape of context
interface ExplorerContextType {
  libraries: Library[];
  snippets: Snippet[];
}

// Create context (no default object, enforce provider)
const ExplorerContext = createContext<ExplorerContextType | undefined>(undefined);

export const ExplorerProvider = ({ children }: { children: React.ReactNode }) => {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  useSSE<Library>({
    endpoint: "/api/libraries/subscribe",
    setState: setLibraries,
    topLevelKey: "libraries",
  });

  useSSE<Snippet>({
    endpoint: "/api/snippets/subscribe",
    setState: setSnippets,
    topLevelKey: "snippets",
  });

};

// Custom hook for consumers
export const useExplorer = () => {
  const context = useContext(ExplorerContext);
  if (!context) {
    throw new Error("useExplorer must be used within an ExplorerProvider");
  }
  return context;
};
