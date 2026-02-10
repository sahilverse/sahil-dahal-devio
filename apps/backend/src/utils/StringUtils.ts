/**
 * Normalizes text content by removing Windows-style carriage returns (\r)
 * and trimming trailing whitespace.
 * 
 * @param text The raw string to normalize
 * @returns Normalized string with Unix-style line endings and no trailing whitespace
 */
export function normalizeContent(text: string): string {
    if (!text) return "";
    return text
        .replace(/\\n/g, "\n") // Unescape literal \n strings
        .replace(/\\r/g, "")   // Remove literal \r strings
        .replace(/\r/g, "")    // Remove actual \r bytes
        .trimEnd();
}
