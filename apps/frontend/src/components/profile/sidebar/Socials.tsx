import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types/profile";
import { capitalize } from "@/lib/string";
import { Github, Linkedin, Twitter, Globe, Link as LinkIcon, Facebook, Instagram, Youtube, Plus } from "lucide-react";
import Link from "next/link";
import { useUpdateProfile } from "@/hooks/useProfile";
import ProfileSocialsModal from "./ProfileSocialsModal";

interface SocialsProps {
    profile: UserProfile;
    isCurrentUser: boolean;
}

export default function Socials({ profile, isCurrentUser }: SocialsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutate: updateProfile, isPending } = useUpdateProfile(profile.username);

    const socials = (profile.socials || {}) as Record<string, string | null>;
    const activeSocials = Object.entries(socials).filter(([_, url]) => url !== null);
    const hasSocials = activeSocials.length > 0;

    if (!hasSocials && !isCurrentUser) return null;

    const getIcon = (key: string) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes("github")) return <Github className="w-5 h-5" />;
        if (lowerKey.includes("linkedin")) return <Linkedin className="w-5 h-5" />;
        if (lowerKey.includes("twitter") || lowerKey.includes("x.com")) return <Twitter className="w-5 h-5" />;
        if (lowerKey.includes("facebook")) return <Facebook className="w-5 h-5" />;
        if (lowerKey.includes("instagram")) return <Instagram className="w-5 h-5" />;
        if (lowerKey.includes("youtube")) return <Youtube className="w-5 h-5" />;
        if (lowerKey.includes("website")) return <Globe className="w-5 h-5" />;
        return <LinkIcon className="w-5 h-5" />;
    };

    const handleSave = (data: any) => {
        updateProfile(data, {
            onSuccess: () => setIsModalOpen(false)
        });
    };

    return (
        <div className="flex flex-col gap-3 pb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">On the Web</h3>

            <div className="flex flex-wrap gap-2 items-center">
                {activeSocials.map(([key, url]) => (
                    <Button
                        key={key}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 px-0 rounded-full text-foreground hover:text-primary hover:border-primary transition-colors bg-card"
                        asChild
                    >
                        <Link href={url as string} target="_blank" rel="noopener noreferrer" aria-label={capitalize(key)} title={capitalize(key)}>
                            {getIcon(key)}
                        </Link>
                    </Button>
                ))}

                {isCurrentUser && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-4 rounded-full text-xs font-semibold cursor-pointer gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Social Link
                    </Button>
                )}
            </div>

            <ProfileSocialsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={socials || {}}
                isPending={isPending}
            />
        </div>
    );
}
