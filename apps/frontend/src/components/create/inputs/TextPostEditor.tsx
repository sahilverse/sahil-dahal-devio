"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import TiptapEditor from "./TiptapEditor";
import MediaUploadBox from "./MediaUploadBox";

export default function TextPostEditor() {
    const { control } = useFormContext();

    return (
        <div className="space-y-4">
            <MediaUploadBox />

            <FormField
                control={control}
                name="content"
                render={({ field }) => (
                    <FormItem className="space-y-0">
                        <FormControl>
                            <TiptapEditor
                                content={field.value}
                                onChange={field.onChange}
                                placeholder="Body text (optional)"
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormMessage className="text-xs font-bold text-destructive/80 ml-2" />
        </div>
    );
}
