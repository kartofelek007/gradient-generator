export function uniqueKey() {
    return Math.floor(Math.random() * Date.now()).toString(16);
}
