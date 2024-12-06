import { dbview } from "./dbview.ts";

// const dbview = dbview()
export async function indexHtml(text: string) {
  return /*html*/ `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="/js/kill-server-button.js"></script>
    <style>
        #dbview-container {
            margin-top: 1rem;
        }
        #toggle-dbview-button {
            background-color: black;
            color: #fff;
            border: none;
            padding: 0.5rem 1rem;
            cursor: pointer;
        } 
        button {
            background-color: black;
            color: #fff;
            border: none;
            padding: 0.5rem 1rem;
            cursor: pointer;
        } 
        #prompt {
            margin-top: 1rem;
            width: 100%;
        }
        .blue {
            background-color: blue;
        }
    </style>
</head>
<body>
    <button id="toggle-dbview-button">Toggle DB View</button>
    <button id="save-button" class="blue">Save</button>
    <button id="kill-server-button">Kill Server</button>
    <textarea id="prompt" blur="send()">Enter Text</textarea>
    <hr>

    <p id="post-body">${text}</p>
    <div id="dbview-container" style="display: none;">
        <hr>
        ${await dbview()}
    </div>
    <script>
        document.getElementById("prompt").addEventListener("blur", () => {
            window.location = "/?prompt=^HTML " + encodeURIComponent(document.getElementById("prompt").value);
        });

        document.getElementById("toggle-dbview-button").addEventListener("click", () => {
            const dbviewContainer = document.getElementById("dbview-container");
            dbviewContainer.style.display = dbviewContainer.style.display === "none" ? "block" : "none";
        });
        document.getElementById("save-button").addEventListener("click", () => {
          const name = prompt("Please enter a name for the prompt");
          if (!name) {
            return;
          }
          let text = document.getElementById("post-body");
          const POST_BODY = {
            text: text.innerHTML
          };  
          fetch("/db/doc/"+name, { 
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(POST_BODY)
          })
          .then((response) => {
              if (response.ok) {
                  alert("Saved successfully.");
              } else {
                  alert("Failed to save.");
              }
          })
          .catch((error) => {
              console.error("Error:", error);
              alert("An error occurred.");
          });
        });
        document.getElementById("kill-server-button").addEventListener("click", killServer);

        function killServer() {
          fetch("/kill", { method: "POST" })
            .then((response) => {
              if (response.ok) {
                alert("Server is shutting down.");
              } else {
                alert("Failed to kill the server.");
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              alert("An error occurred.");
            });
        }
    </script>
</body>
</html>
`;
}
