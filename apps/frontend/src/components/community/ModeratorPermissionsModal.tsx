"use client";

import { useUpdateModeratorPermissions } from "@/hooks/useCommunity";
import UserAvatar from "@/components/navbar/UserAvatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ModeratorPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    communityName: string;
    user: {
        id: string;
        username: string;
        avatarUrl?: string;
    };
    currentPermissions?: Record<string, boolean>;
    isInvite?: boolean;
}

const PERMISSION_LABELS = {
    everything: "Full Access (Manage Everything)",
    manageUsers: "Manage Users (Ban, Mute, Approve Members)",
    manageConfig: "Manage Settings (Community Look, Rules, Config)",
    managePostsAndComments: "Manage Content (Approve/Remove Posts & Comments)",
    manageEvents: "Manage Events (Create, Edit, Delete, Manual Scoring)",
};

export default function ModeratorPermissionsModal({
    isOpen,
    onClose,
    communityName,
    user,
    currentPermissions,
    isInvite = false,
}: ModeratorPermissionsModalProps) {
    const updateMutation = useUpdateModeratorPermissions(communityName);
    const [permissions, setPermissions] = useState<Record<string, boolean>>({
        everything: false,
        manageUsers: false,
        manageConfig: false,
        managePostsAndComments: false,
        manageEvents: false,
    });

    useEffect(() => {
        if (isOpen) {
            if (currentPermissions) {
                setPermissions({
                    everything: !!currentPermissions.everything,
                    manageUsers: !!currentPermissions.manageUsers,
                    manageConfig: !!currentPermissions.manageConfig,
                    managePostsAndComments: !!currentPermissions.managePostsAndComments,
                    manageEvents: !!currentPermissions.manageEvents,
                });
            } else if (isInvite) {
                setPermissions({
                    everything: true,
                    manageUsers: true,
                    manageConfig: true,
                    managePostsAndComments: true,
                    manageEvents: true,
                });
            }
        }
    }, [isOpen, currentPermissions, isInvite]);

    const handleChange = (key: string, checked: boolean) => {
        if (key === "everything") {
            setPermissions({
                everything: checked,
                manageUsers: checked,
                manageConfig: checked,
                managePostsAndComments: checked,
                manageEvents: checked,
            });
        } else {
            const next = { ...permissions, [key]: checked };
            if (!checked) next.everything = false;
            const allSpecifics = ["manageUsers", "manageConfig", "managePostsAndComments", "manageEvents"];
            if (allSpecifics.every(k => next[k])) next.everything = true;

            setPermissions(next);
        }
    };

    const handleSave = () => {
        updateMutation.mutate({
            userId: user.id,
            isMod: true,
            permissions,
        }, {
            onSuccess: () => onClose()
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card">
                <DialogHeader>
                    <DialogTitle>{isInvite ? "Add Moderator" : "Edit Permissions"}</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-3 py-4 border-b border-border/50">
                    <UserAvatar
                        user={{ username: user.username, avatarUrl: user.avatarUrl }}
                        size="md"
                    />
                    <div>
                        <p className="font-semibold text-sm">u/{user.username}</p>
                        <p className="text-xs text-muted-foreground">Select permissions for this moderator</p>
                    </div>
                </div>

                <div className="space-y-4 py-4">
                    {/* Full Access Toggle */}
                    <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/20">
                        <Checkbox
                            id="perm-everything"
                            checked={permissions.everything}
                            className="cursor-pointer"
                            onCheckedChange={(c: boolean | string) => handleChange("everything", c as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="perm-everything" className="text-sm font-semibold cursor-pointer">
                                {PERMISSION_LABELS.everything}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Grants all permissions, including managing other moderators.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 pl-1">
                        {["manageUsers", "manageConfig", "managePostsAndComments", "manageEvents"].map((key) => (
                            <div key={key} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`perm-${key}`}
                                    checked={permissions[key]}
                                    className="cursor-pointer"
                                    onCheckedChange={(c: boolean | string) => handleChange(key, c as boolean)}
                                />
                                <Label htmlFor={`perm-${key}`} className="text-sm cursor-pointer font-normal">
                                    {PERMISSION_LABELS[key as keyof typeof PERMISSION_LABELS]}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Permissions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
