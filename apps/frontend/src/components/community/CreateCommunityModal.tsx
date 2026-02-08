"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    X,
    ArrowLeft,
    Search,
    Globe,
    Lock,
    EyeOff,
    ChevronRight,
    Loader2,
    Users,
    MessageSquare,
    TrendingUp
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCreateCommunity } from "@/hooks/useCommunities";
import { useSearchTopics } from "@/hooks/useTopics";
import { createCommunitySchema, CreateCommunityInput, CommunityVisibility } from "@devio/zod-utils";

interface CreateCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STEPS = {
    TOPICS: 1,
    VISIBILITY: 2,
    INFO: 3,
};

const SUGGESTED_TOPICS = [
    "Programming", "Web Development", "Artificial Intelligence",
    "Cybersecurity", "DevOps", "Data Science", "Mobile Apps",
    "Career Advice", "Open Source", "Hardware", "Design"
];

export default function CreateCommunityModal({ isOpen, onClose }: CreateCommunityModalProps) {
    const [step, setStep] = useState(STEPS.TOPICS);
    const [topicSearch, setTopicSearch] = useState("");
    const { data: searchResults, isLoading: isSearching } = useSearchTopics(topicSearch);
    const createMutation = useCreateCommunity();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        setError,
        formState: { errors },
        reset
    } = useForm<CreateCommunityInput>({
        resolver: zodResolver(createCommunitySchema),
        defaultValues: {
            name: "",
            description: "",
            visibility: "PUBLIC",
            topics: [],
        },
    });

    const name = watch("name");
    const description = watch("description");
    const visibility = watch("visibility");
    const topics = watch("topics");

    // Close and reset
    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep(STEPS.TOPICS);
            reset();
        }, 300);
    };

    const handleNext = async () => {
        if (step === STEPS.TOPICS) {
            if (topics.length === 0) return;
            setStep(STEPS.VISIBILITY);
        } else if (step === STEPS.VISIBILITY) {
            setStep(STEPS.INFO);
        }
    };

    const handleBack = () => {
        if (step === STEPS.VISIBILITY) setStep(STEPS.TOPICS);
        if (step === STEPS.INFO) setStep(STEPS.VISIBILITY);
    };

    const toggletopic = (topic: string) => {
        const normalizedtopic = topic.toLowerCase().trim();
        const currenttopics = [...topics];
        const index = currenttopics.indexOf(normalizedtopic);
        if (index > -1) {
            currenttopics.splice(index, 1);
        } else if (currenttopics.length < 5) {
            currenttopics.push(normalizedtopic);
        }
        setValue("topics", currenttopics, { shouldValidate: true });
    };

    const onSubmit = (data: CreateCommunityInput) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                handleClose();
            },
            onError: (err: any) => {
                const { fieldErrors } = err;
                if (fieldErrors) {
                    Object.entries(fieldErrors).forEach(([field, message]) => {
                        setError(field as keyof CreateCommunityInput, {
                            type: "manual",
                            message: message as string,
                        });
                    });
                }
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                showCloseButton={true}
                className="w-full max-w-5xl lg:min-w-2xl p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-xl"
            >
                <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between border-b border-border">
                    <div className="flex items-center gap-3 mb-4">
                        {step > 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                className="h-8 w-8 rounded-full hover:bg-muted"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <DialogTitle className="text-xl font-bold">
                            {step === STEPS.TOPICS && "What will your community be about?"}
                            {step === STEPS.VISIBILITY && "What kind of community is this?"}
                            {step === STEPS.INFO && "Tell us about your community"}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="p-4">
                    {/* Step 1: Topics */}
                    {step === STEPS.TOPICS && (
                        <div className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                Choose up to 5 topics to help people discover your community.
                            </p>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                    placeholder="Search topics..."
                                    className="pl-10 !bg-transparent"
                                    value={topicSearch}
                                    onChange={(e) => setTopicSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap items-start gap-2 min-h-[100px]">
                                {(topicSearch && searchResults ? searchResults : SUGGESTED_TOPICS).map((topic: any) => {
                                    const topicName = (typeof topic === 'string' ? topic : topic.name).toLowerCase();
                                    const isSelected = topics.includes(topicName);
                                    return (
                                        <Badge
                                            key={topicName}
                                            variant={isSelected ? "default" : "secondary"}
                                            className={cn(
                                                "px-3 py-1 text-sm font-medium cursor-pointer transition-all rounded-md transition-colors",
                                                isSelected
                                                    ? "bg-brand-primary hover:bg-brand-primary/90 text-white border-transparent"
                                                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground border-transparent"
                                            )}
                                            onClick={() => toggletopic(topicName)}
                                        >
                                            <span className="opacity-50 mr-0.5">t/</span>
                                            {topicName}
                                        </Badge>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-border">
                                <p className="text-xs text-muted-foreground">
                                    {topics.length} / 5 topics selected
                                </p>
                                <Button
                                    variant="brand"
                                    onClick={handleNext}
                                    disabled={topics.length === 0}
                                    className="px-8 rounded-full"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Visibility */}
                    {step === STEPS.VISIBILITY && (
                        <div className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                Decide who can view and contribute to your community.
                            </p>

                            <RadioGroup
                                value={visibility}
                                onValueChange={(val: "PUBLIC" | "PRIVATE" | "RESTRICTED") => setValue("visibility", val)}
                                className="space-y-3"
                            >
                                <div className={cn(
                                    "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                    visibility === "PUBLIC" ? "border-brand-primary bg-brand-primary/5" : "border-border bg-card"
                                )} onClick={() => setValue("visibility", "PUBLIC")}>
                                    <Globe className="h-5 w-5 mt-1 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-bold cursor-pointer">Public</Label>
                                            <RadioGroupItem value="PUBLIC" id="public" />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Anyone can view, post, and comment to this community</p>
                                    </div>
                                </div>

                                <div className={cn(
                                    "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                    visibility === "RESTRICTED" ? "border-brand-primary bg-brand-primary/5" : "border-border bg-card"
                                )} onClick={() => setValue("visibility", "RESTRICTED")}>
                                    <EyeOff className="h-5 w-5 mt-1 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-bold cursor-pointer">Restricted</Label>
                                            <RadioGroupItem value="RESTRICTED" id="restricted" />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Anyone can view, but only approved users can contribute</p>
                                    </div>
                                </div>

                                <div className={cn(
                                    "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                    visibility === "PRIVATE" ? "border-brand-primary bg-brand-primary/5" : "border-border bg-card"
                                )} onClick={() => setValue("visibility", "PRIVATE")}>
                                    <Lock className="h-5 w-5 mt-1 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-bold cursor-pointer">Private</Label>
                                            <RadioGroupItem value="PRIVATE" id="private" />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Only approved users can view and contribute</p>
                                    </div>
                                </div>
                            </RadioGroup>

                            <div className="flex justify-end pt-4 border-t border-border">
                                <Button
                                    variant="brand"
                                    onClick={handleNext}
                                    className="px-8 rounded-full"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Info & Preview */}
                    {step === STEPS.INFO && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <span className="absolute left-3 top-[11px] text-sm text-muted-foreground font-medium z-10 pointer-events-none">
                                            d/
                                        </span>
                                        <Input
                                            {...register("name")}
                                            label="Community Name *"
                                            placeholder="Community Name *"
                                            error={errors.name?.message}
                                            disabled={createMutation.isPending}
                                            className="pl-7 !bg-transparent"
                                        />
                                        <div className="absolute right-3 top-[13px] pointer-events-none">
                                            <span className={cn(
                                                "text-[10px]",
                                                (name?.length || 0) > 20 ? "text-destructive" : "text-muted-foreground"
                                            )}>
                                                {name?.length || 0}/21
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Textarea
                                        {...register("description")}
                                        placeholder="Description (Optional)"
                                        className={cn(
                                            "min-h-[120px] !bg-transparent resize-none transition-all",
                                            errors.description && "border-destructive focus-visible:ring-destructive"
                                        )}
                                    />
                                    <div className="flex justify-between items-start">
                                        {errors.description ? (
                                            <p className="text-xs font-medium text-destructive ml-1">{errors.description.message}</p>
                                        ) : <div />}
                                        <span className={cn("text-[10px]", (description?.length || 0) > 500 ? "text-destructive" : "text-muted-foreground")}>
                                            {description?.length || 0}/500
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        variant="brand"
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={createMutation.isPending}
                                        className="w-full rounded-full h-11 text-base font-bold"
                                    >
                                        {createMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : "Create Community"}
                                    </Button>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="hidden md:block">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 block">Preview</Label>
                                <div className="rounded-xl overflow-hidden bg-background border border-border shadow-sm">
                                    <div className="h-16 bg-gradient-to-r from-brand-primary/40 to-brand-primary" />
                                    <div className="p-4 pt-0 -mt-8">
                                        <div className="flex items-end gap-3 mb-3">
                                            <div className="h-16 w-16 rounded-full border-4 border-background bg-brand-primary flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                                d/
                                            </div>
                                            <div className="mb-1">
                                                <h3 className="font-bold text-lg leading-none">d/{name || "communityname"}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">1 member</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                            {description || "A name and description help people understand what your community is all about."}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-1">
                                            {topics.map(topic => (
                                                <Badge key={topic} variant="secondary" className="text-[10px] h-5">
                                                    t/{topic}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>1 member</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>1 contributor</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-4 text-center px-4 leading-relaxed">
                                    By continuing, you agree to discover communities and contribute to the growth of Devio network.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Dots */}
                <div className="p-4 pt-0 flex justify-center gap-2">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 w-1.5 rounded-full transition-all",
                                step === i ? "bg-brand-primary w-4" : "bg-muted"
                            )}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
