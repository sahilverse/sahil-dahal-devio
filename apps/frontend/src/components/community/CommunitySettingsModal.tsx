"use client";

import { useCommunitySettings, useUpdateCommunitySettings } from "@/hooks/useCommunity";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Switch } from "@/components/ui/switch";

interface CommunitySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    communityName: string;
}

export default function CommunitySettingsModal({
    isOpen,
    onClose,
    communityName,
}: CommunitySettingsModalProps) {
    const { data: settings, isLoading } = useCommunitySettings(communityName, isOpen);
    const updateMutation = useUpdateCommunitySettings(communityName);

    const [form, setForm] = useState({
        allowPostImages: true,
        allowPostLinks: true,
        requirePostApproval: false,
        minAuraToPost: 0,
        minAuraToComment: 0,
        minAuraToJoin: 0,
    });

    useEffect(() => {
        if (settings) {
            setForm({
                allowPostImages: settings.allowPostImages ?? true,
                allowPostLinks: settings.allowPostLinks ?? true,
                requirePostApproval: settings.requirePostApproval ?? false,
                minAuraToPost: settings.minAuraToPost ?? 0,
                minAuraToComment: settings.minAuraToComment ?? 0,
                minAuraToJoin: settings.minAuraToJoin ?? 0,
            });
        }
    }, [settings]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleSave = () => {
        updateMutation.mutate(form, {
            onSuccess: () => onClose(),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-card text-card-foreground border rounded-xl shadow-xl max-w-md w-full p-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Community Settings</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Toggle: Allow Images */}
                        <ToggleRow
                            label="Allow post images"
                            description="Let members attach images to posts"
                            checked={form.allowPostImages}
                            onChange={(v) => setForm({ ...form, allowPostImages: v })}
                        />

                        {/* Toggle: Allow Links */}
                        <ToggleRow
                            label="Allow post links"
                            description="Let members share links in posts"
                            checked={form.allowPostLinks}
                            onChange={(v) => setForm({ ...form, allowPostLinks: v })}
                        />

                        {/* Toggle: Require Approval */}
                        <ToggleRow
                            label="Require post approval"
                            description="Posts must be approved by moderators before appearing"
                            checked={form.requirePostApproval}
                            onChange={(v) => setForm({ ...form, requirePostApproval: v })}
                        />

                        {/* Min Aura to Post */}
                        <NumberRow
                            label="Min aura to post"
                            value={form.minAuraToPost}
                            onChange={(v) => setForm({ ...form, minAuraToPost: v })}
                        />

                        {/* Min Aura to Comment */}
                        <NumberRow
                            label="Min aura to comment"
                            value={form.minAuraToComment}
                            onChange={(v) => setForm({ ...form, minAuraToComment: v })}
                        />

                        {/* Min Aura to Join */}
                        <NumberRow
                            label="Min aura to join"
                            value={form.minAuraToJoin}
                            onChange={(v) => setForm({ ...form, minAuraToJoin: v })}
                        />

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                            <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer">Cancel</Button>
                            <Button
                                variant="brand"
                                size="sm"
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="cursor-pointer"
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ToggleRow({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

function NumberRow({ label, value, onChange }: {
    label: string; value: number; onChange: (v: number) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium">{label}</p>
            <input
                type="number"
                min={0}
                value={value.toString()}
                onChange={(e) => {
                    const val = e.target.value;
                    // Allow clearing the input (temporarily 0) or handle leading zeros
                    onChange(val === "" ? 0 : parseInt(val) || 0);
                }}
                className="w-20 px-2 py-1.5 bg-muted border border-border rounded-lg text-sm text-center text-foreground focus:outline-none focus:ring-1 focus:ring-brand-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
        </div>
    );
}
