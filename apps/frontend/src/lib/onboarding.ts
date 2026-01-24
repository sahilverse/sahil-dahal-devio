import type { AuthUser } from "@/slices/auth/authTypes";


export function needsOnboarding(user: AuthUser | null): boolean {
    if (!user) return false;
    return !user.username || !user.firstName || !user.lastName;
}
