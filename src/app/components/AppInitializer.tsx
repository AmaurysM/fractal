// app/components/AppInitializer.tsx
"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSettings } from "../hooks/useSettings";

export function AppInitializer() {
  const { data: session } = useSession();
  const { fetchSettings } = useSettings();

  useEffect(() => {
    if (!session) return;
    fetchSettings();
  }, [session]);

  return null;
}