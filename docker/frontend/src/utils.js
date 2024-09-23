export function getRandomString() {
    return Math.floor(Math.random() * Date.now()).toString(36)
}