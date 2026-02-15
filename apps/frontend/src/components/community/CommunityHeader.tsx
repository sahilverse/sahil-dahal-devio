"use client";

import { Community } from "@/types/community";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
    ImagePlus,
    Plus,
    LogOut,
    MoreHorizontal,
    Share2,
    Check,
    Loader2,
    Clock
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";
import { useJoinCommunityPage, useLeaveCommunity, useUpdateCommunityMedia, useRemoveCommunityMedia } from "@/hooks/useCommunity";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { copyCurrentUrl } from "@/lib/string";
import ImageUploadModal from "@/components/profile/header/ImageUploadModal";
import CommunityNav from "@/components/community/CommunityNav";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";

interface CommunityHeaderProps {
    community: Community;
}

export default function CommunityHeader({ community }: CommunityHeaderProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();
    const [hasCopied, setHasCopied] = useState(false);
    const [isIconModalOpen, setIsIconModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

    const joinMutation = useJoinCommunityPage(community.name);
    const leaveMutation = useLeaveCommunity(community.name);
    const updateMediaMutation = useUpdateCommunityMedia(community.name);
    const removeMediaMutation = useRemoveCommunityMedia(community.name);

    const isMod = !!community.isMod;
    const isMember = !!community.isMember;

    const handleJoin = () => {
        if (!user) { openLogin(); return; }
        joinMutation.mutate(undefined);
    };

    const handleLeave = () => {
        setIsLeaveDialogOpen(true);
    };

    const confirmLeave = () => {
        leaveMutation.mutate(undefined, {
            onSuccess: () => setIsLeaveDialogOpen(false)
        });
    };

    const handleShare = async () => {
        await copyCurrentUrl();
        toast.success("Link copied to clipboard");
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleIconSave = (file: File) => {
        const formData = new FormData();
        formData.append("icon", file);
        updateMediaMutation.mutate(formData);
    };

    const handleBannerSave = (file: File) => {
        const formData = new FormData();
        formData.append("banner", file);
        updateMediaMutation.mutate(formData);
    };

    const handleIconRemove = () => {
        removeMediaMutation.mutate("icon");
    };

    const handleBannerRemove = () => {
        removeMediaMutation.mutate("banner");
    };

    return (
        <div className="flex flex-col relative bg-card rounded-lg border shadow-sm overflow-hidden">
            {/* Banner */}
            <div className="relative w-full aspect-[4/1] min-h-[120px] max-h-[300px]">
                {community.bannerUrl ? (
                    <Image
                        src={community.bannerUrl}
                        alt={`${community.name} banner`}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        unoptimized
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-brand-primary/30 to-brand-hover/30 dark:from-brand-primary/20 dark:to-brand-hover/20" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {isMod && (
                    <button
                        className="absolute top-2 right-2 z-20 bg-gray-500 dark:bg-gray-800 dark:text-primary text-white rounded-full p-2 shadow cursor-pointer"
                        type="button"
                        onClick={() => setIsBannerModalOpen(true)}
                    >
                        <ImagePlus className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Icon + Name + Actions */}
            <div className="px-3 lg:px-6 pb-4">
                <div className="relative flex justify-between items-end gap-4 -mt-12 mb-2">
                    {/* Top Row: Icon + Name */}
                    <div className="flex items-end gap-4">
                        <div className="relative inline-block shrink-0">
                            <Avatar className="h-24 w-24 border-4 border-card bg-card ring-1 ring-border/10 shadow-sm">
                                <AvatarImage src={community.iconUrl} className="object-cover" />
                                <AvatarFallback className="text-2xl font-bold dark:bg-gray-900 bg-gray-300 flex items-center justify-center">
                                    <Image src="/devio-logo.png" alt="Community" width={56} height={56} priority />
                                </AvatarFallback>
                            </Avatar>

                            {isMod && (
                                <button
                                    className="absolute bottom-0 right-0 z-20 bg-muted text-foreground border border-border rounded-full p-1.5 shadow-sm hover:bg-muted/80 cursor-pointer transition-colors"
                                    type="button"
                                    onClick={() => setIsIconModalOpen(true)}
                                >
                                    <ImagePlus className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="pb-1.5">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">d/{community.name}</h1>
                        </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex items-center gap-2">
                        {isMember && (
                            <Button variant="brand" className="font-semibold cursor-pointer h-9" asChild>
                                <Link href={`/create?community=${community.name}`}>
                                    <Plus className="w-4 h-4" /> Create Post
                                </Link>
                            </Button>
                        )}

                        {!isMember ? (
                            <Button
                                variant="brand"
                                className="font-semibold cursor-pointer px-6 h-9"
                                onClick={handleJoin}
                                disabled={joinMutation.isPending}
                            >
                                {joinMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : community.visibility === "PRIVATE" ? (
                                    <><Clock className="w-4 h-4" /> Request to Join</>
                                ) : (
                                    "Join"
                                )}
                            </Button>
                        ) : null}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card w-30">
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleShare}>
                                    {hasCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                                    {hasCopied ? "Copied!" : "Share"}
                                </DropdownMenuItem>

                                {isMember && (
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                        onClick={handleLeave}
                                        disabled={leaveMutation.isPending}
                                    >
                                        <LogOut className="h-4 w-4" /> Leave
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <CommunityNav isMod={isMod} />

            {/* Image Upload Modals */}
            <ImageUploadModal
                isOpen={isIconModalOpen}
                onClose={() => setIsIconModalOpen(false)}
                onSave={handleIconSave}
                onRemove={handleIconRemove}
                currentUrl={community.iconUrl}
                variant="avatar"
                title="Community icon"
            />

            <ImageUploadModal
                isOpen={isBannerModalOpen}
                onClose={() => setIsBannerModalOpen(false)}
                onSave={handleBannerSave}
                onRemove={handleBannerRemove}
                currentUrl={community.bannerUrl}
                variant="banner"
                title="Community banner"
            />

            <ConfirmDeleteModal
                isOpen={isLeaveDialogOpen}
                onClose={() => setIsLeaveDialogOpen(false)}
                onConfirm={confirmLeave}
                title="Leave Community?"
                description={`Are you sure you want to leave d/${community.name}? You will lose access to member-only features.`}
                isPending={leaveMutation.isPending}
            />
        </div>
    );
}
