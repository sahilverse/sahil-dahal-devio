"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExperienceSchema } from "@devio/zod-utils";
import type { CreateExperienceInput } from "@devio/zod-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { EMPLOYMENT_TYPE_OPTIONS } from "@/lib/constants";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";
import { CompanySearchInput } from "./CompanySearchInput";
import { DialogFooter } from "@/components/ui/dialog";

interface ExperienceFormProps {
    initialData?: Partial<CreateExperienceInput> & { id?: string; companyLogoUrl?: string | null };
    onSave: (data: any) => void;
    onDelete?: (id: string) => void;
    onCancel: () => void;
    isPending?: boolean;
}

export function ExperienceForm({
    initialData,
    onSave,
    onDelete,
    onCancel,
    isPending
}: ExperienceFormProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors, isDirty }
    } = useForm({
        resolver: zodResolver(createExperienceSchema),
        defaultValues: {
            title: "",
            companyName: "",
            companyId: null,
            location: "",
            type: "FULL_TIME",
            startDate: new Date().toISOString().split('T')[0],
            endDate: "",
            isCurrent: false,
            description: "",
        }
    });

    const isCurrent = watch("isCurrent");
    const companyName = watch("companyName");

    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title ?? "",
                companyName: initialData.companyName ?? "",
                companyId: initialData.companyId ?? null,
                location: initialData.location ?? "",
                type: (initialData.type as any) ?? "FULL_TIME",
                startDate: toInputDate(initialData.startDate) || new Date().toISOString().split('T')[0],
                endDate: toInputDate(initialData.endDate),
                isCurrent: initialData.isCurrent ?? false,
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

    const handleCompanySelect = (company: { id: string; name: string }) => {
        setValue("companyName", company.name, { shouldValidate: true, shouldDirty: true });
        setValue("companyId", company.id, { shouldDirty: true });
    };

    const handleCompanyChange = (name: string) => {
        setValue("companyName", name, { shouldValidate: true, shouldDirty: true });
        setValue("companyId", null, { shouldDirty: true });
    };

    const onSubmit = (data: CreateExperienceInput) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-0 space-y-5">
            <div className="max-h-[70vh] overflow-y-auto px-1 space-y-5 custom-scrollbar pb-1">

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        Title *
                    </Label>
                    <Input
                        id="title"
                        placeholder="e.g. Senior Software Engineer"
                        className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                        {...register("title")}
                    />
                    {errors.title && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.title.message}</p>
                    )}
                </div>

                {/* Company & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CompanySearchInput
                        value={companyName}
                        onCompanySelect={handleCompanySelect}
                        onCompanyChange={handleCompanyChange}
                        error={errors.companyName}
                    />

                    {/* Employment Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                            Employment Type
                        </Label>
                        <select
                            id="type"
                            className="flex h-11 w-full items-center justify-between rounded-md border border-zinc-300 dark:border-muted/50 bg-zinc-50/50 dark:bg-muted/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground dark:[&>option]:bg-popover dark:[&>option]:text-popover-foreground"
                            {...register("type")}
                        >
                            <option value="" disabled>Select type</option>
                            {EMPLOYMENT_TYPE_OPTIONS.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <Label htmlFor="location" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        Location
                    </Label>
                    <div className="relative group">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="location"
                            placeholder="e.g. San Francisco, CA"
                            className="pl-10 h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                            {...register("location")}
                        />
                    </div>
                    {errors.location && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.location.message}</p>
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
                            {...register("startDate", { setValueAs: (v) => v === "" ? undefined : v })}
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
                            disabled={isCurrent}
                            className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm disabled:opacity-50 text-foreground dark:[color-scheme:dark]"
                            {...register("endDate", { setValueAs: (v) => v === "" ? null : v })}
                        />
                        {errors.endDate && (
                            <p className="text-[10px] font-medium text-destructive ml-1">{errors.endDate.message}</p>
                        )}
                    </div>
                </div>

                {/* Current Role Checkbox */}
                <div className="flex items-center space-x-2">
                    <Controller
                        name="isCurrent"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="checkbox"
                                id="isCurrent"
                                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900 text-brand accent-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] dark:[color-scheme:dark]"
                                checked={!!field.value}
                                onChange={(e) => {
                                    field.onChange(e.target.checked);
                                    if (e.target.checked) {
                                        setValue("endDate", null, { shouldDirty: true });
                                    }
                                }}
                            />
                        )}
                    />
                    <Label htmlFor="isCurrent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-muted-foreground">
                        I am currently working in this role
                    </Label>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        Description
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Describe your responsibilities and achievements..."
                        className="min-h-[100px] bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm resize-y text-foreground placeholder:text-muted-foreground/70"
                        {...register("description")}
                    />
                    {errors.description && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.description.message}</p>
                    )}
                </div>
            </div>

            <DialogFooter className="pt-6 border-t flex items-center justify-end gap-3">
                {initialData?.id && onDelete ? (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isPending}
                        className="h-9 min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase rounded-md text-destructive hover:text-destructive/80"
                    >
                        Delete
                    </Button>
                ) : (
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={onCancel}
                        className="h-9 min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase rounded-md"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="brand"
                    disabled={isPending || !isDirty}
                    className="h-9 min-w-[90px] px-4 font-bold tracking-tight text-[11px] uppercase shadow-lg shadow-brand-primary/20 transition-all rounded-md"
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
                        Are you sure you want to delete this experience at <span className="font-semibold text-foreground">{initialData?.companyName}</span>?
                        <br /><br />
                        This action cannot be undone.
                    </>
                }
                confirmText="Confirm Delete"
                isPending={isPending}
            />
        </form>
    );
}
