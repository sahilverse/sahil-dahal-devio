import { useState } from "react";
import { UserProfile, Experience, Education } from "@/types/profile";
import { motion } from "motion/react";
import ExperienceSection from "./experience/ExperienceSection";
import EducationSection from "./education/EducationSection";
import CertificationSection from "./certifications/CertificationSection";
import ProjectSection from "./projects/ProjectSection";
import SkillsSection from "./skills/SkillsSection";
import ExperienceModal from "./experience/ExperienceModal";
import EducationModal from "./education/EducationModal";
import SkillsModal from "./skills/SkillsModal";
import { useManageExperience } from "@/hooks/useExperience";
import { useManageEducation } from "@/hooks/useEducation";
import { useManageSkills } from "@/hooks/useSkills";
import { logger } from "@/lib/logger";

interface AboutProps {
    profile: UserProfile;
    isCurrentUser?: boolean;
}

export default function About({ profile, isCurrentUser = false }: AboutProps) {
    const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);

    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

    const { addExperience, updateExperience, deleteExperience } = useManageExperience(profile.username);
    const { addEducation, updateEducation, deleteEducation } = useManageEducation(profile.username);
    const { addSkill, removeSkill } = useManageSkills(profile.username);

    const handleAdd = (section: string) => () => {
        console.log(`Add ${section}`);
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
            await deleteExperience.mutateAsync(id);
            setIsExperienceModalOpen(false);
            setEditingExperience(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveEducation = async (data: any) => {
        try {
            if (editingEducation) {
                await updateEducation.mutateAsync({ id: editingEducation.id, payload: data });
            } else {
                await addEducation.mutateAsync(data);
            }
            setIsEducationModalOpen(false);
            setEditingEducation(null);
        } catch (error) {
            logger.error(error);
        }
    };

    const handleAddEducation = () => {
        setEditingEducation(null);
        setIsEducationModalOpen(true);
    };

    const handleEditEducation = (edu: Education) => {
        setEditingEducation(edu);
        setIsEducationModalOpen(true);
    };

    const handleDeleteEducation = async (id: string) => {
        try {
            await deleteEducation.mutateAsync(id);
            setIsEducationModalOpen(false);
            setEditingEducation(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddSkill = async (name: string) => {
        try {
            await addSkill.mutateAsync(name);
        } catch (error) {
            logger.error(error);
        }
    };

    const handleRemoveSkill = async (id: string) => {
        try {
            await removeSkill.mutateAsync(id);
        } catch (error) {
            logger.error(error);
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
                onAdd={handleAddEducation}
                onEditEducation={handleEditEducation}
            />

            <SkillsSection
                skills={profile.skills}
                isCurrentUser={isCurrentUser}
                onAdd={() => setIsSkillsModalOpen(true)}
            />

            <CertificationSection
                certifications={profile.certifications}
                isCurrentUser={isCurrentUser}
                onAdd={handleAdd("certification")}
            />

            <ProjectSection
                projects={profile.projects}
                isCurrentUser={isCurrentUser}
                onAdd={handleAdd("project")}
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

            {/* Education Modal */}
            <EducationModal
                isOpen={isEducationModalOpen}
                onClose={() => {
                    setIsEducationModalOpen(false);
                    setEditingEducation(null);
                }}
                onSave={handleSaveEducation}
                onDelete={handleDeleteEducation}
                initialData={editingEducation ? {
                    ...editingEducation,
                    startDate: new Date(editingEducation.startDate),
                    endDate: editingEducation.endDate ? new Date(editingEducation.endDate) : null,
                } : undefined}
                isPending={addEducation.isPending || updateEducation.isPending}
            />

            {/* Skills Modal */}
            <SkillsModal
                isOpen={isSkillsModalOpen}
                onClose={() => setIsSkillsModalOpen(false)}
                skills={profile.skills}
                onAdd={handleAddSkill}
                onRemove={handleRemoveSkill}
                isAdding={addSkill.isPending}
                isRemoving={removeSkill.isPending ? removeSkill.variables : null}
            />
        </motion.div>
    );
}
