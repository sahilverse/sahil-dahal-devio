"use client";

import React from "react";
import { useFieldArray, Control } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, LayoutList } from "lucide-react";

interface RulesSectionProps {
    control: Control<any>;
}

export default function RulesSection({ control }: RulesSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "rules",
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LayoutList className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Event Rules</h3>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append("")}
                    className="h-8 px-3 rounded-lg border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Rule
                </Button>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <FormField
                        key={field.id}
                        control={control}
                        name={`rules.${index}`}
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={`Rule #${index + 1}`}
                                            className="h-10 border-border/50 focus:border-brand-primary rounded-xl shadow-none"
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="h-10 w-10 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <FormMessage className="text-[10px] font-bold text-destructive" />
                            </FormItem>
                        )}
                    />
                ))}
            </div>

            {fields.length === 0 && (
                <div className="text-center py-6 px-4 bg-muted/10 rounded-2xl border border-dashed border-border/50">
                    <p className="text-xs text-muted-foreground">No rules defined yet. Add some to clarify your event requirements.</p>
                </div>
            )}
        </div>
    );
}
