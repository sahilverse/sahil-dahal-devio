"use client";

import Link from "next/link";
import { FileText, Settings, LogOut, Sun, Moon, Monitor, Trophy, LucideIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme } from "@/slices/theme";
import { AuthUser } from "@/slices/auth/authTypes";
import UserAvatar from "./UserAvatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DesktopUserMenuProps {
    user: AuthUser;
    onLogout: () => void;
}

interface MenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

const MENU_ITEMS: MenuItem[] = [
    { icon: FileText, label: "Drafts", href: "/drafts" },
    { icon: Trophy, label: "Achievements", href: "/achievements" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

const THEME_OPTIONS = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
] as const;

export default function DesktopUserMenu({ user, onLogout }: DesktopUserMenuProps) {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state) => state.theme);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="hidden lg:block cursor-pointer select-none">
                    <UserAvatar user={user} size="md" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-2 space-y-2 bg-card" align="end">
                <DropdownMenuItem className="p-0 focus:bg-transparent cursor-pointer" asChild>
                    <Link href={`/u/${user.username}`}>
                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors w-full">
                            <div className="relative shrink-0">
                                <UserAvatar user={user} size="md" />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-semibold text-sm leading-tight text-gray-900 dark:text-gray-100">View Profile</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">u/{user.username}</span>
                            </div>
                        </div>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuGroup>
                    {MENU_ITEMS.map(({ icon: Icon, label, href }) => (
                        <DropdownMenuItem key={label} className="cursor-pointer py-2.5" asChild>
                            <Link href={href}>
                                <Icon className="mr-3 h-6 w-6 text-gray-500" />
                                <span className="text-sm font-medium">{label}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>

                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer py-2.5">
                            <Monitor className="mr-3 h-6 w-6 text-gray-500" />
                            <span className="text-sm font-medium">Display Mode</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-card">
                            {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
                                <DropdownMenuItem
                                    key={value}
                                    onClick={() => dispatch(setTheme(value))}
                                    className={`cursor-pointer ${theme === value ? "text-brand-primary bg-muted/50" : ""}`}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    <span className="font-medium">{label}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem onClick={onLogout} className="cursor-pointer py-2.5 text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300">
                    <LogOut className="mr-3 h-6 w-6" />
                    <span className="text-sm font-medium">Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
