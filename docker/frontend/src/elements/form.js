import { getRandomString } from "../utils.js";

class BaseForm extends HTMLElement {
    constructor () {
        super();
        this.formId = getRandomString();
    }


    connectedCallback() {
        this.className = `container ${this.getAttribute("flow")}`;        

        let htmlText = `
            <h2>${this.getAttribute("title")}</h2>
            <form enctype="multipart/form-data">
        `;

        let prompts = JSON.parse(this.getAttribute("prompts"));
        for (let inputInd=0; inputInd<prompts.length; inputInd++) {
            htmlText += `                
                    <label for="form${this.formId}Input${inputInd}">${prompts[inputInd]}</label>
                    ${this.generateInputHTML(inputInd)}
            `;
        };

        htmlText += `
            </form>
        `;

        this.innerHTML = htmlText;
    }

    /**
     * @param {number} inputInd
     */
    generateInputHTML(inputInd) {
        throw new Error("NYI");
    }

    get form() {
        return this.getElementsByTagName('form')[0];
    }

    /**
     * @param {number} inputInd
     * @param {any} inputValue
     */
    setInput(inputInd, inputValue) {
        this.form[`input${inputInd}`].value = inputValue;
    }

        /**
     * @param {number} inputInd
     */
    getInput(inputInd) {
        return this.form[`input${inputInd}`].value;
    }

    getFormData() {
        return new FormData(this.form)
    }
}

export class TextForm extends BaseForm {

    /**
     * @param {number} inputInd
     */
    generateInputHTML(inputInd) {
        return `<input id="form${this.formId}Input${inputInd}" type="text" name="input${inputInd}" required>`
    }
}

customElements.define('text-form', TextForm, {extends: "section"});