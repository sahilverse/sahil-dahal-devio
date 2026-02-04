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
}

export default function ProfileActionsDropdown({ onShare, children }: ProfileActionsDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onShare} className="cursor-pointer">
                    <Share2 className="w-4 h-4 mr-2" /> Share Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <Ban className="w-4 h-4 mr-2" /> Block User
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <ShieldAlert className="w-4 h-4 mr-2" /> Report User
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
