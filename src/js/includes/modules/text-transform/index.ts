/**
 * Capitalizes the first letter of a string.
 * @param {string} string The input string to process.
 * @return {string} The processed string.
 */
export function capitalize(string : string) : string {
    return String(string[0]).toUpperCase() + String(string).slice(1);
}
