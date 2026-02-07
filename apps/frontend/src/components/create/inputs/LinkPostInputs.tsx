"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";


export default function LinkPostInputs() {
    const { control } = useFormContext();

    return (
        <div
            className="space-y-6"
        >
            <FormField
                control={control}
                name="linkUrl"
                render={({ field }) => (
                    <FormItem className="space-y-1">
                        <div className="relative group overflow-hidden bg-transparent border border-muted-foreground/20 focus-within:border-foreground/80 transition-all rounded-[12px] px-4 py-2.5">
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Paste or type the URL here..."
                                    className="w-full h-auto min-h-[32px] text-base bg-transparent border-none placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 outline-none p-0 cursor-pointer focus:cursor-text shadow-none"
                                />
                            </FormControl>
                        </div>
                        <FormMessage className="text-[11px] font-bold text-destructive/80 ml-2" />
                    </FormItem>
                )}
            />
        </div>
    );
}
