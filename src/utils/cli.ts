import { parse } from "https://deno.land/std@0.106.0/flags/mod.ts";

export const args = parse(Deno.args);
export const pidFile = "/Users/mauriciolopez/Development/deno/weaux/server.pid";

export function showHelp() {
  console.log("Usage: deno run --allow-net main.ts [-h] [-s] [-k]");
  console.log("Options:");
  console.log("  -h  Show help");
  console.log("  -s  Start the server");
  console.log("  -k  Kill the running server");
  console.log(
    '  -p  Create a system prompt. !promptName "what does the prompt do."',
  );
}
