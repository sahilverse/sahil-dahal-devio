import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types/profile";
import { Award, ChevronRight } from "lucide-react";
import Image from "next/image";

interface AchievementsProps {
    achievements: UserProfile["achievements"];
    isCurrentUser: boolean;
}

export default function Achievements({ achievements, isCurrentUser }: AchievementsProps) {
    if (!achievements || achievements.latest.length === 0) return null;

    const { latest, total } = achievements;
    const names = latest.map(a => a.name);
    let summaryText = names.join(", ");

    const otherCount = total - latest.length;
    if (otherCount > 0) {
        summaryText += `, +${otherCount} more`;
    }

    return (
        <div className="flex flex-col gap-3 pb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Achievements</h3>

            <div className="flex gap-2 items-center">
                <div className="flex -space-x-4 shrink-0">
                    {latest.map((achv, i) => (
                        <div key={achv.id} className="relative w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden z-[10-i]">
                            {achv.iconUrl ? (
                                <Image src={achv.iconUrl} alt={achv.name} fill className="object-cover" />
                            ) : (
                                <Award className="w-5 h-5 text-primary" />
                            )}
                        </div>
                    ))}
                </div>

                <p className="text-[12px] max-w-42">
                    {summaryText}
                </p>
            </div>

            {
                isCurrentUser && <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-semibold text-muted-foreground">
                        {total} unlocked
                    </span>

                    <Button variant="secondary" size="sm" className="h-8 px-4 rounded-full text-xs font-semibold cursor-pointer">
                        View All
                    </Button>
                </div>
            }
        </div>
    );
}
