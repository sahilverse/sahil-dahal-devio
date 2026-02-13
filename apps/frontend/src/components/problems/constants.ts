import { PythonLogo, JavaScriptLogo, CLogo, CPPLogo, JavaLogo } from "../code/LanguageLogos";
import React from "react";

export const PROBLEM_LANGUAGES: Record<string, { name: string; monaco: string; icon: React.ComponentType<{ size?: number }> | null }> = {
    python: {
        name: "Python3",
        monaco: "python",
        icon: PythonLogo
    },
    javascript: {
        name: "JavaScript",
        monaco: "javascript",
        icon: JavaScriptLogo
    },
    cpp: {
        name: "C++",
        monaco: "cpp",
        icon: CPPLogo
    },
    java: {
        name: "Java",
        monaco: "java",
        icon: JavaLogo
    },
    c: {
        name: "C",
        monaco: "cpp",
        icon: CLogo
    },
    csharp: {
        name: "C#",
        monaco: "csharp",
        icon: null // Placeholder
    },
    rust: {
        name: "Rust",
        monaco: "rust",
        icon: null // Placeholder
    },
    go: {
        name: "Go",
        monaco: "go",
        icon: null // Placeholder
    },
    php: {
        name: "PHP",
        monaco: "php",
        icon: null // Placeholder
    }
};
