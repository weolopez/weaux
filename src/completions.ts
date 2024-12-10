
import { getOrSetDB } from "./utils/db.ts";
import { getPrompts } from "./utils/prompts.ts";
import { generateText } from "./azure.ts";
// import * as log from "@std/log";



/**
 * getCommand - Get the command from the content string
 * defined by "^" and the following word
 * @param content
 * @returns
 */
export async function getCommand(content: string): Promise<Array<any>> {
  const matches = content.match(/\^(\w+)/g);
  if (!matches) return [];

  const p = [];
  for (const match of matches) {
    const name = match.slice(1); // Remove the "^" character
    // if (name === "agent") {
    //   p.push(await getPrompts(name) + await getOrSetMemory());
    // } else
    p.push(await getPrompts(name));
  }
  return p;
}

function messgeFactory(
  messages: { role: string; content: string; }[],
  content: string | string[] = "",
  role: "system" | "user" | "assistant" = "user",
) {
  if (Array.isArray(content)) {
    content.forEach((c) => {
      if (c !== undefined && c !== "") {
        messages.push({
          role: role,
          content: c,
        });
      }
    });
  } else if (content !== undefined && content !== "") {
    messages.push({
      role: role,
      content: content,
    });
  }
  return messages;
}

export async function completion(content: string | any) {
  const firstWord = content.split(" ")[0];
  if (typeof content !== "string") {
    return "";
  }

  let messages = messgeFactory(
    [{
      role: "user",
      content: content.replace(/\^(\w+)/, "").trim(),
    }],
  );

  let recap = await getOrSetDB("MEMORY")
  if (recap !== "") recap = "\n [MEMORY RECAP]" + recap + "[MEMORY RECAP]"
  messages = messgeFactory(
    messages,
    await getCommand(content) + recap,
    "system",
  );

  // messages = messgeFactory(
  //   messages,
  //   await getOrSetDB("RESPONSE"),
  //   "assistant",
  // );

  const result = await generateText(messages)

  const output = {
    messages: messages,
    result: result,
  };
  await getOrSetDB("RESULT", result)
  await getOrSetDB("MESSAGES", messages);
  await getOrSetDB("MEMORY", result, "[MEMORY RECAP]", "[ANSWER]");
  const answer: string = await getOrSetDB("RESPONSE", result, "[ANSWER]");

  // log.info(JSON.stringify(output, null, 2));
  if (answer.startsWith("[ANSWER")) {
    return answer.split("\n").slice(1).join("\n") || "";
  } else return answer || "";
}
