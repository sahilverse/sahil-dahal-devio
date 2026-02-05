import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types/profile";
import { Github, Linkedin, Twitter, Globe, Link as LinkIcon, Facebook, Instagram, Youtube, Plus } from "lucide-react";
import Link from "next/link";

interface SocialsProps {
    socials: UserProfile["socials"];
    isCurrentUser: boolean;
}

export default function Socials({ socials, isCurrentUser }: SocialsProps) {
    const hasSocials = socials && Object.keys(socials).length > 0;

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

    const getLabel = (key: string) => {
        return key.charAt(0).toUpperCase() + key.slice(1);
    };

    return (
        <div className="flex flex-col gap-3 pb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">On the Web</h3>

            <div className="flex flex-wrap gap-2 items-center">
                {Object.entries(socials || {}).map(([key, url]) => (
                    <Button
                        key={key}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 px-0 rounded-full text-foreground hover:text-primary hover:border-primary transition-colors bg-card"
                        asChild
                    >
                        <Link href={url} target="_blank" rel="noopener noreferrer" aria-label={getLabel(key)} title={getLabel(key)}>
                            {getIcon(key)}
                        </Link>
                    </Button>
                ))}

                {isCurrentUser && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-4 rounded-full text-xs font-semibold cursor-pointer gap-2"
                        asChild
                    >
                        <Link href="/settings/profile">
                            <Plus className="w-4 h-4" />
                            Add Social Link
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
