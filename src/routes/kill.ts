export async function killHandler(): Promise<Response> {
  console.log("Received kill request. Shutting down...");
  Deno.exit(0);
}
