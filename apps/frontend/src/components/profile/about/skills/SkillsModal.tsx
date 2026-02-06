"use client";

import { Wrench } from "lucide-react";
import { Skill } from "@/types/profile";
import { Button } from "@/components/ui/button";
import BaseAboutModal from "../BaseAboutModal";
import { SkillsForm } from "./SkillsForm";

interface SkillsModalProps {
    isOpen: boolean;
    onClose: () => void;
    skills: Skill[];
    onAdd: (name: string) => void;
    onRemove: (id: string) => void;
    isAdding?: boolean;
    isRemoving?: string | null;
}

export default function SkillsModal({
    isOpen,
    onClose,
    skills,
    onAdd,
    onRemove,
    isAdding,
    isRemoving
}: SkillsModalProps) {
    return (
        <BaseAboutModal
            isOpen={isOpen}
            onClose={onClose}
            title="Manage Skills"
            icon={<Wrench className="w-4 h-4" />}
            className="sm:max-w-[500px]"
            showFooter
            footer={
                <Button
                    variant="brand"
                    onClick={onClose}
                    className="h-11 sm:h-9 w-full sm:w-auto sm:min-w-[100px] px-6 font-bold tracking-tight text-[11px] uppercase shadow-lg shadow-brand-primary/20 transition-all rounded-md"
                >
                    Done
                </Button>
            }
        >
            <SkillsForm
                skills={skills}
                onAdd={onAdd}
                onRemove={onRemove}
                isAdding={isAdding}
                isRemoving={isRemoving}
            />
        </BaseAboutModal>
    );
}
