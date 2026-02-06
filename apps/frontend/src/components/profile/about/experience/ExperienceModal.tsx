"use client";

import type { CreateExperienceInput } from "@devio/zod-utils";
import { Briefcase } from "lucide-react";
import { ExperienceForm } from "./ExperienceForm";
import BaseAboutModal from "../BaseAboutModal";


interface ExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: Partial<CreateExperienceInput> & { id?: string; companyLogoUrl?: string | null };
    onDelete?: (id: string) => void;
    isPending?: boolean;
}

export default function ExperienceModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    onDelete,
    isPending
}: ExperienceModalProps) {
    return (
        <BaseAboutModal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData?.id ? "Edit Experience" : "Add Experience"}
            icon={<Briefcase className="w-4 h-4" />}
            className="sm:h-auto sm:max-w-[600px]"
        >
            <ExperienceForm
                initialData={initialData}
                onSave={onSave}
                onDelete={onDelete}
                onCancel={onClose}
                isPending={isPending}
            />
        </BaseAboutModal>
    );
}
