import { Certification } from "@/types/profile";
import { Award, ExternalLink } from "lucide-react";
import AboutSection from "./AboutSection";

interface CertificationSectionProps {
    certifications: Certification[];
    isCurrentUser?: boolean;
    onAdd?: () => void;
    onEdit?: () => void;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function CertificationSection({
    certifications,
    isCurrentUser,
    onAdd,
    onEdit,
}: CertificationSectionProps) {
    return (
        <AboutSection
            title="Certifications"
            icon={<Award className="h-5 w-5" />}
            isEmpty={certifications.length === 0}
            emptyMessage="No certifications added yet"
            isCurrentUser={isCurrentUser}
            onAdd={onAdd}
            onEdit={onEdit}
        >
            {certifications.map((cert) => (
                <div key={cert.id} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">{cert.issuingOrg}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Issued {formatDate(cert.issueDate)}
                            {cert.expirationDate && ` · Expires ${formatDate(cert.expirationDate)}`}
                        </p>
                        {cert.credentialId && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Credential ID: {cert.credentialId}
                            </p>
                        )}
                        {cert.credentialUrl && (
                            <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-brand-primary hover:underline mt-1"
                            >
                                Show credential
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </AboutSection>
    );
}
