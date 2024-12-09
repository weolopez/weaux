import { OpenAI } from "jsr:@openai/openai";
import process from "node:process";
import { getOrSetDB } from "./utils/db.ts";
import { getPrompts } from "./utils/prompts.ts";
// import * as log from "@std/log";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

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
  messages: [OpenAI.ChatCompletionMessageParam],
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

  let messages: [OpenAI.ChatCompletionMessageParam] = messgeFactory(
    [{
      role: "user",
      content: content.replace(/\^(\w+)/, "").trim(),
    }],
  );

  messages = messgeFactory(
    messages,
    await getCommand(content) + "\n" + await getOrSetDB("MEMORY"),
    "system",
  );

  messages = messgeFactory(
    messages,
    await getOrSetDB("RESPONSE"),
    "assistant",
  );

  const result = await client.chat.completions.create({
    messages: messages,
    model: "gpt-4o-mini",
  }).then((response) => response.choices[0].message.content);

  const output = {
    messages: messages,
    result: result,
  };

  await getOrSetDB("MEMORY", result, "[MEMORY RECAP]", "[ANSWER]");
  const answer: string = await getOrSetDB("RESPONSE", result, "[ANSWER]");

  // log.info(JSON.stringify(output, null, 2));
  if (answer.startsWith("[ANSWER")) {
    return answer.split("\n").slice(1).join("\n") || "";
  } else return answer || "";

  // return await cache(
  //   "cache",
  //   content,
  //   client.chat.completions.create({
  //     messages: messages,
  //     model: "gpt-4o-mini",
  //   }),
  //   {
  //     chatId: "id",
  //     choices: "choices",
  //     content: "choices[0].message.content",
  //   },
  // ).then((response) =>
  //   response.isCached ? `^${response.content}` : response.content
  // );
}

// max_tokens: 16384,
