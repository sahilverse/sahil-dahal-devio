"use client";

import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";

export default function TitleInput() {
    const { control, watch } = useFormContext();
    const title = watch("title") || "";

    return (
        <FormField
            control={control}
            name="title"
            render={({ field }) => (
                <FormItem className="space-y-1">
                    <div className="relative group overflow-hidden bg-transparent border border-muted-foreground/20 focus-within:border-foreground/80 transition-all rounded-[12px] px-4 py-2.5">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[11px] font-bold text-muted-foreground/50 tracking-wide uppercase">
                                Title<span className="text-destructive/80 ml-0.5">*</span>
                            </span>
                        </div>
                        <FormControl>
                            <textarea
                                {...field}
                                placeholder="Post Title"
                                className="w-full h-auto max-h-[30px] text-md bg-transparent border-none placeholder:text-muted-foreground/30 resize-none overflow-hidden cursor-pointer focus:cursor-text outline-none p-0"
                                maxLength={300}
                                autoComplete="off"
                                rows={1}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = "auto";
                                    target.style.height = `${target.scrollHeight}px`;
                                }}
                            />
                        </FormControl>
                    </div>
                    <div className="flex justify-end px-1">
                        <div className="text-[11px] font-bold text-muted-foreground/40 tabular-nums uppercase tracking-tight pointer-events-none transition-colors">
                            {title.length} / 300
                        </div>
                    </div>
                    <FormMessage className="text-[11px] font-bold text-destructive/80 ml-2" />
                </FormItem>
            )}
        />
    );
}

