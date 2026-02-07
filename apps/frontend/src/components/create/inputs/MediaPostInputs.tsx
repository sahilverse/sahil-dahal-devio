"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Upload, X, Image as ImageIcon, Plus, Film } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function MediaPostInputs() {
    const { control, setValue, watch } = useFormContext();
    const [previews, setPreviews] = useState<string[]>([]);
    const media = watch("media") || [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const totalFiles = [...media, ...files].slice(0, 5);
        setValue("media", totalFiles);

        const newPreviews = totalFiles.map(file => URL.createObjectURL(file as File));
        setPreviews(newPreviews);
    };

    const removeFile = (index: number) => {
        const newMedia = [...media];
        newMedia.splice(index, 1);
        setValue("media", newMedia);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    return (
        <div className="space-y-6">
            <FormField
                control={control}
                name="media"
                render={() => (
                    <FormItem>
                        <FormControl>
                            <div className="space-y-4">
                                {previews.length === 0 ? (
                                    <label className="flex flex-col items-center justify-center w-full min-h-[320px] border-2 border-dashed rounded-3xl bg-zinc-50 dark:bg-zinc-900/30 border-border/40 hover:border-brand-primary/30 hover:bg-brand-primary/[0.02] transition-all cursor-pointer group">
                                        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                                            <div className="h-16 w-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary transition-all duration-300">
                                                <Upload className="h-7 w-7 text-brand-primary group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-black">Upload Images or Videos</p>
                                                <p className="text-sm text-muted-foreground font-medium">Drag & drop or Click to browse</p>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest bg-muted/40 px-3 py-1 rounded-full">
                                                Max 5 files • Up to 10MB each
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        <AnimatePresence mode="popLayout">
                                            {previews.map((preview, index) => {
                                                const isVideo = media[index]?.type?.startsWith("video");

                                                return (
                                                    <motion.div
                                                        key={preview}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        className="relative aspect-square rounded-2xl border border-border/50 overflow-hidden bg-zinc-100 dark:bg-zinc-900 group"
                                                    >
                                                        {isVideo ? (
                                                            <div className="h-full w-full flex items-center justify-center bg-zinc-900">
                                                                <Film className="h-10 w-10 text-brand-primary/40" />
                                                                <video src={preview} className="absolute inset-0 h-full w-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                                            </div>
                                                        ) : (
                                                            <img src={preview} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                        )}

                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                removeFile(index);
                                                            }}
                                                            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 hover:bg-red-500 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>

                                                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                                                                {isVideo ? "Video" : "Image"}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>

                                        {previews.length < 5 && (
                                            <motion.label
                                                layout
                                                className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border-border/40 hover:border-brand-primary/30 hover:bg-brand-primary/[0.02] transition-all cursor-pointer group"
                                            >
                                                <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary transition-all duration-300">
                                                    <Plus className="h-5 w-5 text-brand-primary group-hover:text-white transition-colors" />
                                                </div>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*,video/*"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                            </motion.label>
                                        )}
                                    </div>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage className="text-xs font-bold text-destructive/80" />
                    </FormItem>
                )}
            />
        </div>
    );
}
