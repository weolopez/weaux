import { deleteFromDB, getDB, kv } from "../utils/db.ts";

/**
 * URL path definition
 *
 * root: /db
 * path 1: /db/<dbName>
 * path 2: /db/<dbName>/<key>
 *
 * REST opperations: GET, POST, DELETE
 * GET: /db - returns all databases
 * GET: /db/<dbName> - returns all keys in the database
 * GET: /db/<dbName>/<key> - returns the value of the key
 */
export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length < 1 || pathParts[0] !== "db") {
    return new Response("Invalid path", { status: 400 });
  }

  const dbName = pathParts[1] ? decodeURIComponent(pathParts[1]) : undefined;
  const key = pathParts[2] ? decodeURIComponent(pathParts[2]) : undefined;

  switch (req.method) {
    case "GET": {
      const value = await getDB(dbName, key);
      return value
        ? new Response(JSON.stringify(value), { status: 200 })
        : new Response("Key not found", { status: 404 });
    }
    // case 'POST':
    //     if (!key) {
    //         return new Response('Key is required for POST', { status: 400 });
    //     }
    //     const body = await req.json();
    //     await kv.set(dbName, key, body);
    //     return new Response('Key set', { status: 201 });
    case "DELETE":
      if (!dbName) {
        return new Response("Database name is required for DELETE", {
          status: 400,
        });
      }
      await deleteFromDB(dbName, key);
      return new Response("Key deleted", { status: 200 });
    default:
      return new Response("Method not allowed", { status: 405 });
  }
}
