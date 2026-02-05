import { Project } from "@/types/profile";
import { formatDateRange } from "@/lib/date";
import { FolderGit2, ExternalLink } from "lucide-react";
import AboutSection from "./AboutSection";
import ExpandableText from "./ExpandableText";

interface ProjectSectionProps {
    projects: Project[];
    isCurrentUser?: boolean;
    onAdd?: () => void;
    onEdit?: () => void;
}

export default function ProjectSection({
    projects,
    isCurrentUser,
    onAdd,
    onEdit,
}: ProjectSectionProps) {
    return (
        <AboutSection
            title="Projects"
            icon={<FolderGit2 className="h-5 w-5" />}
            isEmpty={projects.length === 0}
            emptyMessage="No projects added yet"
            isCurrentUser={isCurrentUser}
            onAdd={onAdd}
            onEdit={onEdit}
        >
            {projects.map((project) => (
                <div key={project.id} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <FolderGit2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{project.title}</h4>
                            {project.url && (
                                <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-brand-primary"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateRange(project.startDate, project.endDate)}
                        </p>
                        {project.description && (
                            <ExpandableText text={project.description} className="mt-2" />
                        )}
                        {project.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {project.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-2 py-0.5 text-xs bg-muted rounded-full text-muted-foreground"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </AboutSection>
    );
}
