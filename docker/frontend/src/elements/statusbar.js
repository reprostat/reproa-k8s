import { capitalise } from "../utils.js";

export class StatusBar extends HTMLElement {

    connectedCallback() {
        this.className = "container statusbar";

        let initialType = this.getAttribute("type");
        let initialMessage = this.getAttribute("message");

        if (sessionStorage.getItem("statusBar")) {
            let sb = JSON.parse(sessionStorage.getItem("statusBar"));
            initialType = sb.type;
            initialMessage = sb.message;
        }

        this.setStatus(initialType, initialMessage);
    }

    setStatus(type, message) {        
        // Parse inputs
        if (!type) { type = "Status" }
        if (type.constructor != Array) {
            type = [type];
            message = [message];
        }

        // Set content
        this.innerHTML = "";
        for (let ind = 0; ind < type.length; ind++) {
            this.innerHTML += `
                <div class="status ${type[ind]}">
                    <p><strong>${capitalise(type[ind])}</strong> - ${message[ind]}</p>
                </div>
            `;
        }
        sessionStorage.setItem("statusBar", JSON.stringify({ type: type, message: message }));
    }

}

customElements.define('status-bar', StatusBar, { extends: "section" });