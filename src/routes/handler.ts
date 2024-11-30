import { completion } from "../completions.ts";
import { addCommand } from "../utils/prompts.ts";

import { KillServerButton } from "../www/kill-server-button.ts";
import { indexHtml } from "../www/indexHtml.ts";

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/db")) {
    const dbHandler = await import("./db.ts");
    return await dbHandler.handler(req);
  }

  if (req.method === "POST" && url.pathname === "/kill") {
    Deno.exit(0);
  }

  if (req.method === "GET" && url.pathname === "/") {
    //get query parameter called prompt
    const prompt = url.searchParams.get("prompt");
    addCommand("HTML", prompt);
    return new Response(await indexHtml(await completion(prompt)), {
      headers: { "Content-Type": "text/html" },
    });
  } else if (req.method === "GET" && url.pathname.startsWith("/js")) {
    // get path after js and set it to filePath variable
    const filePath = url.pathname.replace("/js", "");

    return new Response(KillServerButton, {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Hello, World!");
}
