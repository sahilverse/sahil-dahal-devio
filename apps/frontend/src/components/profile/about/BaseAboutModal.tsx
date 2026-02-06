"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BaseAboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
    showFooter?: boolean;
    footerClassName?: string;
}

export default function BaseAboutModal({
    isOpen,
    onClose,
    title,
    icon,
    children,
    footer,
    className,
    showFooter = false,
    footerClassName
}: BaseAboutModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(
                "w-[95%] max-h-[90dvh] p-0 overflow-hidden border-none shadow-2xl bg-card rounded-xl flex flex-col",
                className
            )}>
                <DialogHeader className="px-4 py-4 md:px-6 md:py-5 border-b bg-muted/20 shrink-0">
                    <DialogTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase text-primary/80">
                        {icon} {title}
                    </DialogTitle>
                </DialogHeader>

                {children}

                {showFooter && (
                    <DialogFooter className={cn(
                        "px-4 py-4 border-t flex flex-row items-center justify-end gap-3 shrink-0",
                        footerClassName
                    )}>
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
