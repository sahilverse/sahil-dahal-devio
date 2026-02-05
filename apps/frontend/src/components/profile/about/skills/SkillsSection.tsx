import { Skill } from "@/types/profile";
import { Wrench } from "lucide-react";
import AboutSection from "../AboutSection";

interface SkillsSectionProps {
    skills: Skill[];
    isCurrentUser?: boolean;
    onAdd?: () => void;
}

export default function SkillsSection({
    skills,
    isCurrentUser,
    onAdd,
}: SkillsSectionProps) {
    return (
        <AboutSection
            title="Skills"
            icon={<Wrench className="h-5 w-5" />}
            isEmpty={skills.length === 0}
            emptyMessage="No skills added yet"
            isCurrentUser={isCurrentUser}
            onAdd={onAdd}
        >
            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span
                        key={skill.id}
                        className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full text-foreground cursor-default transition-colors"
                    >
                        {skill.name}
                    </span>
                ))}
            </div>
        </AboutSection>
    );
}
