// ExplorerProvider.tsx
"use client";
import { createContext, useContext } from "react";
import { Library, Snippet } from "../../../types/types";

interface ExplorerContextType {
  libraries: Library[];
  snippets: Snippet[];
}

const ExplorerContext = createContext<ExplorerContextType | undefined>(undefined);

export const useExplorer = () => {
  const context = useContext(ExplorerContext);
  if (!context) {
    throw new Error("useExplorer must be used within an ExplorerProvider");
  }
  return context;
};
