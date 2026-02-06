import { Project } from "@/types/profile";
import { formatDateRange } from "@/lib/date";
import { FolderGit2, ExternalLink, Pencil } from "lucide-react";
import AboutSection from "../AboutSection";
import ExpandableText from "../ExpandableText";
import { Button } from "@/components/ui/button";

interface ProjectSectionProps {
    projects: Project[];
    isCurrentUser?: boolean;
    onAdd?: () => void;
    onEdit?: (project: Project) => void;
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
        >
            <div className="space-y-6">
                {projects.map((project) => (
                    <div key={project.id} className="relative group/item flex gap-4">
                        {isCurrentUser && onEdit && (
                            <button
                                onClick={() => onEdit(project)}
                                className="absolute right-0 top-0 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer z-10"
                            >
                                <Pencil className="w-[14px] h-[14px]" />
                            </button>
                        )}
                        <div className="shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center border border-transparent transition-colors">
                            <FolderGit2 className="h-6 w-6 text-muted-foreground/70 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 min-w-0 pr-8">
                                <h4 className="font-medium text-sm truncate">{project.title}</h4>
                                {project.url && (
                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-brand-primary shrink-0 transition-colors"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {formatDateRange(project.startDate, project.endDate)}
                            </p>
                            {project.description && (
                                <ExpandableText text={project.description} className="mt-2 text-sm text-muted-foreground/80 leading-relaxed" />
                            )}
                            {project.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {project.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-muted/50 rounded-md text-muted-foreground/70 border border-border/30"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </AboutSection>
    );
}
