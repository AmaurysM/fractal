// lib/sse.ts
import db from "@/app/lib/db";
import { NextRequest } from "next/server";

interface SSEOptions {
  userId: string | number;
  initialQuery: string;
  queryParams?: any[];
  channel: string;
  req: NextRequest;
  topLevelKey: string; 
}

export async function createSSEStream({
  userId,
  initialQuery,
  queryParams = [],
  channel,
  req,
  topLevelKey
}: SSEOptions) {
  const encoder = new TextEncoder();
  let isControllerActive = true;

  const stream = new ReadableStream({
    async start(controller) {
      let client: any;

      try {
        client = await db.connect();

        const { rows: initialRows } = await client.query(initialQuery, [
          userId,
          ...queryParams,
        ]);

        if (isControllerActive) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "initial",
                [topLevelKey]: initialRows,
              })}\n\n`
            )
          );
        }

        await client.query(`LISTEN ${channel}`);

        const handleNotification = (msg: any) => {
          if (!isControllerActive) return;

          try {
            const parsedPayload = JSON.parse(msg.payload);

            if (
              parsedPayload.userid &&
              parsedPayload.userid.toString() === userId.toString()
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "update",
                    action: parsedPayload.action,
                    [topLevelKey]: parsedPayload.data,
                    old_data: parsedPayload.old_data,
                  })}\n\n`
                )
              );
            }
          } catch (err) {
            console.error("Failed to handle notification:", err);
          }
        };

        client.on("notification", handleNotification);

        const heartbeat = setInterval(() => {
          if (!isControllerActive) {
            clearInterval(heartbeat);
            return;
          }
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "heartbeat" })}\n\n`
              )
            );
          } catch {
            clearInterval(heartbeat);
          }
        }, 30000);

        const cleanup = async () => {
          if (!isControllerActive) return;
          isControllerActive = false;

          clearInterval(heartbeat);
          try {
            await client.query(`UNLISTEN ${channel}`);
          } catch (err) {
            console.error("Failed to UNLISTEN:", err);
          }

          client.removeListener("notification", handleNotification);
          client.release();

          try {
            controller.close();
          } catch {}
        };

        req.signal.addEventListener("abort", cleanup);
        client.on("error", cleanup);
      } catch (err) {
        console.error("SSE error:", err);
      }
    },
  });

  return stream;
}
