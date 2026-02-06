"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCertificationSchema } from "@devio/zod-utils";
import type { CreateCertificationInput } from "@devio/zod-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link as LinkIcon, Award, Building2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";
import { DialogFooter } from "@/components/ui/dialog";

interface CertificationFormProps {
    initialData?: Partial<CreateCertificationInput> & { id?: string };
    onSave: (data: any) => void;
    onDelete?: (id: string) => void;
    onCancel: () => void;
    isPending?: boolean;
}

export function CertificationForm({
    initialData,
    onSave,
    onDelete,
    onCancel,
    isPending
}: CertificationFormProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }
    } = useForm({
        resolver: zodResolver(createCertificationSchema),
        defaultValues: {
            name: "",
            issuingOrg: "",
            issueDate: new Date().toISOString().split('T')[0],
            expirationDate: "",
            credentialId: "",
            credentialUrl: "",
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name ?? "",
                issuingOrg: initialData.issuingOrg ?? "",
                issueDate: toInputDate(initialData.issueDate) || new Date().toISOString().split('T')[0],
                expirationDate: toInputDate(initialData.expirationDate),
                credentialId: initialData.credentialId ?? "",
                credentialUrl: initialData.credentialUrl ?? "",
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

    const onSubmit = (data: CreateCertificationInput) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 pt-0 space-y-4 md:space-y-5 flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto px-1 space-y-4 md:space-y-5 custom-scrollbar pb-1">

                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        Certification Name *
                    </Label>
                    <div className="relative group">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="name"
                            list="certification-names"
                            placeholder="e.g. AWS Certified Solutions Architect"
                            className="pl-10 h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                            {...register("name")}
                        />
                        <datalist id="certification-names">
                            <option value="AWS Certified Solutions Architect - Associate" />
                            <option value="AWS Certified Developer - Associate" />
                            <option value="Google Cloud Professional Cloud Architect" />
                            <option value="Microsoft Certified: Azure Solutions Architect Expert" />
                            <option value="CompTIA Security+" />
                            <option value="CompTIA Network+" />
                            <option value="CCNA - Cisco Certified Network Associate" />
                            <option value="PMP - Project Management Professional" />
                            <option value="Certified Ethical Hacker (CEH)" />
                            <option value="CISSP - Certified Information Systems Security Professional" />
                        </datalist>
                    </div>
                    {errors.name && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Issuing Organization */}
                <div className="space-y-2">
                    <Label htmlFor="issuingOrg" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        Issuing Organization *
                    </Label>
                    <div className="relative group">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="issuingOrg"
                            list="issuing-orgs"
                            placeholder="e.g. Amazon Web Services"
                            className="pl-10 h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                            {...register("issuingOrg")}
                        />
                        <datalist id="issuing-orgs">
                            <option value="Amazon Web Services (AWS)" />
                            <option value="Google Cloud" />
                            <option value="Microsoft" />
                            <option value="CompTIA" />
                            <option value="Cisco" />
                            <option value="Oracle" />
                            <option value="Project Management Institute (PMI)" />
                            <option value="EC-Council" />
                            <option value="(ISC)²" />
                            <option value="Salesforce" />
                            <option value="Meta" />
                        </datalist>
                    </div>
                    {errors.issuingOrg && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.issuingOrg.message}</p>
                    )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="issueDate" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                            Issue Date *
                        </Label>
                        <Input
                            id="issueDate"
                            type="date"
                            className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground dark:[color-scheme:dark]"
                            {...register("issueDate", { setValueAs: (v) => v === "" ? undefined : v })}
                        />
                        {errors.issueDate && (
                            <p className="text-[10px] font-medium text-destructive ml-1">{errors.issueDate.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expirationDate" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                            Expiration Date
                        </Label>
                        <Input
                            id="expirationDate"
                            type="date"
                            className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground dark:[color-scheme:dark]"
                            {...register("expirationDate", { setValueAs: (v) => v === "" ? null : v })}
                        />
                        {errors.expirationDate && (
                            <p className="text-[10px] font-medium text-destructive ml-1">{errors.expirationDate.message}</p>
                        )}
                    </div>
                </div>

                {/* Credential ID */}
                <div className="space-y-2">
                    <Label htmlFor="credentialId" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        Credential ID
                    </Label>
                    <Input
                        id="credentialId"
                        placeholder="e.g. ABC-123-XYZ"
                        className="h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                        {...register("credentialId")}
                    />
                    {errors.credentialId && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.credentialId.message}</p>
                    )}
                </div>

                {/* Credential URL */}
                <div className="space-y-2">
                    <Label htmlFor="credentialUrl" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                        Credential URL
                    </Label>
                    <div className="relative group">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                        <Input
                            id="credentialUrl"
                            placeholder="e.g. https://badges.example.com/..."
                            className="pl-10 h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                            {...register("credentialUrl")}
                        />
                    </div>
                    {errors.credentialUrl && (
                        <p className="text-[10px] font-medium text-destructive ml-1">{errors.credentialUrl.message}</p>
                    )}
                </div>
            </div>

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
                        Are you sure you want to delete this certification <span className="font-semibold text-foreground">{initialData?.name}</span>?
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
