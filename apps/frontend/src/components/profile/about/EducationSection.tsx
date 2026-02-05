import { Education } from "@/types/profile";
import { formatDateRange } from "@/lib/date";
import { GraduationCap } from "lucide-react";
import AboutSection from "./AboutSection";

interface EducationSectionProps {
    educations: Education[];
    isCurrentUser?: boolean;
    onAdd?: () => void;
    onEdit?: () => void;
}

export default function EducationSection({
    educations,
    isCurrentUser,
    onAdd,
    onEdit,
}: EducationSectionProps) {
    return (
        <AboutSection
            title="Education"
            icon={<GraduationCap className="h-5 w-5" />}
            isEmpty={educations.length === 0}
            emptyMessage="No education added yet"
            isCurrentUser={isCurrentUser}
            onAdd={onAdd}
            onEdit={onEdit}
        >
            {educations.map((edu) => (
                <div key={edu.id} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{edu.school}</h4>
                        <p className="text-sm text-muted-foreground">
                            {edu.degree}, {edu.fieldOfStudy}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateRange(edu.startDate, edu.endDate, { showMonth: false })}
                        </p>
                        {edu.grade && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Grade: {edu.grade}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </AboutSection>
    );
}
