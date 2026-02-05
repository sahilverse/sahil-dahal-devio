
export function formatDateRange(
    startDate: string,
    endDate: string | null,
    options: { isCurrent?: boolean; showMonth?: boolean; nullEndMeansPresent?: boolean } = {}
): string {
    const { isCurrent = false, showMonth = true, nullEndMeansPresent = true } = options;
    const start = new Date(startDate);

    const formatOptions: Intl.DateTimeFormatOptions = showMonth
        ? { month: "short", year: "numeric" }
        : { year: "numeric" };

    const startStr = start.toLocaleDateString("en-US", formatOptions);

    if (isCurrent || (!endDate && nullEndMeansPresent)) {
        return `${startStr} - Present`;
    }

    if (endDate) {
        const end = new Date(endDate);
        const endStr = end.toLocaleDateString("en-US", formatOptions);
        return `${startStr} - ${endStr}`;
    }

    return startStr;
}

/**
 * Calculate duration between two dates
 */
export function calculateDuration(startDate: string, endDate: string | null): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) {
        return `${years} yr ${remainingMonths} mo`;
    } else if (years > 0) {
        return `${years} yr`;
    } else if (remainingMonths > 0) {
        return `${remainingMonths} mo`;
    } else {
        return "< 1 mo";
    }
}

/**
 * Format a single date
 */
export function formatDate(
    date: string,
    options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" }
): string {
    return new Date(date).toLocaleDateString("en-US", options);
}
