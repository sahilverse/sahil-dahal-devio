"use client";

import { Wrench, X, Loader2 } from "lucide-react";
import { Skill } from "@/types/profile";
import { SkillSearchSelect } from "./SkillSearchSelect";
import { Badge } from "@/components/ui/badge";

interface SkillsFormProps {
    skills: Skill[];
    onAdd: (name: string) => void;
    onRemove: (id: string) => void;
    isAdding?: boolean;
    isRemoving?: string | null;
}

export function SkillsForm({
    skills,
    onAdd,
    onRemove,
    isAdding,
    isRemoving
}: SkillsFormProps) {
    return (
        <div className="p-4 space-y-6 overflow-y-auto min-h-auto">
            {/* Add Skill Section */}
            <div className="space-y-4">
                <SkillSearchSelect
                    onSkillSelect={(skill) => onAdd(skill.name)}
                    onSkillCreate={(name) => onAdd(name)}
                />
                {isAdding && (
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary animate-pulse ml-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Adding skill...
                    </div>
                )}
            </div>

            {/* Current Skills Section */}
            <div className="space-y-4">
                <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                    My Skills ({skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                        skills.map((skill) => (
                            <Badge
                                key={skill.id}
                                variant="secondary"
                                className="pl-3 pr-1 py-1.5 flex items-center gap-1.5 bg-zinc-100 dark:bg-muted/40 hover:bg-zinc-200 dark:hover:bg-muted/60 border-zinc-200 dark:border-muted/50 group transition-all rounded-md shadow-sm"
                            >
                                <span className="text-sm font-medium text-foreground">{skill.name}</span>
                                <button
                                    onClick={() => onRemove(skill.id)}
                                    disabled={!!isRemoving}
                                    className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground/50 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {isRemoving === skill.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <X className="h-3.5 w-3.5" />
                                    )}
                                </button>
                            </Badge>
                        ))
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center py-8 text-center bg-muted/10 rounded-xl border-2 border-dashed border-muted/50">
                            <p className="text-sm text-muted-foreground font-medium italic">
                                No skills added yet.
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Start by searching in the field above
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
