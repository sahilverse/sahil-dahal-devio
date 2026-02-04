"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UploadVariant = "avatar" | "banner";

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (file: File) => void;
    currentUrl: string | null;

    variant: UploadVariant;

    title?: string;
    accept?: string;

    // optional: show placeholder image in fallback
    fallbackImageSrc?: string;
}

export default function ImageUploadModal({
    isOpen,
    onClose,
    onSave,
    currentUrl,
    variant,
    title,
    accept = "image/*",
    fallbackImageSrc = "/devio-logo.png",
}: ImageUploadModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAvatar = variant === "avatar";


    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const displayUrl = previewUrl || currentUrl || undefined;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = () => {
        if (selectedFile) onSave(selectedFile);
        handleClose();
    };

    const handleClose = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
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
            <div className="relative bg-white dark:bg-[#1a1a1b] rounded-xl shadow-xl max-w-lg w-full mx-4 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {title ?? (isAvatar ? "Avatar image" : "Banner image")}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        type="button"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Upload Area */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 sm:p-6 cursor-pointer hover:border-brand-primary transition-colors"
                >
                    {isAvatar ? (
                        // AVATAR PREVIEW
                        <div className="flex flex-col items-center justify-center">
                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 mb-4">
                                <AvatarImage src={displayUrl} />
                                <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                                    <Image src={fallbackImageSrc} alt="Avatar" width={64} height={64} />
                                </AvatarFallback>
                            </Avatar>

                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 sm:px-4 py-2 rounded-full">
                                Select a new image
                            </span>
                        </div>
                    ) : (
                        // BANNER PREVIEW 
                        <div className="flex flex-col gap-3">
                            <div className="relative w-full h-28 sm:h-36 md:h-40 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {displayUrl ? (
                                    <Image
                                        src={displayUrl}
                                        alt="Banner preview"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 90vw, 600px"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                                        No banner image
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 sm:px-4 py-2 rounded-full">
                                    Select a new image
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Actions */}
                <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                        type="button"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!selectedFile}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-pressed rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        type="button"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
