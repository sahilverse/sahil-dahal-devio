"use client";

import React, { useState } from "react";
import {
    Star,
    MoreVertical,
    Pencil,
    Trash2,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CourseReview } from "@/types/course";

interface ReviewItemProps {
    review: CourseReview;
    currentUserId?: string;
    onUpdate: (data: { reviewId: string; rating: number; comment: string }) => void;
    onDelete: (reviewId: string) => void;
    isUpdating: boolean;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
    review,
    currentUserId,
    onUpdate,
    onDelete,
    isUpdating
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editRating, setEditRating] = useState(review.rating);
    const [editComment, setEditComment] = useState(review.comment || "");

    const handleSave = async () => {
        if (!editComment.trim()) return;
        onUpdate({
            reviewId: review.id,
            rating: editRating,
            comment: editComment
        });
    };

    // Close editing when update is successful
    React.useEffect(() => {
        if (!isUpdating) {
            setIsEditing(false);
        }
    }, [isUpdating]);

    return (
        <div className="p-8 rounded-[2.5rem] bg-card/10 border border-border/5 hover:border-primary/10 transition-all group backdrop-blur-sm space-y-4 relative">
            {currentUserId === review.user?.id && (
                <div className="absolute top-6 right-6 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="size-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl bg-popover/80 backdrop-blur-xl border-white/10">
                            <DropdownMenuItem
                                onClick={() => {
                                    setIsEditing(true);
                                    setEditRating(review.rating);
                                    setEditComment(review.comment || "");
                                }}
                                className="gap-2 cursor-pointer focus:bg-primary/10 rounded-lg"
                            >
                                <Pencil className="size-4" /> Edit Review
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(review.id)}
                                className="gap-2 cursor-pointer text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 rounded-lg"
                            >
                                <Trash2 className="size-4" /> Delete Review
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src={review.user?.avatarUrl!}
                        className="size-12 rounded-2xl border-2 border-border/50 group-hover:scale-110 transition-transform duration-500"
                        alt={review.user?.username}
                    />
                    <div className="space-y-0.5">
                        <p className="font-black text-[11px] text-primary tracking-widest uppercase">{review.user?.username}</p>
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        onClick={() => setEditRating(star)}
                                        className={`size-4 cursor-pointer transition-transform hover:scale-110 ${editRating >= star ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'}`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`size-3 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest italic">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-4 pt-2">
                    <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full bg-background/50 border border-primary/20 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/10 outline-none resize-none min-h-[100px]"
                    />
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                            className="rounded-xl font-bold text-[10px] uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            disabled={isUpdating || !editComment.trim()}
                            onClick={handleSave}
                            className="rounded-xl font-black text-[10px] uppercase tracking-widest px-4"
                        >
                            {isUpdating ? <Loader2 className="size-3 animate-spin mr-2" /> : <CheckCircle2 className="size-3 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-sm font-medium leading-relaxed tracking-tight text-foreground/80 pl-2 border-l-2 border-primary/10 italic">
                    &ldquo;{review.comment}&rdquo;
                </p>
            )}
        </div>
    );
};
