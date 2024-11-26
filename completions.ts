import OpenAI from "jsr:@openai/openai";
import process from "node:process";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export async function completion(content: string) {
  return await client.chat.completions.create({
    messages: [{ role: "user", content: content }],
    model: "gpt-4o",
  });
}
