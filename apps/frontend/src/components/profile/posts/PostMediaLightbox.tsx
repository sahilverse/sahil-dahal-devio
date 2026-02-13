"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import {
    Dialog,
    DialogContent,
    DialogPortal,
    DialogOverlay,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface MediaItem {
    id: string;
    url: string;
    type: "IMAGE" | "VIDEO" | "FILE";
}

interface PostMediaLightboxProps {
    media: MediaItem[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export default function PostMediaLightbox({
    media,
    currentIndex,
    onIndexChange,
    isOpen,
    onClose,
}: PostMediaLightboxProps) {
    const images = media.filter((m) => m.type === "IMAGE");

    const nextMedia = () => {
        if (currentIndex < images.length - 1) {
            onIndexChange(currentIndex + 1);
        }
    };

    const prevMedia = () => {
        if (currentIndex > 0) {
            onIndexChange(currentIndex - 1);
        }
    };

    // Keyboard support
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") nextMedia();
            if (e.key === "ArrowLeft") prevMedia();
            if (e.key === "Escape") onClose(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, currentIndex, images.length]);

    if (images.length === 0) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogPortal>
                <DialogOverlay className="bg-black/98 backdrop-blur-xl z-[100] fixed inset-0" />
                <DialogContent
                    className="fixed inset-0 z-[101] w-screen h-screen max-w-none m-0 p-4 border-none bg-transparent shadow-none outline-none focus:ring-0 flex flex-col items-center justify-center top-0 left-0 translate-x-0 translate-y-0 sm:max-w-none rounded-none"
                    showCloseButton={false}
                >
                    <DialogTitle className="sr-only">Full-Screen Media Viewer</DialogTitle>
                    <DialogDescription className="sr-only">
                        Full-screen view of images with navigation support
                    </DialogDescription>

                    {/* Close Action */}
                    <div className="absolute top-6 right-6 z-[105]">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="text-white bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all rounded-full h-12 w-12 border border-white/10 backdrop-blur-md"
                            onClick={() => onClose(false)}
                        >
                            <X className="h-7 w-7" />
                        </Button>
                    </div>

                    {/* Main Stage */}
                    <div
                        className="relative w-full h-full flex items-center justify-center select-none overflow-hidden cursor-zoom-out"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                onClose(false);
                            }
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentIndex}
                                src={images[currentIndex].url}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.1, y: -10 }}
                                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                className="max-w-[calc(100%-120px)] max-h-[85vh] object-contain drop-shadow-2xl select-none pointer-events-auto cursor-default"
                                alt={`Post media ${currentIndex + 1}`}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </AnimatePresence>

                        {/* Arrows Layer */}
                        {images.length > 1 && (
                            <>
                                <div className="absolute left-4 inset-y-0 flex items-center z-[103]">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        disabled={currentIndex === 0}
                                        className="h-16 w-16 rounded-full bg-black/40 hover:bg-black/60 text-white disabled:opacity-0 hover:scale-105 transition-all backdrop-blur-sm"
                                        onClick={prevMedia}
                                    >
                                        <ChevronLeft className="h-10 w-10" />
                                    </Button>
                                </div>
                                <div className="absolute right-4 inset-y-0 flex items-center z-[103]">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        disabled={currentIndex === images.length - 1}
                                        className="h-16 w-16 rounded-full bg-black/40 hover:bg-black/60 text-white disabled:opacity-0 hover:scale-105 transition-all backdrop-blur-sm"
                                        onClick={nextMedia}
                                    >
                                        <ChevronRight className="h-10 w-10" />
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Stats / Progress */}
                        {images.length > 1 && (
                            <div className="absolute bottom-8 flex flex-col items-center gap-4 z-[103] w-full">
                                {/* Dots */}
                                <div className="flex gap-2">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => onIndexChange(i)}
                                            className={cn(
                                                "h-1.5 transition-all duration-500 rounded-full",
                                                currentIndex === i
                                                    ? "w-10 bg-white"
                                                    : "w-4 bg-white/20 hover:bg-white/40"
                                            )}
                                        />
                                    ))}
                                </div>
                                {/* Counter text */}
                                <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/5 text-xs font-medium text-white tracking-widest uppercase">
                                    {currentIndex + 1} of {images.length}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
