import { Button } from "@/components/ui/button";
import { User, Settings } from "lucide-react";
import Link from "next/link";

interface ProfileSettingsSectionProps {
    isCurrentUser: boolean;
}

export default function ProfileSettingsSection({ isCurrentUser }: ProfileSettingsSectionProps) {
    if (!isCurrentUser) return null;

    return (
        <div className="flex flex-col gap-4 pb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Settings</h3>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">Profile</span>
                        <span className="text-xs text-muted-foreground">Customize your profile</span>
                    </div>
                </div>

                <Button variant="secondary" size="sm" className="h-8 px-4 rounded-full text-xs font-semibold cursor-pointer" asChild>
                    <Link href="/settings/profile">
                        Update
                    </Link>
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">Account</span>
                        <span className="text-xs text-muted-foreground">Manage your account</span>
                    </div>
                </div>

                <Button variant="secondary" size="sm" className="h-8 px-4 rounded-full text-xs font-semibold cursor-pointer" asChild>
                    <Link href="/settings/account">
                        Update
                    </Link>
                </Button>
            </div>
        </div>
    );
}
