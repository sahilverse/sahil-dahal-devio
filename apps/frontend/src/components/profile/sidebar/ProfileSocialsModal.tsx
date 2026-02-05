"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSocialsSchema } from "@devio/zod-utils";
import type { UpdateProfileSocialsInput } from "@devio/zod-utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Github,
    Linkedin,
    Twitter,
    Globe,
    Facebook,
    Instagram,
    Youtube,
    Link as LinkIcon
} from "lucide-react";

interface ProfileSocialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData: Partial<Record<string, string | null>>;
    isPending: boolean;
}

const SOCIAL_FIELDS = [
    { id: "github", label: "GitHub", icon: Github, placeholder: "https://github.com/username" },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
    { id: "twitter", label: "Twitter / X", icon: Twitter, placeholder: "https://twitter.com/username" },
    { id: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/username" },
    { id: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/username" },
    { id: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@channel" },
    { id: "website", label: "Personal Website", icon: Globe, placeholder: "https://yourwebsite.com" },
] as const;

export default function ProfileSocialsModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    isPending
}: ProfileSocialsModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }
    } = useForm<UpdateProfileSocialsInput>({
        resolver: zodResolver(updateProfileSocialsSchema),
        defaultValues: {
            socials: {
                github: initialData.github ?? "",
                linkedin: initialData.linkedin ?? "",
                twitter: initialData.twitter ?? "",
                facebook: initialData.facebook ?? "",
                instagram: initialData.instagram ?? "",
                youtube: initialData.youtube ?? "",
                website: initialData.website ?? "",
            }
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                socials: {
                    github: initialData.github ?? "",
                    linkedin: initialData.linkedin ?? "",
                    twitter: initialData.twitter ?? "",
                    facebook: initialData.facebook ?? "",
                    instagram: initialData.instagram ?? "",
                    youtube: initialData.youtube ?? "",
                    website: initialData.website ?? "",
                }
            });
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = (data: UpdateProfileSocialsInput) => {
        onSave(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-card">
                <DialogHeader className="px-6 py-5 border-b bg-muted/20">
                    <DialogTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase text-primary/80">
                        <LinkIcon className="w-4 h-4" /> Update Social Links
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-0">
                    <div className="max-h-[60vh] overflow-y-auto px-1 space-y-4 custom-scrollbar pb-1">
                        {SOCIAL_FIELDS.map((field) => (
                            <div key={field.id}>
                                <Label htmlFor={field.id} className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground dark:text-muted-foreground/70 ml-0.5 mb-1.5 block">
                                    {field.label}
                                </Label>
                                <div className="relative group">
                                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 dark:text-muted-foreground/30 group-focus-within:text-primary dark:group-focus-within:text-foreground transition-colors duration-200" />
                                    <Input
                                        id={field.id}
                                        placeholder={field.placeholder}
                                        className="pl-10 h-11 bg-muted/40 dark:bg-muted/20 border-muted dark:border-muted/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm"
                                        {...register(`socials.${field.id}` as `socials.${keyof UpdateProfileSocialsInput["socials"]}`)}
                                    />
                                </div>
                                {errors.socials && (errors.socials as any)[field.id] && (
                                    <p className="text-[10px] font-medium text-destructive ml-1 mt-1.5">
                                        {(errors.socials as any)[field.id].message}
                                    </p>
                                )}
                            </div>
                        ))}
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
