"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (file: File) => void;
    currentAvatarUrl: string | null;
    fallbackText: string;
}

export default function AvatarUploadModal({
    isOpen,
    onClose,
    onSave,
    currentAvatarUrl,
    fallbackText,
}: AvatarUploadModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        if (selectedFile) {
            onSave(selectedFile);
        }
        handleClose();
    };

    const handleClose = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#1a1a1b] rounded-xl shadow-xl max-w-md w-full mx-4 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Avatar image
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Upload Area */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary transition-colors"
                >
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 mb-4">
                        <AvatarImage src={previewUrl || currentAvatarUrl || undefined} />
                        <AvatarFallback className="text-2xl sm:text-3xl font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {fallbackText}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 sm:px-4 py-2 rounded-full">
                        Select a new image
                    </span>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Actions */}
                <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedFile}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-pressed rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
