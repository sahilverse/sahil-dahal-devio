"use client";
import { ZoomIn } from "lucide-react";
import Cropper, { Area, Point } from "react-easy-crop";

interface ImagePreviewAreaProps {
    isAvatar: boolean;
    imageSrc: string | null;
    currentUrl: string | null | undefined;
    showConfirmDelete: boolean;
    onFileClick: () => void;
    crop: Point;
    zoom: number;
    aspect: number;
    onCropChange: (crop: Point) => void;
    onCropComplete: (area: Area, pixels: Area) => void;
    onZoomChange: (zoom: number) => void;
}

export function ImagePreviewArea({
    isAvatar,
    imageSrc,
    currentUrl,
    showConfirmDelete,
    onFileClick,
    crop,
    zoom,
    aspect,
    onCropChange,
    onCropComplete,
    onZoomChange,
}: ImagePreviewAreaProps) {
    const handlePlaceholderClick = () => {
        if (!imageSrc && !currentUrl && !showConfirmDelete) {
            onFileClick();
        }
    };

    return (
        <div
            className={`relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-300 ${!imageSrc && !currentUrl ? "cursor-pointer hover:border-brand-primary" : ""
                }`}
            style={{ height: isAvatar ? "300px" : "200px" }}
            onClick={handlePlaceholderClick}
        >
            {!imageSrc ? (
                currentUrl ? (
                    <div className={`absolute inset-0 group flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 ${isAvatar ? "p-4" : ""}`}>
                        <div className={`relative overflow-hidden ${isAvatar ? "h-56 w-56 rounded-full ring-4 ring-white dark:ring-[#1a1a1b] shadow-xl" : "w-full h-full rounded-lg"}`}>
                            <img
                                src={currentUrl}
                                alt="Current profile"
                                className="w-full h-full object-cover transition-all duration-500 "
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={onFileClick}
                                    className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full shadow-lg hover:bg-gray-100 transition-all transform cursor-pointer"
                                >
                                    Change Photo
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-50/50 dark:bg-gray-900/20">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                            <ZoomIn className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                            Select a new image
                        </span>
                        <p className="text-xs text-gray-500 mt-2 font-medium">JPEG, PNG or WebP</p>
                    </div>
                )
            ) : (
                <div className="absolute inset-0 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropComplete}
                        onZoomChange={onZoomChange}
                        cropShape={isAvatar ? "round" : "rect"}
                        showGrid={false}
                    />
                </div>
            )}
        </div>
    );
}
