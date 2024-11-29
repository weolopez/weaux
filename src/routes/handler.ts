import { homeHandler } from "./home.ts";
import { killHandler } from "./kill.ts";
import { completion } from "../completions.ts";
import { addCommand } from "../utils/prompts.ts";

import { KillServerButton } from "../www/kill-server-button.ts";

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/kill") {
    return await killHandler();
  }

  if (req.method === "GET" && url.pathname === "/") {
    //get query parameter called prompt
    const prompt = url.searchParams.get("prompt");
    addCommand("HTML", prompt);
    return await homeHandler(await completion(prompt));
  } else if (req.method === "GET" && url.pathname.startsWith("/js")) {
    // get path after js and set it to filePath variable
    const filePath = url.pathname.replace("/js", "");

    return new Response(KillServerButton, {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Hello, World!");
}
