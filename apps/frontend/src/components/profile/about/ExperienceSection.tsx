import { Experience } from "@/types/profile";
import { formatDateRange, calculateDuration } from "@/lib/date";
import { Briefcase, MapPin, Pencil } from "lucide-react";
import AboutSection from "./AboutSection";
import ExpandableText from "./ExpandableText";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";

interface ExperienceSectionProps {
    experiences: Experience[];
    isCurrentUser?: boolean;
    onAdd?: () => void;
    onEditExperience?: (experience: Experience) => void;
}

export default function ExperienceSection({
    experiences,
    isCurrentUser,
    onAdd,
    onEditExperience,
}: ExperienceSectionProps) {
    return (
        <AboutSection
            title="Experience"
            icon={<Briefcase className="h-5 w-5" />}
            isEmpty={experiences.length === 0}
            emptyMessage="No experience added yet"
            isCurrentUser={isCurrentUser}
            onAdd={onAdd}
        >
            {experiences.map((exp) => (
                <div key={exp.id} className="relative group/item flex gap-4">
                    {isCurrentUser && onEditExperience && (
                        <button
                            onClick={() => onEditExperience(exp)}
                            className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <Pencil className="w-[14px] h-[14px]" />
                        </button>
                    )}
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
                            {exp.companyName} · {EMPLOYMENT_TYPE_LABELS[exp.type]}
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
