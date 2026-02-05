/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get initials from a string 
 */
export function getInitials(str: string, length: number = 2): string {
    if (!str) return "";
    return str.slice(0, length).toUpperCase();
}

/**
 * Copy text to clipboard and return success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Copy current page URL to clipboard
 */
export async function copyCurrentUrl(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    return copyToClipboard(window.location.href);
}

/**
 * Pluralize a word based on count
 */
export function pluralize(word: string, count: number, plural?: string): string {
    if (count === 1) return word;
    return plural || `${word}s`;
}
