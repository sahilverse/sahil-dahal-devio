"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    TrendingUp,
    Compass,
    ChevronDown,
    ChevronRight,
    Shield,
    Calendar,
    Briefcase,
    BookOpen,
    Plus,
    Users,
    Code,
    Menu,
    SquareTerminal
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/slices/ui/uiSlice";

export default function Sidebar() {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { isSidebarOpen } = useAppSelector((state) => state.ui);
    const { user } = useAppSelector((state) => state.auth);
    const [isResourcesOpen, setIsResourcesOpen] = useState(true);

    const isActive = (path: string) => pathname === path;
    const isAuthenticated = !!user;

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Popular", href: "/popular", icon: TrendingUp },
        { name: "Explore", href: "/explore", icon: Compass },
    ];

    const resources = [
        ...(isAuthenticated ? [] : [{ name: "About Devio", href: "/about", icon: BookOpen }]),
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
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => dispatch(toggleSidebar())}
                />
            )}

            {/* Placeholder for fixed sidebar on desktop */}
            <div
                className={cn(
                    "hidden lg:block shrink-0 transition-all duration-300",
                    isSidebarOpen ? "w-64" : "w-0"
                )}
            />

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 lg:top-14.25 lg:bottom-0 flex flex-col h-screen lg:h-auto bg-white dark:bg-bg-dark lg:dark:bg-transparent border-r border-gray-200 dark:border-gray-800 transition-all duration-300 shadow-xl lg:shadow-none pt-14.25 lg:pt-0",
                    isSidebarOpen ? "w-64 translate-x-0 pr-4" : "w-64 -translate-x-full lg:translate-x-0 lg:w-0 lg:px-4"
                )}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="hidden lg:flex absolute -right-4 top-6 z-10 w-8 h-8 items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 shadow-sm cursor-pointer"
                >
                    <Menu className="w-4 h-4" />
                </button>

                {/* Navigation */}
                <nav className={cn(
                    "flex-1 px-3 py-6 overflow-y-auto transition-opacity duration-200",
                    isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible w-0 px-0 overflow-hidden"
                )}>
                    {/* Main Navigation */}
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
                                <item.icon className={cn("w-5 h-5 shrink-0", isActive(item.href) ? "text-brand-primary" : "text-gray-500")} />
                                {isSidebarOpen && <span>{item.name}</span>}
                            </Link>
                        ))}
                    </div>

                    <hr className="border-gray-200 dark:border-gray-800 my-4" />

                    {/* Collapsible Resources Menu */}
                    <div className="mb-6">
                        {isSidebarOpen ? (
                            <>
                                <button
                                    onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md mb-1 transition-colors group cursor-pointer"
                                >
                                    <span>Resources</span>
                                    {isResourcesOpen ? (
                                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    )}
                                </button>

                                <AnimatePresence initial={false}>
                                    {isResourcesOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden space-y-1 ml-2"
                                        >
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
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        ) : (
                            <div className="space-y-1">
                                {resources.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex justify-center p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title={item.name}
                                    >
                                        <item.icon className="w-4 h-4 text-gray-500" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Communities - Only for authenticated users */}
                    {isAuthenticated && (
                        <>
                            <hr className="border-gray-200 dark:border-gray-800 my-4" />

                            <div className="mb-6">
                                {isSidebarOpen ? (
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Communities
                                    </div>
                                ) : null}

                                <div className="space-y-1">
                                    <button
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left",
                                            !isSidebarOpen && "justify-center px-0"
                                        )}
                                        title={!isSidebarOpen ? "Start a Community" : undefined}
                                    >
                                        <Plus className="w-5 h-5 text-gray-500" />
                                        {isSidebarOpen && "Start a Community"}
                                    </button>
                                    <button
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left",
                                            !isSidebarOpen && "justify-center px-0"
                                        )}
                                        title={!isSidebarOpen ? "Manage Communities" : undefined}
                                    >
                                        <Users className="w-5 h-5 text-gray-500" />
                                        {isSidebarOpen && "Manage Communities"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </nav>

                {/* Footer Links */}
                {isSidebarOpen && (
                    <div className="px-3 mt-8 mb-3">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                            <Link href="#" className="hover:underline">About</Link>
                            <Link href="#" className="hover:underline">Careers</Link>
                            <Link href="#" className="hover:underline">Terms</Link>
                            <Link href="#" className="hover:underline">Privacy</Link>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}