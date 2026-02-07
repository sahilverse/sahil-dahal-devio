"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Form } from "@/components/ui/form";
import { PostType, PostStatus } from "@devio/zod-utils";

const frontendPostSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal(PostType.TEXT),
        title: z.string().min(1, "Title is required").max(300),
        content: z.string().optional(),
        communityId: z.cuid().optional(),
        topics: z.array(z.string()).max(5).optional(),
        status: z.enum(PostStatus),
        media: z.array(z.instanceof(File)).max(10).optional(),
    }),
    z.object({
        type: z.literal(PostType.LINK),
        title: z.string().min(1, "Title is required").max(300),
        linkUrl: z.url("Invalid URL"),
        communityId: z.cuid().optional(),
        topics: z.array(z.string()).max(5).optional(),
        status: z.enum(PostStatus),
    }),
    z.object({
        type: z.literal(PostType.QUESTION),
        title: z.string().min(1, "Title is required").max(300),
        content: z.string().optional(),
        communityId: z.cuid().optional(),
        topics: z.array(z.string()).max(5).optional(),
        status: z.enum(PostStatus),
        bountyAmount: z.number().int().min(0).optional(),
        media: z.array(z.instanceof(File)).max(10).optional(),
    }),
]);

export type CreatePostFormData = z.infer<typeof frontendPostSchema>;

interface CreatePostFormProps {
    children: ReactNode;
    onSubmit: (data: CreatePostFormData) => void;
    isPending: boolean;
}

export default function CreatePostForm({ children, onSubmit, isPending }: CreatePostFormProps) {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get("type")?.toUpperCase() as PostType;

    const form = useForm<CreatePostFormData>({
        resolver: zodResolver(frontendPostSchema),
        mode: "onChange",
        defaultValues: {
            type: PostType.TEXT,
            title: "",
            content: "",
            topics: [],
            status: PostStatus.PUBLISHED,
            media: [],
        } as any,
    });

    useEffect(() => {
        if (typeParam && [PostType.TEXT, PostType.LINK, PostType.QUESTION].includes(typeParam)) {
            form.setValue("type", typeParam as any);

            if (typeParam === PostType.LINK) {
                form.setValue("media" as any, []);
                form.setValue("bountyAmount" as any, undefined);
            } else if (typeParam === PostType.TEXT) {
                form.setValue("linkUrl" as any, undefined);
                form.setValue("bountyAmount" as any, undefined);
            } else if (typeParam === PostType.QUESTION) {
                form.setValue("linkUrl" as any, undefined);
            }
        } else {
            form.setValue("type", PostType.TEXT);
            form.setValue("linkUrl" as any, undefined);
            form.setValue("bountyAmount" as any, undefined);
        }
    }, [typeParam, form]);

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
