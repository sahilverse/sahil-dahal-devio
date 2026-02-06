import { Education } from "@/types/profile";
import { formatDateRange } from "@/lib/date";
import { GraduationCap, Pencil } from "lucide-react";
import AboutSection from "../AboutSection";
import ExpandableText from "../ExpandableText";

interface EducationSectionProps {
    educations: Education[];
    isCurrentUser?: boolean;
    onAdd?: () => void;
    onEditEducation?: (education: Education) => void;
}

export default function EducationSection({
    educations,
    isCurrentUser,
    onAdd,
    onEditEducation,
}: EducationSectionProps) {
    return (
        <AboutSection
            title="Education"
            icon={<GraduationCap className="h-5 w-5" />}
            isEmpty={educations.length === 0}
            emptyMessage="No education added yet"
            isCurrentUser={isCurrentUser}
            onAdd={onAdd}
        >
            {educations.map((edu) => (
                <div key={edu.id} className="relative group/item flex gap-4">
                    {isCurrentUser && onEditEducation && (
                        <button
                            onClick={() => onEditEducation(edu)}
                            className="absolute right-0 top-0 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <Pencil className="w-[14px] h-[14px]" />
                        </button>
                    )}
                    <div className="shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{edu.school}</h4>
                        <p className="text-sm text-muted-foreground">
                            {edu.degree}{edu.degree && edu.fieldOfStudy ? ", " : ""}{edu.fieldOfStudy}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateRange(edu.startDate, edu.endDate, { showMonth: true })}
                        </p>
                        {edu.grade && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Grade: {edu.grade}
                            </p>
                        )}
                        {edu.activities && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/80">Activities:</span> {edu.activities}
                            </div>
                        )}
                        {edu.description && (
                            <ExpandableText text={edu.description} className="mt-2" />
                        )}
                    </div>
                </div>
            ))}
        </AboutSection>
    );
}
