import { OpenAI } from "jsr:@openai/openai";
import process from "node:process";
import { cache } from "./utils/db.ts";
import { getPrompts, prompts } from "./utils/prompts.ts";

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
/*
 {
  id: "chatcmpl-AYBeZri4U9tvrbnF7FAFrYPQ9hI1s",
  object: "chat.completion",
  created: 1732711311,
  model: "gpt-4o-2024-08-06",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content: "Why don’t skeletons fight each other?\n\nThey don’t have the guts.",
        refusal: null
      },
      logprobs: null,
      finish_reason: "stop"
    }
  ],
  usage: {
    prompt_tokens: 11,
    completion_tokens: 16,
    total_tokens: 27,
    prompt_tokens_details: { cached_tokens: 0, audio_tokens: 0 },
    completion_tokens_details: {
      reasoning_tokens: 0,
      audio_tokens: 0,
      accepted_prediction_tokens: 0,
      rejected_prediction_tokens: 0
    }
  },
  system_fingerprint: "fp_831e067d82"
}

 * Example of keys
 *
 * [ { "chat.completion": "id" },
 *  { "choices": "choices" },
 *  { "content": "choices[0].message.content" },
 *  ]
 */

export async function completion(content: string | any) {
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
    await getCommand(content),
    "system",
  );

  return await cache(
    "cache",
    content,
    client.chat.completions.create({
      messages: messages,
      model: "gpt-4o",
    }),
    {
      chatId: "id",
      choices: "choices",
      content: "choices[0].message.content",
    },
  ).then((response) =>
    response.isCached ? `^${response.content}` : response.content
  );
}
