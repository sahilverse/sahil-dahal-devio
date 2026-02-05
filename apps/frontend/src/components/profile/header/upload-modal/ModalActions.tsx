"use client";

import { Button } from "@/components/ui/button";

interface ModalActionsProps {
    currentUrl: string | null | undefined;
    imageSrc: string | null;
    onRemove?: () => void;
    showConfirmDelete: boolean;
    isProcessing: boolean;
    onDeleteClick: () => void;
    onCancel: () => void;
    onSave: () => void;
}

export function ModalActions({
    currentUrl,
    imageSrc,
    onRemove,
    showConfirmDelete,
    isProcessing,
    onDeleteClick,
    onCancel,
    onSave,
}: ModalActionsProps) {
    const showDelete = !!currentUrl && !imageSrc && !!onRemove && !showConfirmDelete;

    return (
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
            {showDelete ? (
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onDeleteClick}
                    disabled={isProcessing}
                    className="h-9 min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase rounded-md text-destructive hover:text-destructive/80"
                >
                    Delete
                </Button>
            ) : (
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="h-9 min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase rounded-md"
                >
                    Cancel
                </Button>
            )}

            <Button
                type="button"
                variant="brand"
                onClick={onSave}
                disabled={!imageSrc || isProcessing}
                className="h-9 min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase shadow-lg shadow-brand-primary/20 transition-all rounded-md"
            >
                {isProcessing ? "Saving..." : "Save"}
            </Button>
        </div>
    );
}
