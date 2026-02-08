"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import PostMediaLightbox from "./PostMediaLightbox";

interface MediaItem {
    id: string;
    url: string;
    type: "IMAGE" | "VIDEO" | "FILE";
}

interface PostMediaCarouselProps {
    media: MediaItem[];
}

export default function PostMediaCarousel({ media }: PostMediaCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!media || media.length === 0) return null;

    const images = media.filter((m) => m.type === "IMAGE");
    if (images.length === 0) return null;

    const nextMedia = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevMedia = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <>
            <div
                className="group/carousel relative cursor-pointer w-full bg-muted/5 overflow-hidden"
                onClick={() => setIsLightboxOpen(true)}
            >
                {/* Main Image Display */}
                <div className="relative w-full flex items-center justify-center min-h-[200px]">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentIndex}
                            src={images[currentIndex].url}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full max-h-[500px] object-contain pointer-events-none select-none rounded-lg"
                            alt={`Post media ${currentIndex + 1}`}
                        />
                    </AnimatePresence>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <div className="absolute inset-y-0 left-2 flex items-center opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={currentIndex === 0}
                                className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/5 disabled:opacity-0"
                                onClick={prevMedia}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="absolute inset-y-0 right-2 flex items-center opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={currentIndex === images.length - 1}
                                className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/5 disabled:opacity-0"
                                onClick={nextMedia}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </>
                )}

                {/* Dots Navigation */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1 z-10">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCurrentIndex(i);
                                }}
                                className={cn(
                                    "h-1 transition-all duration-300 rounded-full",
                                    currentIndex === i
                                        ? "w-4 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        : "w-1 bg-white/40 hover:bg-white/60"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Counter */}
                {images.length > 1 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white z-10">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            <PostMediaLightbox
                media={media}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
                isOpen={isLightboxOpen}
                onClose={setIsLightboxOpen}
            />
        </>
    );
}
