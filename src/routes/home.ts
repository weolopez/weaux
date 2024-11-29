import { indexHtml } from "../www/indexHtml.ts";

export async function homeHandler(body: string): Promise<Response> {
  return new Response(indexHtml(body), {
    headers: { "Content-Type": "text/html" },
  });
}
