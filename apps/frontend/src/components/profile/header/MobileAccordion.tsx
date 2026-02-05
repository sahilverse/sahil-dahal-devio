import { useState } from "react";
import { UserProfile } from "@/types/profile";
import { ChevronDown } from "lucide-react";
import { Stats, Socials, SettingsSection } from "../sidebar";

interface MobileAccordionProps {
    profile: UserProfile;
    isCurrentUser: boolean;
}

export default function MobileAccordion({ profile, isCurrentUser }: MobileAccordionProps) {
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    return (
        <div className="lg:hidden rounded-lg overflow-hidden border bg-card">
            <button
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="flex justify-between items-center w-full p-4 font-semibold hover:bg-accent/50 transition-colors cursor-pointer text-left"
            >
                <span>u/{profile.username}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isAccordionOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isAccordionOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 border-t bg-accent/20">
                        <div className="pt-4 space-y-4 divide-y">
                            <Stats profile={profile} isCurrentUser={isCurrentUser} />
                            <Socials socials={profile.socials} isCurrentUser={isCurrentUser} />
                            <SettingsSection isCurrentUser={isCurrentUser} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
