import { handler } from "./routes/handler.ts";
import { args, pidFile, showHelp } from "./utils/cli.ts";
import { completion, getCommand } from "./completions.ts";
import { cache } from "./utils/db.ts";

if (args.h) {
  showHelp();
  Deno.exit(0);
}

if (args.s) {
  console.log("Starting server...");
  Deno.serve(handler);
  const command = new Deno.Command("open", {
    args: ["http://localhost:8000"],
  });
  await command.output();
} else if (args.k) {
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
} else if (args.p) {
  console.log("Creating a system prompt...");
  const prompt = args._[args._.length - 1];
  if (typeof prompt === "string") {
    getCommand(prompt);
  }

  console.log(`Prompt: ${prompt}`);

  Deno.exit(0);
} else {
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
  }
  Deno.exit(0);
}
