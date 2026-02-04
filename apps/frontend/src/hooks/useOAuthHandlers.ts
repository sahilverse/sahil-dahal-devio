"use client";

import { GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID } from "@/lib/constants";

export function useOAuthHandlers() {
    const handleGoogleLogin = () => {
        const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        const options = {
            redirect_uri: `${window.location.origin}/auth/google/callback`,
            client_id: GOOGLE_CLIENT_ID!,
            access_type: "offline",
            response_type: "code",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ].join(" "),
        };
        const qs = new URLSearchParams(options);
        window.location.assign(`${rootUrl}?${qs.toString()}`);
    };

    const handleGithubLogin = () => {
        const rootUrl = "https://github.com/login/oauth/authorize";
        const options = {
            client_id: GITHUB_CLIENT_ID!,
            redirect_uri: `${window.location.origin}/auth/github/callback`,
            scope: "user:email",
        };
        const qs = new URLSearchParams(options);
        window.location.assign(`${rootUrl}?${qs.toString()}`);
    };

    return { handleGoogleLogin, handleGithubLogin };
}
