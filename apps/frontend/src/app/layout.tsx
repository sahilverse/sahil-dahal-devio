import type { Metadata } from "next";
import { Providers } from "./providers";
import { cookies } from "next/headers";
import ThemeWatcher from "@/components/ThemeWatcher";
import "./globals.css";


export const metadata: Metadata = {
  title: "Devio",
  description: "An Unified IT Community Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies();
  const token = !!cookieStore.get("refresh_token")?.value;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const savedTheme = localStorage.getItem("devio-theme");
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                
                let initialTheme = "system";
                if (savedTheme === "light" || savedTheme === "dark") {
                  initialTheme = savedTheme;
                }
                
                let actualTheme = initialTheme;
                if (initialTheme === "system") {
                  actualTheme = prefersDark ? "dark" : "light";
                }
                
                document.documentElement.classList.remove("light", "dark");
                document.documentElement.classList.add(actualTheme);
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers token={token}>
          <ThemeWatcher />
          {children}
        </Providers>
      </body>
    </html>
  );
}
