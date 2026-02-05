"use client";
import { ZoomIn, ZoomOut } from "lucide-react";

interface CropControlsProps {
    imageSrc: string | null;
    showConfirmDelete: boolean;
    zoom: number;
    onZoomChange: (val: number) => void;
    onFileSelectClick: () => void;
}

export function CropControls({
    imageSrc,
    showConfirmDelete,
    zoom,
    onZoomChange,
    onFileSelectClick,
}: CropControlsProps) {
    if (!imageSrc || showConfirmDelete) return null;

    return (
        <div className="mt-4 px-2 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-gray-400" />
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => onZoomChange(Number(e.target.value))}
                    className="flex-1 h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <ZoomIn className="w-4 h-4 text-gray-400" />
            </div>
            <button
                onClick={onFileSelectClick}
                className="mt-3 text-xs font-medium text-brand-primary hover:underline cursor-pointer"
            >
                Select different photo
            </button>
        </div>
    );
}
