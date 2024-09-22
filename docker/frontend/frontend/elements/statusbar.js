class StatusBar {
    constructor(initialType, initialMessage) {
        if (sessionStorage.getItem("statusBar")) {
            let sb = JSON.parse(sessionStorage.getItem("statusBar"));
            initialType = sb.type;
            initialMessage = sb.message;
        }          

        const statusBar = document.createElement("div")
        statusBar.className = "status";
        document.body.appendChild(statusBar);
        this.statusBar = statusBar;

        const statusTxt = document.createElement("p");
        this.statusBar.appendChild(statusTxt);
        this.statusTxt = statusTxt;

        this.message(initialType, initialMessage);
    }

    message(type, message) {
        this.statusBar.className = `status ${type}`;
        if (!type) { type = "Status" }
        this.statusTxt.innerHTML = `<strong>${type}</strong> - ${message}`;
        sessionStorage.setItem("statusBar",JSON.stringify({type: type, message: message}));
      }
      
}

export { StatusBar }