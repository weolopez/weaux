// kill-server-button.ts

export const KillServerButton =
  //multi-line string
  `
// kill-server-button.js
class KillServerButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = ' <button id="kill-server-button">Kill Server</button> ';
  }

  connectedCallback() {
    this.shadowRoot.getElementById("kill-server-button").addEventListener(
      "click",
      this.killServer,
    );
  }

  disconnectedCallback() {
    this.shadowRoot.getElementById("kill-server-button").removeEventListener(
      "click",
      this.killServer,
    );
  }

  killServer() {
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
}

customElements.define("kill-server-button", KillServerButton);

`;
