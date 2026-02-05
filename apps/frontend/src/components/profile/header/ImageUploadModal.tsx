"use client";
import { useRef, useState, useCallback } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import Cropper, { Area, Point } from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";

type UploadVariant = "avatar" | "banner";

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (file: File) => void;
    currentUrl: string | null;
    variant: UploadVariant;
    title?: string;
    accept?: string;
    fallbackImageSrc?: string;
}

export default function ImageUploadModal({
    isOpen,
    onClose,
    onSave,
    variant,
    title,
    accept = "image/*",
}: ImageUploadModalProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAvatar = variant === "avatar";
    const aspect = isAvatar ? 1 : 1500 / 500;

    const onCropComplete = useCallback((_preventedArea: Area, _croppedAreaPixels: Area) => {
        setCroppedAreaPixels(_croppedAreaPixels);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setImageSrc(reader.result as string);
        });
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            setIsProcessing(true);
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedBlob) {
                const file = new File([croppedBlob], "image.webp", { type: "image/webp" });
                onSave(file);
                handleClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setImageSrc(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#1a1a1b] rounded-xl shadow-xl max-w-lg w-full p-4 sm:p-6">
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

                {/* Upload/Crop Area */}
                <div
                    className={`relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden transition-colors ${!imageSrc ? "cursor-pointer hover:border-brand-primary" : ""
                        }`}
                    style={{ height: isAvatar ? "300px" : "200px" }}
                    onClick={() => !imageSrc && fileInputRef.current?.click()}
                >
                    {!imageSrc ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                <ZoomIn className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                                Select a new image
                            </span>
                            <p className="text-xs text-gray-500 mt-2">JPEG, PNG or WebP</p>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape={isAvatar ? "round" : "rect"}
                                showGrid={false}
                            />
                        </div>
                    )}
                </div>

                {/* Controls */}
                {imageSrc && (
                    <div className="mt-4 px-2">
                        <div className="flex items-center gap-3">
                            <ZoomOut className="w-4 h-4 text-gray-400" />
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1 h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                            />
                            <ZoomIn className="w-4 h-4 text-gray-400" />
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-3 text-xs font-medium text-brand-primary hover:underline cursor-pointer"
                        >
                            Select different photo
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 sm:gap-3 mt-6 sm:mt-8">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                        type="button"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!imageSrc || isProcessing}
                        className="px-6 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-pressed rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                        type="button"
                    >
                        {isProcessing ? "Saving..." : "Save"}
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        </div>
    );
}
