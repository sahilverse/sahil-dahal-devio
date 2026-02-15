"use client";

import { useCommunityRules, useUpdateCommunityRules } from "@/hooks/useCommunity";
import { CommunityRule } from "@/types/community";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityRulesEditorProps {
    isOpen: boolean;
    onClose: () => void;
    communityName: string;
}

export default function CommunityRulesEditor({
    isOpen,
    onClose,
    communityName,
}: CommunityRulesEditorProps) {
    const { data: rules, isLoading } = useCommunityRules(communityName);
    const updateMutation = useUpdateCommunityRules(communityName);

    const [ruleList, setRuleList] = useState<CommunityRule[]>([]);

    useEffect(() => {
        if (rules) {
            const ruleArray = Array.isArray(rules)
                ? rules
                : Array.isArray(rules?.rules)
                    ? rules.rules
                    : [];
            setRuleList(ruleArray as CommunityRule[]);
        }
    }, [rules]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const addRule = () => {
        setRuleList([...ruleList, { title: "", description: "" }]);
    };

    const removeRule = (idx: number) => {
        setRuleList(ruleList.filter((_, i) => i !== idx));
    };

    const updateRule = (idx: number, field: keyof CommunityRule, value: string) => {
        const updated = [...ruleList];
        updated[idx] = { ...updated[idx], [field]: value };
        setRuleList(updated);
    };

    const handleSave = () => {
        const filtered = ruleList.filter((r) => r.title.trim() !== "");
        updateMutation.mutate({ rules: filtered }, {
            onSuccess: () => onClose(),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-card text-card-foreground border rounded-xl shadow-xl max-w-lg w-full p-6 overflow-hidden max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Community Rules</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {ruleList.map((rule, idx) => (
                                <div key={idx} className="border border-border/50 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-muted-foreground shrink-0">
                                            {idx + 1}
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Rule title"
                                            value={rule.title}
                                            onChange={(e) => updateRule(idx, "title", e.target.value)}
                                            className="flex-1 bg-transparent border-b border-border/50 text-sm font-medium text-foreground focus:outline-none focus:border-primary pb-1 placeholder:text-muted-foreground/50"
                                        />
                                        <button
                                            onClick={() => removeRule(idx)}
                                            className="text-muted-foreground hover:text-destructive cursor-pointer"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <textarea
                                        placeholder="Rule description (optional)"
                                        value={rule.description}
                                        onChange={(e) => updateRule(idx, "description", e.target.value)}
                                        rows={2}
                                        className="w-full bg-muted/30 border border-border/30 rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 p-2 resize-none placeholder:text-muted-foreground/50"
                                    />
                                </div>
                            ))}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addRule}
                                className="w-full border border-dashed border-border/50 cursor-pointer text-xs text-muted-foreground"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Rule
                            </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-border/50 mt-4">
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
                                ) : "Save Rules"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
