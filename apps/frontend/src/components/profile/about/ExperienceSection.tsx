import { Experience } from "@/types/profile";
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

function formatDateRange(startDate: string, endDate: string | null, isCurrent: boolean): string {
    const start = new Date(startDate);
    const startStr = start.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    if (isCurrent) {
        return `${startStr} - Present`;
    }

    if (endDate) {
        const end = new Date(endDate);
        const endStr = end.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        return `${startStr} - ${endStr}`;
    }

    return startStr;
}

function calculateDuration(startDate: string, endDate: string | null): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) {
        return `${years} yr ${remainingMonths} mo`;
    } else if (years > 0) {
        return `${years} yr`;
    } else {
        return `${remainingMonths} mo`;
    }
}

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
                            {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)} · {calculateDuration(exp.startDate, exp.endDate)}
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
