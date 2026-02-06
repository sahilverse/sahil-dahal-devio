"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "@devio/zod-utils";
import type { CreateProjectInput } from "@devio/zod-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link as LinkIcon, FolderGit2, X } from "lucide-react";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";
import { DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/profile";
import { SkillSearchSelect } from "../skills/SkillSearchSelect";
import { FormTextarea } from "@/components/ui/FormTextarea";

interface ProjectFormProps {
    initialData?: Project;
    onSave: (data: any) => void;
    onDelete?: (id: string) => void;
    onCancel: () => void;
    isPending?: boolean;
}

export function ProjectForm({
    initialData,
    onSave,
    onDelete,
    onCancel,
    isPending
}: ProjectFormProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isDirty }
    } = useForm({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            title: "",
            description: "",
            url: "",
            startDate: new Date().toISOString().split('T')[0],
            endDate: null as string | null,
            skills: [] as string[],
        }
    });

    const currentSkills = watch("skills") || [];
    const descriptionValue = watch("description") || "";

    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title || "",
                description: initialData.description || "",
                url: initialData.url || "",
                startDate: toInputDate(initialData.startDate) || new Date().toISOString().split('T')[0],
                endDate: toInputDate(initialData.endDate),
                skills: initialData.skills || [],
            });
        }
    }, [initialData, reset]);

    const toInputDate = (date: any) => {
        if (!date) return null;
        try {
            return new Date(date).toISOString().split('T')[0];
        } catch (e) {
            return null;
        }
    };

    const handleSkillSelect = (skill: { id: string; name: string }) => {
        if (!currentSkills.includes(skill.name)) {
            setValue("skills", [...currentSkills, skill.name], { shouldDirty: true, shouldValidate: true });
        }
    };

    const handleSkillCreate = (name: string) => {
        if (name && !currentSkills.includes(name)) {
            setValue("skills", [...currentSkills, name], { shouldDirty: true, shouldValidate: true });
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setValue("skills", currentSkills.filter(s => s !== skillToRemove), { shouldDirty: true, shouldValidate: true });
    };

    const onSubmit = (data: CreateProjectInput) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 pt-0 space-y-4 md:space-y-5 flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto px-1 space-y-4 md:space-y-5 custom-scrollbar pb-1">

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        Project Title *
                    </Label>
                    <div className="relative group">
                        <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="title"
                            placeholder="e.g. E-Commerce Platform"
                            className="pl-10 h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                            {...register("title")}
                        />
                    </div>
                    {errors.title && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.title.message}</p>
                    )}
                </div>

                {/* URL */}
                <div className="space-y-2">
                    <Label htmlFor="url" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        Project URL
                    </Label>
                    <div className="relative group">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="url"
                            placeholder="e.g. https://github.com/..."
                            className="pl-10 h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                            {...register("url")}
                        />
                    </div>
                    {errors.url && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.url.message}</p>
                    )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                            Start Date *
                        </Label>
                        <Input
                            id="startDate"
                            type="date"
                            className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground dark:[color-scheme:dark]"
                            {...register("startDate")}
                        />
                        {errors.startDate && (
                            <p className="text-[10px] font-medium text-destructive ml-1">{errors.startDate.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                            End Date
                        </Label>
                        <Input
                            id="endDate"
                            type="date"
                            className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground dark:[color-scheme:dark]"
                            {...register("endDate", {
                                setValueAs: (v) => v === "" ? null : v
                            })}
                        />
                        {errors.endDate && (
                            <p className="text-[10px] font-medium text-destructive ml-1">{errors.endDate.message}</p>
                        )}
                    </div>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                    <SkillSearchSelect
                        onSkillSelect={handleSkillSelect}
                        onSkillCreate={handleSkillCreate}
                    />
                    <div className="flex flex-wrap gap-2 z-10">
                        {currentSkills.map((skill: string) => (
                            <Badge
                                key={skill}
                                variant="secondary"
                                className="pl-3 pr-1 py-1.5 flex items-center gap-1.5 bg-zinc-100 dark:bg-muted/40 hover:bg-zinc-200 dark:hover:bg-muted/60 border-zinc-200 dark:border-muted/50 transition-all rounded-md shadow-sm"
                            >
                                <span className="text-xs font-medium">{skill}</span>
                                <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground/50 transition-colors cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <FormTextarea
                    id="description"
                    label="Description"
                    placeholder="Tell us about the project..."
                    maxLength={1000}
                    register={register("description")}
                    watchValue={descriptionValue}
                    error={errors.description}
                />
            </div>

            <DialogFooter className="pt-4 md:pt-6 border-t flex items-center gap-3 shrink-0 w-full">
                {initialData?.id && onDelete ? (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isPending}
                        className="h-11 sm:h-9 flex-1 sm:flex-none sm:min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase rounded-md text-destructive hover:text-destructive/80 transition-all"
                    >
                        Delete
                    </Button>
                ) : (
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={onCancel}
                        className="h-11 sm:h-9 flex-1 sm:flex-none sm:min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase rounded-md transition-all"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="brand"
                    disabled={isPending || !isDirty}
                    className="h-11 sm:h-9 flex-1 sm:flex-none sm:min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase shadow-lg shadow-brand-primary/20 transition-all rounded-md"
                >
                    {isPending ? "Saving..." : "Save"}
                </Button>
            </DialogFooter>

            <ConfirmDeleteModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    if (initialData?.id && onDelete) {
                        onDelete(initialData.id);
                        setShowDeleteConfirm(false);
                    }
                }}
                title="Confirm Deletion"
                description={
                    <>
                        Are you sure you want to delete <span className="font-semibold text-foreground">{initialData?.title}</span>?
                        <br /><br />
                        This action cannot be undone.
                    </>
                }
            />
        </form>
    );
}
