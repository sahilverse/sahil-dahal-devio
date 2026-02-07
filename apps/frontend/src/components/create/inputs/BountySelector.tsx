"use client";

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const BOUNTY_OPTIONS = [50, 100, 250, 500];

export default function BountySelector() {
    const { control, setValue, watch } = useFormContext();
    const bountyAmount = watch("bountyAmount");

    return (
        <FormField
            control={control}
            name="bountyAmount"
            render={({ field }) => (
                <FormItem className="space-y-3">
                    <div className="mt-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground/80">Question Bounty</h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {BOUNTY_OPTIONS.map((amount) => (
                            <button
                                key={amount}
                                type="button"
                                onClick={() => setValue("bountyAmount", amount)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl border font-bold text-sm transition-all flex items-center gap-2 cursor-pointer",
                                    bountyAmount === amount
                                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                                        : "bg-transparent border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                                )}
                            >
                                <span className="opacity-70 text-xs">🪙</span> {amount}
                            </button>
                        ))}

                        <div className="relative flex-1 min-w-[120px]">
                            <input
                                type="text"
                                placeholder="Custom"
                                value={BOUNTY_OPTIONS.includes(bountyAmount) ? "" : (bountyAmount || "")}
                                onChange={(e) => setValue("bountyAmount", parseInt(e.target.value) || 0)}
                                className="w-full h-full px-5 py-2.5 bg-transparent border border-muted-foreground/20 focus:border-foreground/80 rounded-xl text-sm font-bold outline-none transition-all placeholder:text-muted-foreground/30"
                            />
                        </div>
                    </div>
                    <FormMessage className="text-[11px] font-bold text-destructive/80 ml-2" />
                </FormItem>
            )}
        />
    );
}
