"use client";

import type { CreateEducationInput } from "@devio/zod-utils";
import { GraduationCap } from "lucide-react";
import { EducationForm } from "./EducationForm";
import BaseAboutModal from "../BaseAboutModal";

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
        <BaseAboutModal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData?.id ? "Edit Education" : "Add Education"}
            icon={<GraduationCap className="w-4 h-4" />}
            className="sm:h-auto sm:max-w-[600px]"
        >
            <EducationForm
                initialData={initialData}
                onSave={onSave}
                onDelete={onDelete}
                onCancel={onClose}
                isPending={isPending}
            />
        </BaseAboutModal>
    );
}
