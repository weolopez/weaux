import { completion } from "../completions.ts";
import { addCommand } from "../utils/prompts.ts";

import { KillServerButton } from "../www/kill-server-button.ts";
import { indexHtml } from "../www/indexHtml.ts";
import { editHTML } from "../www/edit.ts";

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/edit")) {
    return new Response(await editHTML(), {
      headers: { "Content-Type": "text/html" },
    });
  }

  if (url.pathname.startsWith("/db")) {
    const dbHandler = await import("./db.ts");
    return await dbHandler.handler(req);
  }

  // if (url.pathname.startsWith("/file")) {
  //   const fileHandler = await import("./file.ts");
  //   return await fileHandler.handler(req);
  // }
  // if (req.method === "GET" && url.pathname === "/shell") {
  //   const command = url.searchParams.get("command");
  //   if (command) {
  //     const cmd = new Deno.Command(command.split(" ")[0], {
  //       args: command.split(" ").slice(1),
  //       stdout: "piped",
  //       stderr: "piped",
  //     });

  //     const { stdout, stderr } = await cmd.output();
  //     const output = stdout;
  //     const error = stderr;

  //     if (error.length > 0) {
  //       return new Response(new TextDecoder().decode(error), {
  //         status: 500,
  //         headers: { "Content-Type": "text/plain" },
  //       });
  //     }

  //     return new Response(new TextDecoder().decode(output), {
  //       headers: { "Content-Type": "text/plain" },
  //     });
  //   } else {
  //     return new Response("No command provided", {
  //       status: 400,
  //       headers: { "Content-Type": "text/plain" },
  //     });
  //   }
  // }

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
