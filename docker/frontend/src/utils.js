/**
 * 
 * @returns {number}
 */
export function getRandomString() {
    return Math.floor(Math.random() * Date.now()).toString(36)
}

/**
 * 
 * @param {string} text 
 * @returns {string}
 */
export function capitalise(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}