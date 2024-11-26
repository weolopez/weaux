// const indexHtml = await Deno.readTextFile("./index.html");
import { indexHtml } from "./indexHtml.ts";
import { KillServerButton } from "./kill-server-button.ts";

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/kill") {
    console.log("Received kill request. Shutting down...");
    Deno.exit(0);
  }

  if (req.method === "GET" && url.pathname === "/") {
    return await new Response(indexHtml, {
      headers: { "Content-Type": "text/html" },
    });
  } else if (
    req.method === "GET" && url.pathname === "/kill-server-button.js"
  ) {
    return new Response(KillServerButton, {
      headers: { "Content-Type": "application/json" },
    });
  }

  return await new Response("Hello, World!");
}
