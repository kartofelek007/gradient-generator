/**
 * Generuje unikalny ciąg
 * @returns string
 */
export function uniqueKey() {
    return Math.floor(Math.random() * Date.now()).toString(16);
}
