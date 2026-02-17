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
import { Plus, Trash2, Trophy } from "lucide-react";

interface PrizesSectionProps {
    control: Control<any>;
}

export default function PrizesSection({ control }: PrizesSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "prizes",
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Event Prizes</h3>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ rank: fields.length + 1, prize: "", description: "" })}
                    className="h-8 px-3 rounded-lg border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Prize
                </Button>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-4 bg-muted/20 border border-border/50 rounded-2xl relative group transition-all hover:bg-muted/30">
                        <div className="md:col-span-2">
                            <FormField
                                control={control}
                                name={`prizes.${index}.rank`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Rank</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                className="h-10 border-border/50 focus:border-brand-primary rounded-xl shadow-none"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold text-destructive" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="md:col-span-4">
                            <FormField
                                control={control}
                                name={`prizes.${index}.prize`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Prize Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. Rs 500 Cash"
                                                className="h-10 border-border/50 focus:border-brand-primary rounded-xl shadow-none"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold text-destructive" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="md:col-span-5">
                            <FormField
                                control={control}
                                name={`prizes.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Details</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. Distributed via E-sewa"
                                                className="h-10 border-border/50 focus:border-brand-primary rounded-xl shadow-none"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold text-destructive" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="md:col-span-1 pt-6 flex justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {fields.length === 0 && (
                <div className="text-center py-6 px-4 bg-muted/10 rounded-2xl border border-dashed border-border/50">
                    <p className="text-xs text-muted-foreground">Specify the rewards for winners to attract more participants.</p>
                </div>
            )}
        </div>
    );
}
