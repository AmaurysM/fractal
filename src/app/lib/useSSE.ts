/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import { sseBus } from "./sseBus";

type Action = "INSERT" | "UPDATE" | "DELETE";

interface UseSSEOptions<T extends { id: string | number }> {
  endpoint: string;
  setState: React.Dispatch<React.SetStateAction<T[]>>;
  topLevelKey: string; // new
}

export function useSSE<T extends { id: string | number }>({
  endpoint,
  setState,
  topLevelKey,
}: UseSSEOptions<T>) {
  useEffect(() => {
    const handleMessage = (data: any) => {
      const items: T[] = data[topLevelKey] ?? [];
      if (data.type === "initial") {
        setState(items);
      } else if (data.type === "update") {
        const action: Action = data.action;
        const newData: T = data[topLevelKey]; 
        const oldData: T | undefined = data.old_data;

        if (!newData) return; 

        setState((prev) => {
          switch (action) {
            case "INSERT":
              return prev.some((item) => item.id === newData.id)
                ? prev
                : [...prev, newData];
            case "UPDATE":
              return prev.map((item) =>
                item.id === newData.id ? { ...item, ...newData } : item
              );
            case "DELETE":
              return prev.filter((item) => item.id !== oldData?.id);
            default:
              return prev;
          }
        });
      } else if (data.type === "heartbeat") {
        console.debug(`[SSE] Heartbeat from ${endpoint}`);
      }
    };

    const unsubscribe = sseBus.subscribe(endpoint, handleMessage);
    return unsubscribe;
  }, [endpoint, setState, topLevelKey]);
}
