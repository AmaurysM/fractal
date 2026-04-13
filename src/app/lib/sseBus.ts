// lib/sseBus.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

type Callback = (data: any) => void;

class SSEBus {
  private sources = new Map<string, EventSource>();
  private subscribers = new Map<string, Set<Callback>>();

  subscribe(endpoint: string, cb: Callback) {
    if (!this.subscribers.has(endpoint))
      this.subscribers.set(endpoint, new Set());
    this.subscribers.get(endpoint)!.add(cb);

    if (!this.sources.has(endpoint)) {
      const es = new EventSource(endpoint);

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.subscribers.get(endpoint)?.forEach((callback) => callback(data));
      };

      es.onerror = () => {
        console.error(`[SSE] Error on ${endpoint}, reconnecting...`);
        es.close();
        this.sources.delete(endpoint);

        if (this.subscribers.get(endpoint)?.size! > 0) {
          setTimeout(() => {
            this.subscribers.set(endpoint, new Set());
          }, 5000);
        }
      };

      this.sources.set(endpoint, es);
    }

    return () => {
      this.subscribers.get(endpoint)?.delete(cb);
      if (this.subscribers.get(endpoint)?.size === 0) {
        this.sources.get(endpoint)?.close();
        this.sources.delete(endpoint);
      }
    };
  }
}

export const sseBus = new SSEBus();
