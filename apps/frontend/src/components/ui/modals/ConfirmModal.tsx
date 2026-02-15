import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "brand" | "destructive" | "warning";
    isPending?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "brand",
    isPending = false
}: ConfirmModalProps) {
    const Icon = variant === "destructive" || variant === "warning" ? AlertCircle : HelpCircle;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90%] sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl bg-card z-[101] rounded-lg">
                <DialogHeader className="px-4 py-4 md:px-6 md:py-5 border-b bg-muted/20">
                    <DialogTitle className={cn(
                        "text-sm font-bold flex items-center gap-2 tracking-tight uppercase",
                        variant === "destructive" ? "text-destructive" :
                            variant === "warning" ? "text-amber-700" : "text-foreground"
                    )}>
                        <Icon className="w-4 h-4" /> {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="p-4 md:p-6">
                    <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </DialogDescription>
                </div>
                <DialogFooter className="px-4 py-3 md:px-6 md:py-4 border-t flex items-center gap-3 w-full bg-muted/5">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="h-10 sm:h-9 flex-1 sm:flex-none px-6 font-bold tracking-tight text-[11px] uppercase rounded-md shadow-sm"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "warning" ? "secondary" : variant}
                        onClick={onConfirm}
                        disabled={isPending}
                        className={cn(
                            "h-10 sm:h-9 flex-1 sm:flex-none px-6 font-bold tracking-tight text-[11px] uppercase rounded-md shadow-lg",
                            variant === "brand" && "shadow-brand/20",
                            variant === "warning" && "bg-amber-700 hover:bg-amber-600 text-white shadow-amber-500/20"
                        )}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
