"use client";

import { Search } from "lucide-react";

interface MobileSearchButtonProps {
    onClick: () => void;
}

export default function MobileSearchButton({ onClick }: MobileSearchButtonProps) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors cursor-pointer"
        >
            <Search className="w-5 h-5" />
        </button>
    );
}
