class StatusBar extends HTMLDivElement {
    constructor(initialType, initialMessage) {
        super();

        if (sessionStorage.getItem("statusBar")) {
            let sb = JSON.parse(sessionStorage.getItem("statusBar"));
            initialType = sb.type;
            initialMessage = sb.message;
        }          

        this.className = "status";
        document.body.appendChild(this);

        this.statusTxt = document.createElement("p");
        this.appendChild(this.statusTxt);

        this.message(initialType, initialMessage);
    }

    message(type, message) {
        this.className = `status ${type}`;
        if (!type) { type = "Status" }
        this.statusTxt.innerHTML = `<strong>${type}</strong> - ${message}`;
        sessionStorage.setItem("statusBar",JSON.stringify({type: type, message: message}));
      }
      
}

window.customElements.define('status-bar', StatusBar, {extends: "div"})

export { StatusBar }