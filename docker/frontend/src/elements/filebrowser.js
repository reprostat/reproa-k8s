
export class FileBrowser extends HTMLElement {
    constructor() {
        super();
        this.currentPath = "";
        this.filesEndpoint = this.getAttribute("filesendpoint");
        this.downloadEndpoint = this.getAttribute("downloadendpoint");
    }

    connectedCallback() {
        this.className = "container vertical";

        this.innerHTML = `
            <h2>${this.getAttribute("title")}</h2>
            <section class="file-pane">
                <!-- Breadcrumb for navigation -->
                <div class="breadcrumb"></div>

                <hr>

                <!-- File and folder list -->
                <ul></ul>
            </section>
        `

    }

    fetchFolderContents(path = this.currentPath) {
        fetch(`${this.filesEndpoint}/${path}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return false;
                } else {
                    this.#displayFiles(data);
                    return true;
                }
            });
    }

    #displayFiles(items) {
        const fileList = this.getElementsByTagName("ul")[0];
        fileList.innerHTML = "";

        items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.name;

            if (item.type === "folder") {
                li.classList.add("folder");
                li.addEventListener("click", () => this.#navigateToFolder(item.name));
            } else {
                li.classList.add("file");
                li.addEventListener("click", () => this.#downloadFile(item.name));
            }

            fileList.appendChild(li);
        });

        this.#updateBreadcrumb();
    }

    #navigateToFolder(folderName) {
        this.currentPath += (this.currentPath ? "/" : "") + folderName;
        this.fetchFolderContents(this.currentPath);
    }

    #downloadFile(fileName) {
        const downloadUrl = `${this.downloadEndpoint}/${this.currentPath ? this.currentPath + "/" : ""}${fileName}`;
        window.location.href = downloadUrl;
    }

    #updateBreadcrumb() {
        const breadcrumb = this.getElementsByClassName("breadcrumb")[0];
        breadcrumb.innerHTML = '<span class="breadcrumb-item">Path</span>';

        this.currentPath.split("/").forEach((dir, index) => {
            const span = document.createElement("span");
            span.textContent = dir || "storage";
            span.classList.add("breadcrumb-item");
            span.addEventListener("click", () => this.#navigateToPath(index));
            breadcrumb.appendChild(span);
        });
    }

    #navigateToPath(pathIndex) {
        this.currentPath = this.currentPath.split("/").slice(0, pathIndex + 1).join("/");
        this.fetchFolderContents(this.currentPath);
    }

}

customElements.define("file-browser", FileBrowser, { extends: "section" });