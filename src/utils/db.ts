// deno-lint-ignore-file no-explicit-any

/**
 * Caches an object with a specified key. If the object is already cached, it retrieves the cached value.
 * Optionally, it can extract specific fields from the object before caching.
 *
 * @param cacheKey - The key to identify the cached object.
 * @param cacheObject - The object to be cached. If not provided, the function will attempt to retrieve the cached value.
 * @param jsonKeys - An optional mapping of keys to extract specific fields from the cacheObject before caching.
 * @returns The cached object or the extracted fields from the object.
 */
export const kv = await Deno.openKv("/tmp/.weaux.db");

// if (key) {
//   const value = await kv.get([db, key]);
//   return value?.value;
// }
// const entries = [];
// for await (const entry of kv.list({ prefix: [db] })) {
//   entries.push(entry.value);
// }
// return entries;
export async function getDB(
  db?: string,
  key?: string,
  filter?: string | null,
): Promise<any> {
  let returnObject = [];
  if (key && db) {
    const value = await kv.get([db, key]);
    returnObject = value ? [value] : [];
  } else {
    const entries = [];
    for await (const entry of kv.list({ prefix: [] })) {
      entries.push(extractFields(entry, { db: "key[0]", key: "key[1]" }));
    }
    if (db) {
      returnObject = entries.filter((entry) => entry.db === db);
    } else {
      returnObject = entries;
    }
  }
  if (filter) {
    return extractFields(returnObject[0], filter);
  }
  return returnObject;
}

// const kv = await Deno.openKv();
// await kv.delete(["preferences", "alan"]);
export async function deleteFromDB(
  cacheName: string,
  cacheKey?: string,
): Promise<void> {
  const delArray = [];
  delArray.push(cacheName);
  if (cacheKey) {
    const prompt = cacheKey.replace(/\^(\w+)/, "").trim();
    delArray.push(prompt);
  }
  await kv.delete(delArray);
}

// export function getDb(name: string) {
//   return kv.get([name]);
// }

function getValueByPath(object: any, path: string) {
  return path.split(".").reduce((current, key) => {
    if (key.includes("[") && key.includes("]")) {
      const [property, index] = key.split(/[\[\]]/).filter(Boolean);
      return current ? current[property][parseInt(index, 10)] : undefined;
    }
    return current ? current[key] : undefined;
  }, object);
}
function extractFields(jsonObject: any, keyMappings: any) {
  const extractedFields: { [key: string]: any } = {};
  for (const key in keyMappings) {
    if (jsonObject && jsonObject.hasOwnProperty(keyMappings[key])) {
      extractedFields[key] = jsonObject[keyMappings[key]];
    } else if (
      keyMappings[key].includes(".") || keyMappings[key].includes("[")
    ) {
      extractedFields[key] = getValueByPath(jsonObject, keyMappings[key]);
    }
  }
  return extractedFields;
}

export async function cache(
  cacheName: string,
  cacheKey: string,
  cacheObject?: Promise<any>,
  jsonKeys?: any,
) {
  const prompt = cacheKey.replace(/\^\w+\s*/g, "").trim();

  //if cacheKey starts with '^' then ignore the cache
  if (!cacheKey.startsWith("^")) {
    const cache = await kv.get<any>([cacheName, prompt]);
    if (cache.value) {
      cache.value["isCached"] = true;
      return cache.value;
    } else if (cacheObject === undefined) {
      return undefined;
    }
  }
  const newCacheObject = jsonKeys
    ? extractFields(await cacheObject, jsonKeys)
    : await cacheObject;

  await kv.set(["cache", prompt], newCacheObject);
  return newCacheObject;
}
