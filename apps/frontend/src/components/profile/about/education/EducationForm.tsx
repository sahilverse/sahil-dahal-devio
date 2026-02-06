"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEducationSchema } from "@devio/zod-utils";
import type { CreateEducationInput } from "@devio/zod-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School, GraduationCap } from "lucide-react";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";
import { DialogFooter } from "@/components/ui/dialog";
import { FormTextarea } from "@/components/ui/FormTextarea";


interface EducationFormProps {
    initialData?: Partial<CreateEducationInput> & { id?: string; };
    onSave: (data: any) => void;
    onDelete?: (id: string) => void;
    onCancel: () => void;
    isPending?: boolean;
}

export function EducationForm({
    initialData,
    onSave,
    onDelete,
    onCancel,
    isPending
}: EducationFormProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty }
    } = useForm({
        resolver: zodResolver(createEducationSchema),
        defaultValues: {
            school: "",
            degree: "",
            fieldOfStudy: "",
            startDate: new Date().toISOString().split('T')[0],
            endDate: "",
            grade: "",
            activities: "",
            description: "",
        }
    });

    const activitiesValue = watch("activities") || "";
    const descriptionValue = watch("description") || "";

    useEffect(() => {
        if (initialData) {
            reset({
                school: initialData.school ?? "",
                degree: initialData.degree ?? "",
                fieldOfStudy: initialData.fieldOfStudy ?? "",
                startDate: toInputDate(initialData.startDate),
                endDate: toInputDate(initialData.endDate),
                grade: initialData.grade ?? "",
                activities: initialData.activities ?? "",
                description: initialData.description ?? "",
            });
        }
    }, [initialData, reset]);

    const toInputDate = (date: any) => {
        if (!date) return "";
        try {
            return new Date(date).toISOString().split('T')[0];
        } catch (e) {
            return "";
        }
    };

    const onSubmit = (data: CreateEducationInput) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 pt-0 space-y-4 md:space-y-5 flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto px-1 space-y-4 md:space-y-5 custom-scrollbar pb-1">

                {/* School */}
                <div className="space-y-2">
                    <Label htmlFor="school" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        School / University *
                    </Label>
                    <div className="relative group">
                        <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="school"
                            placeholder="e.g. Stanford University"
                            className="pl-10 h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                            {...register("school")}
                        />
                    </div>
                    {errors.school && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.school.message}</p>
                    )}
                </div>

                {/* Degree & Field of Study */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="degree" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                            Degree
                        </Label>
                        <div className="relative group">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                            <Input
                                id="degree"
                                placeholder="e.g. Bachelor's"
                                className="pl-10 h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                                {...register("degree")}
                            />
                        </div>
                        {errors.degree && (
                            <p className="text-[10px] font-medium text-destructive ml-1">{errors.degree.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fieldOfStudy" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                            Field of Study
                        </Label>
                        <Input
                            id="fieldOfStudy"
                            placeholder="e.g. Computer Science"
                            className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                            {...register("fieldOfStudy")}
                        />
                        {errors.fieldOfStudy && (
                            <p className="text-[10px] font-medium text-destructive ml-1">{errors.fieldOfStudy.message}</p>
                        )}
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                            Start Date *
                        </Label>
                        <Input
                            id="startDate"
                            type="date"
                            className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground dark:[color-scheme:dark]"
                            {...register("startDate", { setValueAs: (v) => v === "" ? undefined : v })}
                        />
                        {errors.startDate && (
                            <p className="text-[10px] font-medium text-destructive ml-1">{errors.startDate.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                            End Date (or Expected)
                        </Label>
                        <Input
                            id="endDate"
                            type="date"
                            className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground dark:[color-scheme:dark]"
                            {...register("endDate", { setValueAs: (v) => v === "" ? null : v })}
                        />
                        {errors.endDate && (
                            <p className="text-[10px] font-medium text-destructive ml-1">{errors.endDate.message}</p>
                        )}
                    </div>
                </div>

                {/* Grade & Activities */}
                <div className="space-y-2">
                    <Label htmlFor="grade" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        Grade
                    </Label>
                    <Input
                        id="grade"
                        placeholder="e.g. 3.8 GPA"
                        className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                        {...register("grade")}
                    />
                    {errors.grade && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.grade.message}</p>
                    )}
                </div>

                <FormTextarea
                    id="activities"
                    label="Activities and Societies"
                    placeholder="e.g. Computer Science Club, Debate Team..."
                    maxLength={500}
                    register={register("activities")}
                    watchValue={activitiesValue}
                    error={errors.activities}
                    className="min-h-[80px]"
                />

                <FormTextarea
                    id="description"
                    label="Description"
                    placeholder="Describe your studies, awards, etc..."
                    maxLength={1000}
                    register={register("description")}
                    watchValue={descriptionValue}
                    error={errors.description}
                />
            </div >

            <DialogFooter className="pt-4 md:pt-6 border-t flex items-center gap-3 shrink-0 w-full">
                {initialData?.id && onDelete ? (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isPending}
                        className="h-11 sm:h-9 flex-1 sm:flex-none sm:min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase rounded-md text-destructive hover:text-destructive/80"
                    >
                        Delete
                    </Button>
                ) : (
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={onCancel}
                        className="h-11 sm:h-9 flex-1 sm:flex-none sm:min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase rounded-md"
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
                        Are you sure you want to delete this education at <span className="font-semibold text-foreground">{initialData?.school}</span>?
                        <br /><br />
                        This action cannot be undone.
                    </>
                }
                confirmText="Confirm Delete"
                isPending={isPending}
            />
        </form >
    );
}
