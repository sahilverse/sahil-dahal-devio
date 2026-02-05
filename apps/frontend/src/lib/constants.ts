export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
export const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

import { EmploymentType } from "@devio/zod-utils";

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    SELF_EMPLOYED: "Self-employed",
    FREELANCE: "Freelance",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    APPRENTICESHIP: "Apprenticeship",
    SEASONAL: "Seasonal",
};

export const EMPLOYMENT_TYPE_OPTIONS = EmploymentType.map((type) => ({
    label: EMPLOYMENT_TYPE_LABELS[type] ?? type,
    value: type,
}));