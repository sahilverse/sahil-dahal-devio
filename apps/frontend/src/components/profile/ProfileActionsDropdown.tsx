import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Share2, Ban, ShieldAlert } from "lucide-react";
import { ReactNode } from "react";

interface ProfileActionsDropdownProps {
    onShare: () => void;
    children: ReactNode;
    isAuthenticated?: boolean;
    openLogin?: () => void;
}

export default function ProfileActionsDropdown({ onShare, children, isAuthenticated = false, openLogin }: ProfileActionsDropdownProps) {
    const handleBlockUser = () => {
        if (!isAuthenticated && openLogin) {
            openLogin();
            return;
        }
        // TODO: Implement block user logic
    };

    const handleReportUser = () => {
        if (!isAuthenticated && openLogin) {
            openLogin();
            return;
        }
        // TODO: Implement report user logic
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onShare} className="cursor-pointer">
                    <Share2 className="w-4 h-4 mr-2" /> Share Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBlockUser} className="cursor-pointer">
                    <Ban className="w-4 h-4 mr-2" /> Block User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReportUser} className="cursor-pointer">
                    <ShieldAlert className="w-4 h-4 mr-2" /> Report User
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
