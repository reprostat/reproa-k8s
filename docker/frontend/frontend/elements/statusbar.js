export class StatusBar extends HTMLDivElement {

    connectedCallback() {
        let initialType = this.getAttribute("type");
        let initialMessage = this.getAttribute("message");

        if (sessionStorage.getItem("statusBar")) {
            let sb = JSON.parse(sessionStorage.getItem("statusBar"));
            initialType = sb.type;
            initialMessage = sb.message;
        }          

        this.message(initialType, initialMessage);
    }

    setStatus(type, message) {
        this.className = `status ${type}`;
        if (!type) { type = "Status" }
        this.innerHTML = `<p><strong>${type}</strong> - ${message}</p>`;
        sessionStorage.setItem("statusBar",JSON.stringify({type: type, message: message}));
    }
      
}

customElements.define('status-bar', StatusBar, {extends: "div"});