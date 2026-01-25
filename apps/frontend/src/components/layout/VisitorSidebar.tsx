"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    TrendingUp,
    SquareTerminal,
    Compass,
    Code,
    Shield,
    Calendar,
    Briefcase,
    BookOpen,
    Menu,
    Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/slices/ui/uiSlice";

export default function VisitorSidebar() {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { isSidebarOpen } = useAppSelector((state) => state.ui);

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Popular", href: "/popular", icon: TrendingUp },
        { name: "Explore", href: "/explore", icon: Compass },
    ];

    const resources = [
        { name: "About Devio", href: "/about", icon: BookOpen },
        { name: "Code Playground", href: "/playground", icon: SquareTerminal },
        { name: "Problems", href: "/problems", icon: Code },
        { name: "Cyber Labs", href: "/labs", icon: Shield },
        { name: "Events", href: "/events", icon: Calendar },
        { name: "Jobs", href: "/jobs", icon: Briefcase },
        { name: "Learn", href: "/learn", icon: BookOpen },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => dispatch(toggleSidebar())}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 md:z-0 md:sticky md:top-[73px] flex flex-col h-screen md:h-[calc(100vh-73px)] bg-white dark:bg-[#0B0B0F] md:dark:bg-transparent border-r border-gray-200 dark:border-gray-800 transition-all duration-300 shadow-xl md:shadow-none pt-[73px] md:pt-0",
                    isSidebarOpen ? "w-64 translate-x-0 pr-4" : "w-64 -translate-x-full md:translate-x-0 md:w-0 p-4"
                )}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="hidden md:flex absolute -right-4 top-6 z-10 w-8 h-8 items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 shadow-sm cursor-pointer"
                >
                    <Menu className="w-4 h-4" />
                </button>

                {/* Top Navigation */}
                <nav className={cn(
                    "flex-1 px-3 md:py-6 overflow-y-auto transition-opacity duration-200",
                    isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible w-0 px-0 overflow-hidden"
                )}>
                    <div className="space-y-1 mb-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                    isActive(item.href)
                                        ? "bg-brand-primary/10 text-brand-primary"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                                    !isSidebarOpen && "justify-center px-0"
                                )}
                                title={!isSidebarOpen ? item.name : undefined}
                            >
                                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive(item.href) ? "text-brand-primary" : "text-gray-500")} />
                                {isSidebarOpen && <span>{item.name}</span>}
                            </Link>
                        ))}
                    </div>

                    <hr className="border-gray-200 dark:border-gray-800 my-4" />

                    {/* Resources Menu */}
                    <div className="mb-6">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Resources
                        </div>
                        <div className="space-y-1">
                            {resources.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <item.icon className="w-4 h-4 text-gray-500" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Footer Links */}
                <div className={cn("px-3 mt-8 transition-opacity duration-200 mb-3", isSidebarOpen ? "opacity-100" : "opacity-0 hidden")}>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        <Link href="#" className="hover:underline">About</Link>
                        <Link href="#" className="hover:underline">Careers</Link>
                        <Link href="#" className="hover:underline">Terms</Link>
                        <Link href="#" className="hover:underline">Privacy</Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
