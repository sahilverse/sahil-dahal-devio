"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Check, Loader2, Plus } from "lucide-react";
import { useSearchTopics } from "@/hooks/useTopics";
import { useDebounce } from "@/hooks/useDebounce";
import { cn, formatCompactNumber } from "@/lib/utils";

export default function TopicSelector() {
    const { control, setValue, watch } = useFormContext<any>();
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const selectedTopics = watch("topics") || [];

    const debouncedSearch = useDebounce(inputValue, 300);
    const { data: suggestions, isLoading: isSearching } = useSearchTopics(debouncedSearch);

    const handleSelect = (topicName: string) => {
        const cleanTopic = topicName.replace(/^t\//, "").toLowerCase().trim();
        if (cleanTopic && selectedTopics.length < 5 && !selectedTopics.includes(cleanTopic)) {
            setValue("topics", [...selectedTopics, cleanTopic]);
            setInputValue("");
            setOpen(false);
        }
    };

    const handleRemove = (topicToRemove: string) => {
        setValue("topics", selectedTopics.filter((t: string) => t !== topicToRemove));
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {selectedTopics.map((topic: string) => (
                    <Badge
                        key={topic}
                        variant="secondary"
                        className="px-3 py-1 text-sm font-medium bg-secondary/50 hover:bg-secondary/70 transition-colors gap-1"
                    >
                        <span className="opacity-50 mr-0.5">t/</span>
                        {topic}
                        <button
                            type="button"
                            onClick={() => handleRemove(topic)}
                            className="ml-1 hover:text-destructive focus:outline-none cursor-pointer"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            <FormField
                control={control}
                name="topics"
                render={() => (
                    <Popover open={open} onOpenChange={setOpen} >
                        <PopoverTrigger asChild>
                            <div
                                role="combobox"
                                aria-expanded={open}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-text",
                                    selectedTopics.length >= 5 && "opacity-50 cursor-not-allowed hidden"
                                )}
                                onClick={() => selectedTopics.length < 5 && setOpen(true)}
                            >
                                <span className={cn("text-muted-foreground", selectedTopics.length > 0 && "hidden")}>
                                    {selectedTopics.length >= 5 ? "Max 5 topics reached" : "Add Topics"}
                                </span>
                                {selectedTopics.length > 0 && selectedTopics.length < 5 && (
                                    <span className="text-muted-foreground">Add more...</span>
                                )}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 bg-background border-border" align="start" side="bottom">
                            <Command shouldFilter={false}>
                                <CommandInput
                                    placeholder="t/ Search topics..."
                                    value={inputValue}
                                    onValueChange={setInputValue}
                                />
                                <CommandList>
                                    {isSearching ? (
                                        <div className="py-6 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                                        </div>
                                    ) : (
                                        <>
                                            <CommandEmpty className="py-2 px-4 text-sm text-muted-foreground">
                                                {inputValue ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelect(inputValue)}
                                                        className="flex items-center gap-2 w-full text-left hover:text-primary transition-colors group"
                                                    >
                                                        <div className="bg-primary/10 p-1 rounded-md group-hover:bg-primary/20">
                                                            <Plus className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <span>Create <span className="font-semibold text-foreground">"{inputValue}"</span></span>
                                                    </button>
                                                ) : (
                                                    "No topics found."
                                                )}
                                            </CommandEmpty>
                                            <CommandGroup heading="Suggestions">
                                                {suggestions?.map((topic: any) => (
                                                    <CommandItem
                                                        key={topic.id}
                                                        value={topic.name}
                                                        onSelect={() => handleSelect(topic.name)}
                                                        className="cursor-pointer"
                                                    >
                                                        <span className="opacity-50 mr-1">t/</span>
                                                        {topic.name}
                                                        {selectedTopics.includes(topic.name) && (
                                                            <Check className="ml-auto h-4 w-4 opacity-50" />
                                                        )}
                                                        {topic.count !== undefined && (
                                                            <span className="ml-auto text-xs text-muted-foreground">
                                                                {formatCompactNumber(topic.count)}
                                                            </span>
                                                        )}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            />
            <FormField
                control={control}
                name="topics"
                render={() => <FormMessage className="text-[11px] font-bold text-destructive/80 ml-1" />}
            />
        </div>
    );
}
