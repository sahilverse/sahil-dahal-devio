"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Form } from "@/components/ui/form";
import { PostType, PostStatus, CreatePostFormData, frontendPostSchema } from "@devio/zod-utils";
import { useCommunity } from "@/hooks/useCommunity";



import { PostResponseDto } from "@/types/post";

interface CreatePostFormProps {
    children: ReactNode;
    onSubmit: (data: CreatePostFormData) => void;
    isPending: boolean;
    initialData?: PostResponseDto;
    isEdit?: boolean;
}

export default function CreatePostForm({ children, onSubmit, isPending, initialData, isEdit }: CreatePostFormProps) {
    const searchParams = useSearchParams();
    const typeParam = (initialData?.type as PostType) || (searchParams.get("type")?.toUpperCase() as PostType);

    const form = useForm<CreatePostFormData>({
        resolver: zodResolver(frontendPostSchema),
        mode: "onChange",
        defaultValues: {
            type: initialData?.type || PostType.TEXT,
            title: initialData?.title || "",
            content: initialData?.content || "",
            linkUrl: initialData?.linkUrl || "",
            bountyAmount: initialData?.bountyAmount || 0,
            topics: initialData?.topics?.map(t => t.name) || [],
            status: initialData?.status === "DRAFT" ? PostStatus.DRAFT : PostStatus.PUBLISHED,
            media: [],
        } as any,
    });

    const communityParam = searchParams.get("community");
    const { data: communityData } = useCommunity(communityParam || "");

    useEffect(() => {
        if (typeParam && [PostType.TEXT, PostType.LINK, PostType.QUESTION].includes(typeParam)) {
            form.setValue("type", typeParam as any);

            if (typeParam === PostType.LINK) {
                form.setValue("media" as any, []);
                form.setValue("bountyAmount" as any, 0);
            } else if (typeParam === PostType.TEXT) {
                form.setValue("linkUrl" as any, "");
                form.setValue("bountyAmount" as any, 0);
            } else if (typeParam === PostType.QUESTION) {
                form.setValue("linkUrl" as any, "");
            }
        } else {
            form.setValue("type", PostType.TEXT);
            form.setValue("linkUrl" as any, "");
            form.setValue("bountyAmount" as any, 0);
        }

        if (communityParam && communityData) {
            form.setValue("communityId", communityData.id);
        }
    }, [typeParam, form, communityParam, communityData]);

    const handleSubmit = (data: CreatePostFormData) => {
        onSubmit(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
                <fieldset disabled={isPending} className="contents">
                    {children}
                </fieldset>
            </form>
        </Form>
    );
}
