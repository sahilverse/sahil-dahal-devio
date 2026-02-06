"use client";

import { useManageCertifications } from "@/hooks/useCertifications";
import BaseAboutModal from "../BaseAboutModal";
import { CertificationForm } from "./CertificationForm";
import { Award } from "lucide-react";

interface CertificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    initialData?: any;
}

export default function CertificationModal({
    isOpen,
    onClose,
    username,
    initialData,
}: CertificationModalProps) {
    const { addCertification, updateCertification, deleteCertification } = useManageCertifications(username);

    const handleSave = async (data: any) => {
        if (initialData?.id) {
            await updateCertification.mutateAsync({ id: initialData.id, payload: data });
        } else {
            await addCertification.mutateAsync(data);
        }
        onClose();
    };

    const handleDelete = async (id: string) => {
        await deleteCertification.mutateAsync(id);
        onClose();
    };

    return (
        <BaseAboutModal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Certification" : "Add Certification"}
            icon={<Award className="h-4 w-4" />}
        >
            <CertificationForm
                initialData={initialData}
                onSave={handleSave}
                onDelete={initialData ? handleDelete : undefined}
                onCancel={onClose}
                isPending={addCertification.isPending || updateCertification.isPending || deleteCertification.isPending}
            />
        </BaseAboutModal>
    );
}
