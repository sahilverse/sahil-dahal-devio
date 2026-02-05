import { Experience } from "@/types/profile";
import { formatDateRange, calculateDuration } from "@/lib/date";
import { Briefcase, MapPin } from "lucide-react";
import AboutSection from "./AboutSection";
import ExpandableText from "./ExpandableText";

interface ExperienceSectionProps {
    experiences: Experience[];
    isCurrentUser?: boolean;
    onAdd?: () => void;
    onEdit?: () => void;
}

const TYPE_LABELS: Record<Experience["type"], string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    INTERNSHIP: "Internship",
    CONTRACT: "Contract",
    FREELANCE: "Freelance",
};

export default function ExperienceSection({
    experiences,
    isCurrentUser,
    onAdd,
    onEdit,
}: ExperienceSectionProps) {
    return (
        <AboutSection
            title="Experience"
            icon={<Briefcase className="h-5 w-5" />}
            isEmpty={experiences.length === 0}
            emptyMessage="No experience added yet"
            isCurrentUser={isCurrentUser}
            onAdd={onAdd}
            onEdit={onEdit}
        >
            {experiences.map((exp) => (
                <div key={exp.id} className="relative flex gap-4">
                    <div className="shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {exp.companyLogoUrl ? (
                            <img
                                src={exp.companyLogoUrl}
                                alt={exp.companyName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Briefcase className="h-6 w-6 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{exp.title}</h4>
                        <p className="text-sm text-muted-foreground">
                            {exp.companyName} · {TYPE_LABELS[exp.type]}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateRange(exp.startDate, exp.endDate, { isCurrent: exp.isCurrent })} · {calculateDuration(exp.startDate, exp.endDate)}
                        </p>
                        {exp.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {exp.location}
                            </p>
                        )}
                        {exp.description && (
                            <ExpandableText text={exp.description} className="mt-2" />
                        )}
                    </div>
                </div>
            ))}
        </AboutSection>
    );
}
