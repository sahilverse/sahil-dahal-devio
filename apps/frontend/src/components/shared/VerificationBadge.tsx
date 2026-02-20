import React from "react";
import { CompanyVerificationTier } from "@devio/zod-utils";
import { CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

interface VerificationBadgeProps {
    tier: CompanyVerificationTier;
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    className?: string;
}

const tierConfig = {
    [CompanyVerificationTier.UNVERIFIED]: {
        icon: HelpCircle,
        color: "text-muted-foreground",
        bg: "bg-muted/50",
        label: "Community Profile",
        description: "This company has not been verified yet.",
        aura: "shadow-[0_0_10px_rgba(107,114,128,0.2)]",
    },
    [CompanyVerificationTier.DOMAIN_VERIFIED]: {
        icon: ShieldCheck,
        color: "text-brand-primary",
        bg: "bg-brand-primary/10",
        label: "Verified Domain",
        description: "Ownership of the corporate domain has been verified.",
        aura: "shadow-[0_0_15px_rgba(88,101,242,0.4)] animate-pulse",
    },
    [CompanyVerificationTier.OFFICIAL]: {
        icon: CheckCircle2,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        label: "Official Entity",
        description: "This is an officially recognized organization on Dev.io.",
        aura: "shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-pulse",
    },
};

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
    tier,
    size = "md",
    showText = false,
    className,
}) => {
    const config = tierConfig[tier];
    const Icon = config.icon;

    const sizeClasses = {
        sm: "h-4 w-4 text-[10px]",
        md: "h-6 w-6 text-xs",
        lg: "h-8 w-8 text-sm",
    };

    const tooltipId = `v-badge-${tier}-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <>
            <div
                data-tooltip-id={tooltipId}
                className={cn(
                    "flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-all duration-300 cursor-help",
                    config.bg,
                    config.aura,
                    className
                )}
            >
                <Icon className={cn(sizeClasses[size], config.color)} />
                {showText && (
                    <span className={cn("font-bold uppercase tracking-tight", config.color)}>
                        {config.label}
                    </span>
                )}
            </div>
            <Tooltip
                id={tooltipId}
                place="top"
                className="z-50 !bg-card !text-foreground !border !border-border/50 !shadow-xl !opacity-100 !rounded-md !p-2"
            >
                <div className="flex flex-col">
                    <p className="font-bold text-xs mb-1">{config.label}</p>
                    <p className="text-[10px] text-muted-foreground max-w-[150px]">
                        {config.description}
                    </p>
                </div>
            </Tooltip>
        </>
    );
};
