"use client";

import { useAppDispatch } from "@/store/hooks";
import Link from "next/link";
import { User, FileText, Settings, LogOut, Sun, Moon, Monitor } from "lucide-react";
import Image from "next/image";
import { logoutUser } from "@/slices/auth";
import { setTheme } from "@/slices/theme";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthUser } from "@/slices/auth/authTypes";

interface UserMenuProps {
    user: AuthUser;
}

export default function UserMenu({ user }: UserMenuProps) {
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700 select-none">
                    {user.avatarUrl ? (
                        <Image
                            src={user.avatarUrl}
                            alt={user.username || "User"}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary font-bold text-xs">
                            {user.username?.slice(0, 2).toUpperCase() || "U"}
                        </div>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-2 space-y-2" align="end">
                {/* Custom Profile Header */}
                <DropdownMenuItem className="p-0 focus:bg-transparent cursor-pointer" asChild>
                    <Link href={`/u/${user.username}`}>
                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full">
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                                    {user.avatarUrl ? (
                                        <Image
                                            src={user.avatarUrl}
                                            alt={user.username || "User"}
                                            width={40}
                                            height={40}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary font-bold text-sm">
                                            {user.username?.slice(0, 2).toUpperCase() || "U"}
                                        </div>
                                    )}
                                </div>
                                {/* Online Indicator */}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full"></span>
                            </div>

                            <div className="flex flex-col text-left">
                                <span className="font-semibold text-sm leading-tight text-gray-900 dark:text-gray-100">View Profile</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">u/{user.username}</span>
                            </div>
                        </div>
                    </Link>
                </DropdownMenuItem>


                <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer py-2.5" asChild>
                        <Link href="/drafts">
                            <FileText className="mr-3 h-6 w-6 text-gray-500" />
                            <span className="text-sm font-medium">Drafts</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>


                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer py-2.5">
                            <Monitor className="mr-3 h-6 w-6 text-gray-500" />
                            <span className="text-sm font-medium">Display Mode</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => dispatch(setTheme("light"))} className="cursor-pointer">
                                <Sun className="mr-2 h-4 w-4" />
                                <span className="font-medium">Light</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => dispatch(setTheme("dark"))} className="cursor-pointer">
                                <Moon className="mr-2 h-4 w-4" />
                                <span className="font-medium">Dark</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => dispatch(setTheme("system"))} className="cursor-pointer">
                                <Monitor className="mr-2 h-4 w-4" />
                                <span className="font-medium">System</span>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuGroup>


                <DropdownMenuItem className="cursor-pointer py-2.5" asChild>
                    <Link href="/settings">
                        <Settings className="mr-3 h-6 w-6 text-gray-500" />
                        <span className="text-sm font-medium">Settings</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2.5 text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300">
                    <LogOut className="mr-3 h-6 w-6" />
                    <span className="text-sm font-medium">Log out</span>
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}
