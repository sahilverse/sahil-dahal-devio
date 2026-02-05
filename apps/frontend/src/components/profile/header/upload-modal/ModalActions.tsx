"use client";
import { Trash2 } from "lucide-react";

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
    return (
        <div className="flex justify-between items-center mt-6 sm:mt-8">
            <div>
                {currentUrl && !imageSrc && onRemove && !showConfirmDelete && (
                    <button
                        onClick={onDeleteClick}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-full transition-all cursor-pointer shadow-md shadow-red-500/20 active:scale-95 translate-y-[-2px]"
                        type="button"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                )}
            </div>

            <div className="flex gap-2 sm:gap-3">
                {!showConfirmDelete && (
                    <>
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                            type="button"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onSave}
                            disabled={!imageSrc || isProcessing}
                            className="px-6 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-pressed rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                            type="button"
                        >
                            {isProcessing ? "Saving..." : "Save"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
