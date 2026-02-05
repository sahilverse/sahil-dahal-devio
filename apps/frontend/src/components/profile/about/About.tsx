import { useState } from "react";
import { UserProfile, Experience } from "@/types/profile";
import { motion } from "motion/react";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import CertificationSection from "./CertificationSection";
import ProjectSection from "./ProjectSection";
import SkillsSection from "./SkillsSection";
import ExperienceModal from "./ExperienceModal";
import { useManageExperience } from "@/hooks/useExperience";
import { logger } from "@/lib/logger";

interface AboutProps {
    profile: UserProfile;
    isCurrentUser?: boolean;
}

export default function About({ profile, isCurrentUser = false }: AboutProps) {
    const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

    const { addExperience, updateExperience, deleteExperience } = useManageExperience(profile.username);

    const handleAdd = (section: string) => () => {
        console.log(`Add ${section}`);
    };

    const handleEdit = (section: string) => () => {
        console.log(`Edit ${section}`);
    };

    const handleSaveExperience = async (data: any) => {
        try {
            if (editingExperience) {
                await updateExperience.mutateAsync({ id: editingExperience.id, payload: data });
            } else {
                await addExperience.mutateAsync(data);
            }
            setIsExperienceModalOpen(false);
            setEditingExperience(null);
        } catch (error) {
            logger.error(error);
        }
    };

    const handleAddExperience = () => {
        setEditingExperience(null);
        setIsExperienceModalOpen(true);
    };

    const handleEditExperience = (exp: Experience) => {
        setEditingExperience(exp);
        setIsExperienceModalOpen(true);
    };

    const handleDeleteExperience = async (id: string) => {
        try {
            if (confirm("Are you sure you want to delete this experience?")) {
                await deleteExperience.mutateAsync(id);
                setIsExperienceModalOpen(false);
                setEditingExperience(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
        >
            <ExperienceSection
                experiences={profile.experiences}
                isCurrentUser={isCurrentUser}
                onAdd={handleAddExperience}
                onEditExperience={handleEditExperience}
            />

            <EducationSection
                educations={profile.educations}
                isCurrentUser={isCurrentUser}
                onAdd={handleAdd("education")}
                onEdit={handleEdit("education")}
            />

            <SkillsSection
                skills={profile.skills}
                isCurrentUser={isCurrentUser}
                onAdd={handleAdd("skills")}
                onEdit={handleEdit("skills")}
            />

            <CertificationSection
                certifications={profile.certifications}
                isCurrentUser={isCurrentUser}
                onAdd={handleAdd("certification")}
                onEdit={handleEdit("certification")}
            />

            <ProjectSection
                projects={profile.projects}
                isCurrentUser={isCurrentUser}
                onAdd={handleAdd("project")}
                onEdit={handleEdit("project")}
            />

            {/* Experience Modal */}
            <ExperienceModal
                isOpen={isExperienceModalOpen}
                onClose={() => {
                    setIsExperienceModalOpen(false);
                    setEditingExperience(null);
                }}
                onSave={handleSaveExperience}
                onDelete={handleDeleteExperience}
                initialData={editingExperience ? {
                    ...editingExperience,
                    startDate: new Date(editingExperience.startDate),
                    endDate: editingExperience.endDate ? new Date(editingExperience.endDate) : null,
                } : undefined}
                isPending={addExperience.isPending || updateExperience.isPending}
            />
        </motion.div>
    );
}
