import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isPending?: boolean;
}

export function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isPending = false
}: ConfirmDeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90%] sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl bg-card z-[100] rounded-lg">
                <DialogHeader className="px-4 py-4 md:px-6 md:py-5 border-b bg-muted/20">
                    <DialogTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase text-destructive">
                        <AlertTriangle className="w-4 h-4" /> {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="p-4 md:p-6 space-y-3">
                    <DialogDescription className="text-sm text-muted-foreground">
                        {description}
                    </DialogDescription>
                </div>
                <DialogFooter className="px-4 py-3 md:px-6 md:py-4 border-t flex items-center gap-3 w-full">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="h-11 sm:h-9 flex-1 sm:flex-none px-4 font-bold tracking-tight text-[11px] uppercase rounded-md"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="brand"
                        onClick={onConfirm}
                        disabled={isPending}
                        className="h-11 sm:h-9 flex-1 sm:flex-none px-4 font-bold tracking-tight text-[11px] uppercase rounded-md shadow-lg shadow-brand/20"
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
