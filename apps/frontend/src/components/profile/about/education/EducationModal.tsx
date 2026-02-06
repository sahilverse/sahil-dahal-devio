"use client";

import type { CreateEducationInput } from "@devio/zod-utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { GraduationCap } from "lucide-react";
import { EducationForm } from "./EducationForm";

interface EducationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: Partial<CreateEducationInput> & { id?: string; };
    onDelete?: (id: string) => void;
    isPending?: boolean;
}

export default function EducationModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    onDelete,
    isPending
}: EducationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95%] max-h-[90dvh] sm:h-auto sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl bg-card rounded-xl flex flex-col">
                <DialogHeader className="px-4 py-4 md:px-6 md:py-5 border-b bg-muted/20 shrink-0">
                    <DialogTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase text-primary/80">
                        <GraduationCap className="w-4 h-4" /> {initialData?.id ? "Edit Education" : "Add Education"}
                    </DialogTitle>
                </DialogHeader>

                <EducationForm
                    initialData={initialData}
                    onSave={onSave}
                    onDelete={onDelete}
                    onCancel={onClose}
                    isPending={isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
