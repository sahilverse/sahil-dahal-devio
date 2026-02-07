"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CreatePostActionsProps {
    isPending: boolean;
    onSaveDraft?: () => void;
}

export default function CreatePostActions({ isPending, onSaveDraft }: CreatePostActionsProps) {
    const { formState: { isValid } } = useFormContext();

    return (
        <div className="flex items-center justify-end pt-2 gap-2 border-t border-border/20">
            <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-4 font-black text-sm cursor-pointer"
                disabled={!isValid || isPending}
                onClick={onSaveDraft}
            >
                Save Draft
            </Button>
            <Button
                type="submit"
                variant="brand"
                className="p-4 font-black text-sm transition-all cursor-pointer active:scale-[0.98] min-w-[100px]"
                disabled={!isValid || isPending}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                    </>
                ) : (
                    "Post Now"
                )}
            </Button>
        </div>
    );
}
