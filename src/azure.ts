import { OpenAI } from "jsr:@openai/openai";

export async function generateText(messages: Array<any>): Promise<string> {

    const azureEndpoint = Deno.env.get("AZURE_ENDPOINT")
    const apiKey = Deno.env.get("API_KEY")
    const model = Deno.env.get("API_MODEL")
    const apiVersion = Deno.env.get("API_VERSION")


    if (!azureEndpoint || !apiKey || !model || !apiVersion) {
        const client = new OpenAI({
            apiKey: Deno.env.get("OPENAI_API_KEY"), // This is the default and can be omitted
        });
        const response = await client.chat.completions.create({
            messages: messages,
            model: "gpt-4o-mini",
        });

        if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
            return response.choices[0].message.content;
        } else {
            throw new Error('Unexpected JSON format');
        }
    }

    const url = `${azureEndpoint}/openai/deployments/gpt-4o/chat/completions?api-version=${apiVersion}`;

    // const messages = [
    //     { role: 'user', content: userInput }
    // ];
    // , ...Object.entries(additionalMessages).map(([key, value]) => ({ role: key.toLowerCase(), content: value }))

    const requestBody = {
        model: model,
        messages: messages
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
    } else {
        throw new Error('Unexpected JSON format');
    }
}