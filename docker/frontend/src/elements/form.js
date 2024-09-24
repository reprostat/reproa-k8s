import { getRandomString } from "../utils.js";

class BaseForm extends HTMLElement {
    constructor () {
        super();
        this.formId = getRandomString();
        this.type = "";
    }


    connectedCallback() {
        this.className = `container ${this.getAttribute("flow")}`;        

        let htmlText = `
            <h2>${this.getAttribute("title")}</h2>
            <form enctype="multipart/form-data">
        `;

        let prompts = JSON.parse(this.getAttribute("prompts"));
        
        this.fields = JSON.parse(this.getAttribute("fields"));
        
        for (let inputInd=0; inputInd<prompts.length; inputInd++) {
            htmlText += `                
                    <label for="form${this.formId}Input${inputInd}">${prompts[inputInd]}</label>
                    ${this.generateInputHTML(inputInd, prompts.length)}
            `;
        };

        htmlText += `
            </form>
        `;

        this.innerHTML = htmlText;
    }

    /**
     * @param {number} inputInd
     * @param {number} inputN
     */
    generateInputHTML(inputInd, inputN) {
        return `<input id="form${this.formId}Input${inputInd}" type="${this.type}" name="${this.fields[inputInd]}" required>`;
    }

    get form() {
        return this.getElementsByTagName('form')[0];
    }

    /**
     * @param {number} inputInd
     * @param {any} inputValue
     */
    setField(fieldName, inputValue) {
        this.form[fieldName].value = inputValue;
    }

        /**
     * @param {number} inputInd
     */
    getField(fieldName) {
        return this.form[fieldName].value;
    }

    getFormData() {
        return new FormData(this.form)
    }
}

export class TextForm extends BaseForm {
    constructor () {
        super();
        this.type = "text";
    }
}

export class FolderForm extends BaseForm {
    constructor () {
        super();
        this.type = "file";
    }

    /**
     * @param {number} inputIn 
     * @param {number} inputN
     */
    generateInputHTML(inputInd, inputN) {
        let inputHTML = `<input id="form${this.formId}Input${inputInd}" type="${this.type}" name="${this.fields[inputInd]}" multiple webkitdirectory required>`;
        if (inputInd == inputN-1) {
            inputHTML += `
            <input type="submit" name="submitBtn" value="Submit Folder" disabled>`
        }        
        return inputHTML;
    }
}

customElements.define('text-form', TextForm, {extends: "section"});
customElements.define('folder-form', FolderForm, {extends: "section"});