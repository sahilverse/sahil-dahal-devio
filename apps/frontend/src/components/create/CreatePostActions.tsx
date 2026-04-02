"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { CreatePostFormData } from "@devio/zod-utils";

interface CreatePostActionsProps {
    isPending: boolean;
    isEdit?: boolean;
    onSaveDraft?: (data: CreatePostFormData) => void;
}

export default function CreatePostActions({ isPending, isEdit, onSaveDraft }: CreatePostActionsProps) {
    const { formState: { isValid }, getValues, watch } = useFormContext();
    const currentStatus = watch("status");

    const handleDraftClick = () => {
        if (onSaveDraft) {
            onSaveDraft(getValues() as CreatePostFormData);
        }
    };

    const showDraftButton = !(isEdit && currentStatus !== "DRAFT");

    return (
        <div className="flex items-center justify-end pt-2 gap-2 border-t border-border/20">
            {showDraftButton && (
                <Button
                    type="button"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-4 font-black text-sm cursor-pointer gap-2"
                    disabled={!isValid || isPending}
                    onClick={handleDraftClick}
                >
                    <Save className="h-4 w-4" />
                    {isEdit ? "Update Draft" : "Save Draft"}
                </Button>
            )}
            <Button
                type="submit"
                variant="brand"
                className="p-4 font-black text-sm transition-all cursor-pointer active:scale-[0.98] min-w-[100px]"
                disabled={!isValid || isPending}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEdit && currentStatus !== "DRAFT" ? "Updating..." : "Posting..."}
                    </>
                ) : (
                    isEdit && currentStatus !== "DRAFT" ? "Update Post" : "Post"
                )}
            </Button>
        </div>
    );
}
