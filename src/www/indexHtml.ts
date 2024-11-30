import { dbview } from "./dbview.ts";

// const dbview = dbview()
export async function indexHtml(text: string) {
  const dv = await dbview();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <script src="/js/kill-server-button.js"></script>
  
</head>
<body>
    <h1>HTML Prompt</h1>
    <textarea id="prompt" blur="send()">Enter Text</textarea>
    <p>${text}</p>
    ${dv}
    <kill-server-button></kill-server-button>
      <script>
    let prompt = document.getElementById("prompt");
    prompt.addEventListener("blur", () => {
      window.location = "/?prompt=^HTML " + encodeURIComponent(prompt.value);
    });
    </script>
</body>
</html>
`;
}
