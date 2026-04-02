"use client";

import { PostResponseDto } from "@/types/post";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDeletePost } from "@/hooks/usePosts";
import { useState } from "react";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";

interface DraftCardProps {
    post: PostResponseDto;
}

export default function DraftCard({ post }: DraftCardProps) {
    const deleteMutation = useDeletePost();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDelete = () => {
        deleteMutation.mutate(post.id, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            }
        });
    };

    return (
        <div className="group flex items-center justify-between p-4 bg-transparent border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
            <div className="flex flex-col gap-1 min-w-0 pr-4">
                <Link href={`/edit/${post.id}`} className="text-base font-medium text-foreground truncate hover:underline hover:text-brand-primary transition-colors">
                    {post.title || "Untitled Draft"}
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                    <span>Edited {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}</span>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                    <Link href={`/edit/${post.id}`}>
                        <Pencil className="h-4 w-4" />
                    </Link>
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => setIsDeleteModalOpen(true)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Discard Draft"
                description="Are you sure you want to completely discard this draft? This action cannot be undone."
                isPending={deleteMutation.isPending}
            />
        </div>
    );
}
