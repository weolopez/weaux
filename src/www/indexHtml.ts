// indexHtml.ts
export function indexHtml(text: string) {
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
    <h1>Hello, Y'll!</h1>
    <p>${text}</p>

    <kill-server-button></kill-server-button>
</body>
</html>
`;
}
