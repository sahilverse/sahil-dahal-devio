"use client";

import { UploadCloud, X, Plus, Trash2, ChevronLeft, ChevronRight, PenLine } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

export default function MediaUploadBox() {
    const { setValue, watch } = useFormContext();
    const media: File[] = watch("media") || [];
    const [previews, setPreviews] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const newPreviews = media.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);

        if (currentIndex >= media.length && media.length > 0) {
            setCurrentIndex(media.length - 1);
        }

        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [media]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const imageFiles = files.filter(file => file.type.startsWith("image/"));
        const newMedia = [...media, ...imageFiles].slice(0, 10);

        setValue("media", newMedia);
    };

    const removeCurrentMedia = () => {
        const newMedia = media.filter((_, i) => i !== currentIndex);
        setValue("media", newMedia);
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const nextImage = () => {
        if (currentIndex < media.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevImage = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (media.length === 0) {
        return (
            <div className="relative group w-full min-h-[180px] border-2 border-dashed border-muted-foreground/10 hover:border-muted-foreground/20 transition-all rounded-[12px] flex flex-col items-center justify-center p-8 bg-muted/5 hover:bg-muted/10 cursor-pointer">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-foreground/5 transition-colors">
                        <UploadCloud className="h-6 w-6 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-muted-foreground/60 transition-colors group-hover:text-foreground">
                            Drag and Drop or upload media
                        </p>
                        <p className="text-[11px] text-muted-foreground/40 font-medium uppercase tracking-wider">
                            Images only (up to 10)
                        </p>
                    </div>
                </div>
                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
        );
    }

    return (
        <div className="w-full group/container">
            <div className="relative aspect-video w-full bg-black/95 rounded-[16px] overflow-hidden border border-white/5 shadow-2xl">
                {/* Main Image Display */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentIndex}
                            src={previews[currentIndex]}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="max-w-full max-h-full object-contain pointer-events-none"
                            alt="Preview"
                        />
                    </AnimatePresence>
                </div>

                {/* Top Overlay Buttons */}
                <div className="absolute top-4 inset-x-4 flex justify-between items-start z-10">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            className="h-8 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md text-white font-bold text-xs gap-1.5 px-3"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                        </Button>
                    </div>

                    <Button
                        type="button"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-black/40 hover:bg-red-500/80 border border-white/10 backdrop-blur-md text-white transition-colors"
                        onClick={removeCurrentMedia}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation Arrows */}
                {media.length > 1 && (
                    <>
                        <div className="absolute inset-y-0 left-2 flex items-center opacity-0 group-hover/container:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={currentIndex === 0}
                                className="h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/5 disabled:opacity-0"
                                onClick={prevImage}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="absolute inset-y-0 right-2 flex items-center opacity-0 group-hover/container:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={currentIndex === media.length - 1}
                                className="h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/5 disabled:opacity-0"
                                onClick={nextImage}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                    </>
                )}

                {/* Dots Navigation */}
                {media.length > 1 && (
                    <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-10">
                        {media.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setCurrentIndex(i)}
                                className={cn(
                                    "h-1.5 transition-all duration-300 rounded-full",
                                    currentIndex === i ? "w-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "w-1.5 bg-white/40 hover:bg-white/60"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Pagination Info */}
            {media.length > 0 && (
                <p className="mt-2 text-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                    {currentIndex + 1} of {media.length}
                </p>
            )}
        </div>
    );
}
