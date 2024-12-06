export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length < 1 || pathParts[0] !== "edit") {
    return new Response("Invalid path", { status: 400 });
  }

  const resourcePath = pathParts.slice(1).join("/");

  switch (req.method) {
    case "GET": {
      try {
        //do http GET on resource path and return it
        const response = await fetch(resourcePath);
        const body = await response.text();
        return new Response(body, { status: response.status });
      } catch (error) {
        return new Response("Failed to get resource", { status: 500 });
      }
    }

    default:
      return new Response("Method not allowed", { status: 405 });
  }
}
