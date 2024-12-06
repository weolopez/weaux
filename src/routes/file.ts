export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length < 1 || pathParts[0] !== "file") {
    return new Response("Invalid path", { status: 400 });
  }

  const filePath = pathParts.slice(1).join("/");

  switch (req.method) {
    case "GET": {
      try {
        const fileInfo = await Deno.stat(filePath);
        if (fileInfo.isDirectory) {
          const files = [];
          for await (const dirEntry of Deno.readDir(filePath)) {
            files.push(dirEntry.name);
          }
          return new Response(JSON.stringify(files), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } else {
          const file = await Deno.readFile(filePath);
          return new Response(file, { status: 200 });
        }
      } catch (error) {
        return new Response("File or directory not found", { status: 404 });
      }
    }
    case "POST": {
      try {
        const text = await req.text();
        await Deno.writeTextFile(filePath, text);
        return new Response("File created", { status: 201 });
      } catch (error) {
        return new Response("Failed to create file", { status: 500 });
      }
    }
    case "PUT": {
      try {
        const data = await req.arrayBuffer();
        await Deno.writeFile(filePath, new Uint8Array(data), { create: true });
        return new Response("File updated", { status: 200 });
      } catch (error) {
        return new Response("Failed to update file", { status: 500 });
      }
    }
    case "DELETE": {
      try {
        await Deno.remove(filePath);
        return new Response("File deleted", { status: 200 });
      } catch (error) {
        return new Response("Failed to delete file", { status: 500 });
      }
    }
    default:
      return new Response("Method not allowed", { status: 405 });
  }
}
