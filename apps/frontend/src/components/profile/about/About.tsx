import { useState } from "react";
import { motion } from "motion/react";
import ExperienceSection from "./experience/ExperienceSection";
import EducationSection from "./education/EducationSection";
import CertificationSection from "./certifications/CertificationSection";
import ProjectSection from "./projects/ProjectSection";
import SkillsSection from "./skills/SkillsSection";
import ExperienceModal from "./experience/ExperienceModal";
import EducationModal from "./education/EducationModal";
import CertificationModal from "./certifications/CertificationModal";
import SkillsModal from "./skills/SkillsModal";
import { ProjectModal } from "./projects/ProjectModal";
import { useManageExperience } from "@/hooks/useExperience";
import { useManageEducation } from "@/hooks/useEducation";
import { useManageSkills } from "@/hooks/useSkills";
import { useManageProjects } from "@/hooks/useProjects";
import { useUserAbout } from "@/hooks/useProfile";
import { logger } from "@/lib/logger";
import { Loader2 } from "lucide-react";

import type { UserProfile, Experience, Education, Certification, Project, UserAbout } from "@/types/profile";

interface AboutProps {
    profile: UserProfile;
    isCurrentUser: boolean;
}

export default function About({ profile, isCurrentUser }: AboutProps) {
    const { data: aboutData, isLoading: isAboutLoading } = useUserAbout(profile.username);

    const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);

    const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false);
    const [editingCertification, setEditingCertification] = useState<Certification | null>(null);

    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const { addExperience, updateExperience, deleteExperience } = useManageExperience(profile.username);
    const { addEducation, updateEducation, deleteEducation } = useManageEducation(profile.username);
    const { addSkill, removeSkill } = useManageSkills(profile.username);
    const { addProject, updateProject, deleteProject } = useManageProjects(profile.username);

    if (isAboutLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                <p className="text-sm animate-pulse">Loading resume details...</p>
            </div>
        );
    }

    const { experiences = [], educations = [], certifications = [], projects = [], skills = [] } = aboutData || {};


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

    const handleAddCertification = () => {
        setEditingCertification(null);
        setIsCertificationModalOpen(true);
    };

    const handleEditCertification = (cert: Certification) => {
        setEditingCertification(cert);
        setIsCertificationModalOpen(true);
    };

    const handleAddProject = () => {
        setEditingProject(null);
        setIsProjectModalOpen(true);
    };

    const handleEditProject = (proj: Project) => {
        setEditingProject(proj);
        setIsProjectModalOpen(true);
    };

    const handleSaveProject = async (data: any) => {
        try {
            if (editingProject) {
                await updateProject.mutateAsync({ id: editingProject.id, payload: data });
            } else {
                await addProject.mutateAsync(data);
            }
            setIsProjectModalOpen(false);
            setEditingProject(null);
        } catch (error) {
            logger.error(error);
        }
    };

    const handleDeleteProject = async (id: string) => {
        try {
            await deleteProject.mutateAsync(id);
            setIsProjectModalOpen(false);
            setEditingProject(null);
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
                experiences={experiences}
                isCurrentUser={isCurrentUser}
                onAdd={handleAddExperience}
                onEditExperience={handleEditExperience}
            />

            <EducationSection
                educations={educations}
                isCurrentUser={isCurrentUser}
                onAdd={handleAddEducation}
                onEditEducation={handleEditEducation}
            />

            <CertificationSection
                certifications={certifications}
                isCurrentUser={isCurrentUser}
                onAdd={handleAddCertification}
                onEdit={handleEditCertification}
            />

            <ProjectSection
                projects={projects}
                isCurrentUser={isCurrentUser}
                onAdd={handleAddProject}
                onEdit={handleEditProject}
            />

            <SkillsSection
                skills={skills}
                isCurrentUser={isCurrentUser}
                onAdd={() => setIsSkillsModalOpen(true)}
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
                skills={skills}
                onAdd={handleAddSkill}
                onRemove={handleRemoveSkill}
                isAdding={addSkill.isPending}
                isRemoving={removeSkill.isPending ? removeSkill.variables : null}
            />

            {/* Certification Modal */}
            <CertificationModal
                isOpen={isCertificationModalOpen}
                onClose={() => {
                    setIsCertificationModalOpen(false);
                    setEditingCertification(null);
                }}
                username={profile.username}
                initialData={editingCertification}
            />

            {/* Project Modal */}
            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => {
                    setIsProjectModalOpen(false);
                    setEditingProject(null);
                }}
                initialData={editingProject || undefined}
                onSave={handleSaveProject}
                onDelete={handleDeleteProject}
                isPending={addProject.isPending || updateProject.isPending}
            />
        </motion.div>
    );
}
