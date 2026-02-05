"use client";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal */}
            <div className="relative w-full max-w-sm bg-card border rounded-lg shadow-lg p-5 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                            onClick={onConfirm}
                            className="flex-1 rounded-full h-8 px-4 text-xs font-bold shadow-md bg-red-500 hover:bg-red-500 cursor-pointer text-white"
                        >
                            Delete Permanently
                        </Button>
                        <Button
                            onClick={onClose}
                            className="flex-1 rounded-full h-8 px-4 text-xs font-bold shadow-md bg-gray-500 hover:bg-gray-600 cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>

            {/* Backdrop Click */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
