"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileTitleSchema, updateProfileLocationSchema } from "@devio/zod-utils";
import type { UpdateProfileInput } from "@devio/zod-utils";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Briefcase } from "lucide-react";

interface ProfileInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: UpdateProfileInput) => void;
    initialData: {
        title?: string | null;
        city?: string | null;
        country?: string | null;
    };
    isPending?: boolean;
    mode: "title" | "location";
}

export default function ProfileInfoModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    isPending,
    mode
}: ProfileInfoModalProps) {
    const schema = mode === "title" ? updateProfileTitleSchema : updateProfileLocationSchema;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isDirty }
    } = useForm<UpdateProfileInput>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: initialData.title ?? "",
            city: initialData.city ?? "",
            country: initialData.country ?? "",
        }
    });

    const titleValue = watch("title") || "";
    const titleWordCount = titleValue.trim().split(/\s+/).filter(Boolean).length;
    const isTitleValidCount = titleWordCount >= 3 && titleWordCount <= 30;

    const titleRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            reset({
                title: initialData.title ?? "",
                city: initialData.city ?? "",
                country: initialData.country ?? "",
            });

            setTimeout(() => {
                const textarea = titleRef.current;
                if (textarea) {
                    textarea.style.height = "auto";
                    textarea.style.height = `${textarea.scrollHeight}px`;
                }
            }, 0);
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = (data: UpdateProfileInput) => {
        onSave(data);
    };

    const { ref: formTitleRef, ...titleRegisterProps } = register("title");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl bg-card">
                <DialogHeader className="px-6 py-5 border-b bg-muted/20">
                    <DialogTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase text-primary/80">
                        {mode === "title" ? "Update Professional Title" : "Update Location"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-0 space-y-6">
                    <div className="space-y-5">
                        {mode === "title" && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-0.5">
                                    <Label htmlFor="title" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70">
                                        Professional Title
                                    </Label>
                                    <span className={cn(
                                        "text-[10px] font-bold tabular-nums tracking-tighter transition-colors",
                                        isTitleValidCount ? "text-primary/60" : "text-destructive"
                                    )}>
                                        {titleWordCount} / 30 WORDS
                                    </span>
                                </div>
                                <div className="relative group">
                                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors z-10" />
                                    <Textarea
                                        id="title"
                                        placeholder="e.g. Senior Software Engineer"
                                        className="pl-10 min-h-[44px] max-h-[300px] h-[44px] bg-muted/20 border-muted/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm py-3 resize-none overflow-hidden"
                                        {...titleRegisterProps}
                                        ref={(e) => {
                                            formTitleRef(e);
                                            titleRef.current = e;
                                        }}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            const words = titleValue.trim().split(/\s+/).filter(Boolean);
                                            if (words.length >= 30 && (e.key === " " || e.key === "Enter")) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e) => {
                                            const pasteText = e.clipboardData.getData("text");
                                            const currentText = e.currentTarget.value;
                                            const combinedText = currentText + pasteText;
                                            const words = combinedText.trim().split(/\s+/).filter(Boolean);

                                            if (words.length > 30) {
                                                e.preventDefault();
                                                const truncated = words.slice(0, 30).join(" ");
                                                setValue("title", truncated, { shouldDirty: true, shouldValidate: true });

                                                setTimeout(() => {
                                                    const textarea = titleRef.current;
                                                    if (textarea) {
                                                        textarea.style.height = "auto";
                                                        textarea.style.height = `${textarea.scrollHeight}px`;
                                                    }
                                                }, 0);
                                            }
                                        }}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = "auto";
                                            target.style.height = `${target.scrollHeight}px`;
                                        }}
                                    />
                                </div>
                                {errors.title && (
                                    <p className="text-[10px] font-medium text-destructive ml-1">
                                        {errors.title.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground/60 ml-0.5 mt-1 leading-relaxed">
                                    Briefly describe your expertise. Must be at least 3 words and max 30 words.
                                </p>
                            </div>
                        )}

                        {mode === "location" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                                        City
                                    </Label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="city"
                                            placeholder="e.g. London"
                                            className="pl-10 h-11 bg-muted/20 border-muted/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm"
                                            {...register("city")}
                                            autoFocus
                                        />
                                    </div>
                                    {errors.city && (
                                        <p className="text-[10px] font-medium text-destructive ml-1">
                                            {errors.city.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                                        Country
                                    </Label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="country"
                                            placeholder="e.g. UK"
                                            className="pl-10 h-11 bg-muted/20 border-muted/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm"
                                            {...register("country")}
                                        />
                                    </div>
                                    {errors.country && (
                                        <p className="text-[10px] font-medium text-destructive ml-1">
                                            {errors.country.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-6 border-t flex flex-col sm:flex-row gap-3 mt-4">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={onClose}
                            className="h-10 px-6 font-bold tracking-tight text-[11px] uppercase rounded-md sm:flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="brand"
                            disabled={isPending || !isDirty}
                            className="h-10 px-6 font-bold tracking-tight text-[11px] uppercase shadow-lg shadow-brand-primary/20 transition-all rounded-md sm:flex-1"
                        >
                            {isPending ? "Updating..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
