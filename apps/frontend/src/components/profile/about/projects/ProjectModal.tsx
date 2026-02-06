"use client";

import { FolderGit2 } from "lucide-react";
import { Project } from "@/types/profile";
import BaseAboutModal from "../BaseAboutModal";
import { ProjectForm } from "./ProjectForm";

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Project;
    onSave: (data: any) => void;
    onDelete?: (id: string) => void;
    isPending?: boolean;
}

export function ProjectModal({
    isOpen,
    onClose,
    initialData,
    onSave,
    onDelete,
    isPending,
}: ProjectModalProps) {
    return (
        <BaseAboutModal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Project" : "Add Project"}
            icon={<FolderGit2 className="w-4 h-4" />}
            className="sm:max-w-[550px]"
        >
            <ProjectForm
                initialData={initialData}
                onSave={onSave}
                onDelete={onDelete}
                onCancel={onClose}
                isPending={isPending}
            />
        </BaseAboutModal>
    );
}
