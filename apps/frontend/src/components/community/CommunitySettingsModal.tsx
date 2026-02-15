"use client";

import { useCommunitySettings, useUpdateCommunitySettings } from "@/hooks/useCommunity";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ui/modals/ConfirmModal";

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
        description: "",
        visibility: "PUBLIC" as "PUBLIC" | "PRIVATE" | "RESTRICTED",
        allowPostImages: true,
        allowPostLinks: true,
        requirePostApproval: false,
        minAuraToPost: 0,
        minAuraToComment: 0,
        minAuraToJoin: 0,
    });
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const isDirty = settings ? (
        form.description !== (settings.description || "") ||
        form.visibility !== settings.visibility ||
        form.allowPostImages !== (settings.allowPostImages ?? true) ||
        form.allowPostLinks !== (settings.allowPostLinks ?? true) ||
        form.requirePostApproval !== (settings.requirePostApproval ?? false) ||
        form.minAuraToPost !== (settings.minAuraToPost ?? 0) ||
        form.minAuraToComment !== (settings.minAuraToComment ?? 0) ||
        form.minAuraToJoin !== (settings.minAuraToJoin ?? 0)
    ) : false;

    useEffect(() => {
        if (isOpen && settings) {
            setForm({
                description: settings.description || "",
                visibility: settings.visibility || "PUBLIC",
                allowPostImages: settings.allowPostImages ?? true,
                allowPostLinks: settings.allowPostLinks ?? true,
                requirePostApproval: settings.requirePostApproval ?? false,
                minAuraToPost: settings.minAuraToPost ?? 0,
                minAuraToComment: settings.minAuraToComment ?? 0,
                minAuraToJoin: settings.minAuraToJoin ?? 0,
            });
        }
    }, [settings, isOpen]);

    const handleCancel = () => {
        if (isDirty) {
            setShowDiscardConfirm(true);
        } else {
            onClose();
        }
    };

    const handleSave = () => {
        updateMutation.mutate(form, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
                <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl bg-card gap-0">
                    {/* Header */}
                    <DialogHeader className="px-6 py-4 border-b border-border/50 text-left">
                        <div className="flex flex-col gap-0.5">
                            <DialogTitle className="text-lg font-bold tracking-tight">Community Settings</DialogTitle>
                            <p className="text-xs text-muted-foreground">Manage d/{communityName} configuration</p>
                        </div>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar max-h-[75vh]">
                            {/* Section: Identity */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">General</h3>

                                <div className="space-y-6 bg-muted/20 p-5 rounded-2xl border border-border/40">
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold px-1">Description</label>
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Add a brief description..."
                                            className="w-full min-h-[100px] p-3.5 text-sm bg-transparent mt-1 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-muted-foreground/40 resize-none shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold px-1 text-muted-foreground/80">Community Type</label>
                                        <Select
                                            value={form.visibility}
                                            onValueChange={(v: any) => setForm({ ...form, visibility: v })}
                                        >
                                            <SelectTrigger className="w-full !flex h-auto min-h-[64px] bg-transparent border-border/60 rounded-xl shadow-sm hover:bg-muted/30 transition-all px-4 py-3 text-left items-center justify-between group cursor-pointer [*_[data-slot=select-value]]:!flex [*_[data-slot=select-value]]:!flex-col [*_[data-slot=select-value]]:!items-start [*_[data-slot=select-value]]:!line-clamp-none mt-1">
                                                <SelectValue placeholder="Select visibility" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-xl border-border/60">
                                                <SelectItem value="PUBLIC" className="rounded-lg focus:bg-brand-primary/10 cursor-pointer py-3">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-bold text-sm text-foreground">Public</span>
                                                        <span className="text-[11px] text-muted-foreground leading-relaxed">Anyone can view, post, and comment</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="RESTRICTED" className="rounded-lg focus:bg-brand-primary/10 cursor-pointer py-3">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-bold text-sm text-foreground">Restricted</span>
                                                        <span className="text-[11px] text-muted-foreground leading-relaxed">Anyone can view, but only approved users can post</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="PRIVATE" className="rounded-lg focus:bg-brand-primary/10 cursor-pointer py-3">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-bold text-sm text-foreground">Private</span>
                                                        <span className="text-[11px] text-muted-foreground leading-relaxed">Only approved members can view and participate</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Content Control */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Permissions</h3>

                                <div className="divide-y divide-border/30 bg-muted/20 rounded-2xl border border-border/40 overflow-hidden">
                                    <ToggleRow
                                        label="Allow post images"
                                        description="Let members share images in posts"
                                        checked={form.allowPostImages}
                                        onChange={(v) => setForm({ ...form, allowPostImages: v })}
                                    />
                                    <ToggleRow
                                        label="Allow post links"
                                        description="Let members share external links"
                                        checked={form.allowPostLinks}
                                        onChange={(v) => setForm({ ...form, allowPostLinks: v })}
                                    />
                                    <ToggleRow
                                        label="Require post approval"
                                        description="Mods must approve posts before they go live"
                                        checked={form.requirePostApproval}
                                        onChange={(v) => setForm({ ...form, requirePostApproval: v })}
                                    />
                                </div>
                            </div>

                            {/* Section: Engagement Thresholds */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Thresholds</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-card/20 p-4 rounded-2xl border border-border/40">
                                    <NumberRow
                                        label="Min aura to join"
                                        value={form.minAuraToJoin}
                                        onChange={(v) => setForm({ ...form, minAuraToJoin: v })}
                                    />
                                    <NumberRow
                                        label="Min aura to post"
                                        value={form.minAuraToPost}
                                        onChange={(v) => setForm({ ...form, minAuraToPost: v })}
                                    />
                                    <NumberRow
                                        label="Min aura to comment"
                                        value={form.minAuraToComment}
                                        onChange={(v) => setForm({ ...form, minAuraToComment: v })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-muted/10 border-t border-border/50 flex items-center justify-end gap-3">
                        <Button variant="ghost" size="sm" onClick={handleCancel} className="rounded-xl h-10 px-6 font-medium cursor-pointer">
                            Cancel
                        </Button>
                        <Button
                            variant="brand"
                            size="sm"
                            onClick={handleSave}
                            disabled={updateMutation.isPending || !isDirty}
                            className="rounded-xl h-10 px-8 font-bold cursor-pointer shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={showDiscardConfirm}
                onClose={() => setShowDiscardConfirm(false)}
                onConfirm={() => {
                    setShowDiscardConfirm(false);
                    onClose();
                }}
                title="Discard Changes"
                description="You have unsaved changes. Are you sure you want to discard them?"
                confirmText="Discard"
                variant="warning"
            />
        </>
    );
}

function ToggleRow({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 p-4 hover:bg-muted/20 transition-colors ">
            <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground/90">{label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

function NumberRow({ label, value, onChange }: {
    label: string; value: number; onChange: (v: number) => void;
}) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-card border border-border/40 rounded-xl shadow-sm">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-0.5">
                {label}
            </label>
            <div className="relative group">
                <input
                    type="number"
                    min={0}
                    value={value.toString()}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(val === "" ? 0 : parseInt(val) || 0);
                    }}
                    className="w-full h-9 pl-3 pr-2 bg-transparent text-sm font-bold text-foreground focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-primary/0 group-focus-within:bg-brand-primary/40 transition-all rounded-full" />
            </div>
        </div>
    );
}
