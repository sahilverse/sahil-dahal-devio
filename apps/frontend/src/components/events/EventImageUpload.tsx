"use client";

import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, X, ImageIcon, ZoomIn, Loader2 } from "lucide-react";
import Cropper from "react-easy-crop";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedImg } from "@/lib/canvasUtils";

interface EventImageUploadProps {
    onFileSelect: (file: File | null) => void;
    currentImageUrl?: string | null;
    className?: string;
    onRemove?: () => void;
}

export default function EventImageUpload({ onFileSelect, onRemove, currentImageUrl, className }: EventImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cropping state
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);

    useEffect(() => {
        if (currentImageUrl) setPreview(currentImageUrl);
    }, [currentImageUrl]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!file.type.startsWith("image/")) return;

            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageSrc(reader.result?.toString() || null);
            });
            reader.readAsDataURL(file);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (!file.type.startsWith("image/")) return;

            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageSrc(reader.result?.toString() || null);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const saveCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setIsCropping(true);
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedFile) {
                const objectUrl = URL.createObjectURL(croppedFile);
                setPreview(objectUrl);
                onFileSelect(croppedFile);
                handleCloseCrop();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCropping(false);
        }
    };

    const handleCloseCrop = () => {
        setImageSrc(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemove = () => {
        setPreview(null);
        onFileSelect(null);
        if (onRemove) onRemove();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <>
            {preview ? (
                <div className={cn("relative group rounded-2xl overflow-hidden border border-border/50 bg-muted/5", className)}>
                    <div className="aspect-[21/9] w-full relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Event cover"
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay controls */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3">
                            <Button
                                type="button"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-9 px-4 rounded-full bg-white/90 hover:bg-white text-black font-bold text-xs cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                                Replace
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 rounded-full bg-red-500/90 hover:bg-red-500 text-white cursor-pointer"
                                onClick={handleRemove}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={cn(
                        "relative group w-full border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden",
                        isDragOver
                            ? "border-brand-primary bg-brand-primary/5 scale-[1.01]"
                            : "border-border/30 hover:border-brand-primary/50 bg-muted/5 hover:bg-muted/10",
                        className
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={onDrop}
                >
                    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
                        <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                            isDragOver
                                ? "bg-brand-primary/10 text-brand-primary scale-110"
                                : "bg-muted/50 text-muted-foreground/50 group-hover:bg-brand-primary/10 group-hover:text-brand-primary"
                        )}>
                            <ImageIcon className="h-7 w-7" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground/70 group-hover:text-foreground transition-colors">
                                {isDragOver ? "Drop to upload" : "Upload Event Cover"}
                            </p>
                            <p className="text-[11px] text-muted-foreground/50 font-medium uppercase tracking-wider">
                                JPEG, PNG, or WebP — Recommended 1200×514
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onFileChange}
                className="hidden"
            />

            <Dialog open={!!imageSrc} onOpenChange={(open) => !open && handleCloseCrop()}>
                <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background">
                    <DialogHeader className="p-4 md:p-6 pb-2">
                        <DialogTitle>Crop Image</DialogTitle>
                    </DialogHeader>

                    <div className="relative w-full h-[400px] bg-black/5">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={21 / 9}
                                onCropChange={setCrop}
                                onCropComplete={handleCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>

                    <div className="p-4 md:p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <ZoomIn className="w-4 h-4 text-muted-foreground" />
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-primary"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={handleCloseCrop} disabled={isCropping}>
                                Cancel
                            </Button>
                            <Button onClick={saveCroppedImage} disabled={isCropping} className="min-w-[80px]">
                                {isCropping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
