"use client";

import React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type EntityType = "user" | "community" | "company";

interface EntityIconProps {
    type: EntityType;
    imageUrl?: string | null;
    name: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
    className?: string;
    showStatus?: boolean;
    shape?: "circle" | "square";
}

const SIZE_MAP = {
    xs: "h-5 w-5 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-24 w-24 text-2xl",
    xxl: "h-32 w-32 text-4xl",
};

export const EntityIcon: React.FC<EntityIconProps> = ({
    type,
    imageUrl,
    name,
    size = "md",
    className,
    showStatus = false,
    shape = "circle",
}) => {
    const isImage = !!imageUrl;
    const fallbackChar = name.charAt(0).toUpperCase();

    // Fallback Backgrounds
    const fallbackStyles = {
        user: "bg-muted",
        community: "bg-brand/10 text-brand font-bold",
        company: "bg-brand-primary/10 text-brand-primary font-black uppercase",
    };

    return (
        <div className="relative inline-block shrink-0">
            <Avatar
                className={cn(
                    SIZE_MAP[size],
                    shape === "circle" ? "rounded-full" : "rounded-2xl md:rounded-3xl",
                    "border border-border/10 shadow-sm transition-transform",
                    className
                )}
            >
                <AvatarImage src={imageUrl || undefined} alt={name} className="object-cover" />
                <AvatarFallback className={cn(fallbackStyles[type], "flex items-center justify-center h-full w-full")}>
                    {type === "user" ? (
                        <Image
                            src="/devio-logo.png"
                            alt="Devio"
                            height={size === "xs" ? 12 : 24}
                            width={size === "xs" ? 12 : 24}
                            className="object-contain"
                        />
                    ) : (
                        <span>{type === "community" ? "d/" : fallbackChar}</span>
                    )}
                </AvatarFallback>
            </Avatar>
            {showStatus && type === "user" && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background shadow-sm" />
            )}
        </div>
    );
};
