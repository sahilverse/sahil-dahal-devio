"use client";

import { UserProfile } from "@/types/profile";
import { motion } from "motion/react";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import CertificationSection from "./CertificationSection";
import ProjectSection from "./ProjectSection";
import SkillsSection from "./SkillsSection";

interface AboutProps {
    profile: UserProfile;
    isCurrentUser?: boolean;
}

export default function About({ profile, isCurrentUser = false }: AboutProps) {
    const handleAdd = (section: string) => () => {
        console.log(`Add ${section}`);
    };

    const handleEdit = (section: string) => () => {
        console.log(`Edit ${section}`);
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
                onAdd={handleAdd("experience")}
                onEdit={handleEdit("experience")}
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
        </motion.div>
    );
}
