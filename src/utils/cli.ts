import { parse } from "https://deno.land/std@0.106.0/flags/mod.ts";
import { handler } from "../routes/handler.ts";
import { completion, getCommand } from "../completions.ts";
import { listPromptNames } from "../utils/prompts.ts";
import { kv } from "./db.ts";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export const args = parse(Deno.args);
export const pidFile = "/Users/mauriciolopez/Development/deno/weaux/server.pid";

export function showHelp() {
  console.log(
    "Usage: deno run --allow-net main.ts [-h] [-s] [-k] [--list-prompts]",
  );
  console.log("Options:");
  console.log("  -h  Show help");
  console.log("  -i  Start interactive chat");
  console.log("  -s  Start the server");
  console.log("  -k  Kill the running server");
  console.log("  -r  Recap the last interaction with the assistant");
  console.log("  -c  Clear the assistant's memory");
  console.log(" --list-prompts  List available prompts");
  console.log(
    '  -p  Create a system prompt. !promptName "what does the prompt do."',
  );
}

export async function handleArgs() {
  if (args.h || args.help) {
    showHelp();
    Deno.exit(0);
  }

  if (args.s || args.start) {
    console.log("Starting server...");
    Deno.serve(handler);
    const command = new Deno.Command("open", {
      args: ["http://localhost:8000"],
    });
    await command.output();
  } else if (args.c || args.clear) {
    console.log("Clearing the assistant's memory...");
    kv.set(["MEMORY"], "");
    const memory = await kv.get(["MEMORY"]);
    console.log("Memory cleared successfully:", memory);
    Deno.exit(0);
  } else if (args.k || args.kill) {
    console.log("Killing the running server...");
    try {
      const pid = await Deno.readTextFile(pidFile);
      Deno.kill(Number(pid));
      console.log("Server killed successfully.");
      await Deno.remove(pidFile);
    } catch {
      console.log("No running server found.");
    }
    Deno.exit(0);
  } else if (args.p || args.prompt) {
    console.log("Creating a system prompt...");
    const prompt = args._[args._.length - 1];
    if (typeof prompt === "string") {
      getCommand(prompt);
    }

    console.log(`Prompt: ${prompt}`);

    Deno.exit(0);
  } else if (args["list-prompts"]) {
    console.log("Listing all available prompts...");
    const prompts: string[] = listPromptNames();
    prompts.forEach((prompt: any) => console.log(prompt));
    Deno.exit(0);
  } else if (args.i || args.interactive) {
    console.log("Starting interactive chat...");
    let chat = true;
    const rl = readline.createInterface({ input, output });
    while (chat) {
      const prompt = await rl.question("> ");
      if (prompt.startsWith("!")) {
        const command = prompt.split(" ")[0].slice(1);
        if (command === "exit") {
          chat = false;
        } else if (command === "get") {
          const key = prompt.split(" ")[1];
          const value = await kv.get([key]);
          console.log(value);
        }
      } else {
        const result = await completion("^agent " + prompt);
        console.log("< " + result);
      }
    }
    rl.close();
    Deno.exit(0);
  }

  const lastArg = args._[args._.length - 1];
  if (typeof lastArg === "string") {
    const result = await completion(lastArg);
    console.log(result);
  } else {
    console.log("Use -h for help");
    // Check if the server is running
    try {
      const response = await fetch("http://localhost:8000");
      if (response.ok) {
        console.log("Server is already running.");
      }
    } catch {
      // If the server is not running, start it in the background
      console.log("Server is not running. Starting it in the background...");
      const command = new Deno.Command("weaux", {
        args: ["-s"],
        stdout: "null",
        stderr: "null",
        stdin: "null",
      });
      const process = command.spawn();
      await Deno.writeTextFile(pidFile, process.pid.toString());
      console.log(`Server started with PID: ${process.pid}`);
    }
    Deno.exit(0);
  }
}
