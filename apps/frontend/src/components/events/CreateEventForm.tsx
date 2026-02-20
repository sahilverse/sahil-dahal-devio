"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, CreateEventInput, EventType, EventStatus, EventVisibility } from "@devio/zod-utils";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Trophy,
    ShieldCheck,
    Users2,
} from "lucide-react";
import { EventService } from "@/api/eventService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EventCommunitySelector from "./EventCommunitySelector";
import RulesSection from "./RulesSection";
import PrizesSection from "./PrizesSection";
import EventImageUpload from "./EventImageUpload";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { Switch } from "@/components/ui/switch";

interface CreateEventFormProps {
    initialCommunityId?: string;
    initialData?: any;
    isEditing?: boolean;
}

export default function CreateEventForm({ initialCommunityId, initialData, isEditing }: CreateEventFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isImageRemoved, setIsImageRemoved] = useState(false);

    const { user } = useSelector((state: RootState) => state.auth);
    const { openLogin } = useAuthModal();

    React.useEffect(() => {
        if (!user && !isEditing) {
            openLogin();
        }
    }, [user, openLogin, isEditing]);

    const form = useForm<CreateEventInput>({
        resolver: zodResolver(createEventSchema) as any,
        mode: "onBlur",
        defaultValues: initialData ? {
            ...initialData,
            communityId: initialData.communityId || initialData.community?.id || initialCommunityId || "",
            startsAt: new Date(initialData.startsAt).toISOString().slice(0, 16),
            endsAt: new Date(initialData.endsAt).toISOString().slice(0, 16),
            registrationDeadline: initialData.registrationDeadline ? new Date(initialData.registrationDeadline).toISOString().slice(0, 16) : "",
            type: initialData.type as any,
            status: initialData.status as any,
            requiresTeam: initialData.requiresTeam ?? false,
            teamSize: initialData.teamSize ?? 2,
            maxParticipants: initialData.maxParticipants ?? "",
            externalUrl: initialData.externalUrl ?? "",
            imageUrl: initialData.imageUrl ?? "",
            visibility: initialData.visibility ?? EventVisibility.PUBLIC,
        } : {
            title: "",
            description: "",
            type: EventType.HACKATHON,
            communityId: initialCommunityId || initialData?.community?.id || "",
            startsAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
            endsAt: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
            maxParticipants: "",
            minAuraPoints: 0,
            entryCipherCost: 0,
            rules: [],
            prizes: [],
            status: EventStatus.PUBLISHED,
            visibility: EventVisibility.PUBLIC,
            requiresTeam: false,
            teamSize: 2,
        },
    });

    const onSubmit = async (data: CreateEventInput) => {
        if (step !== 3) return;
        setIsLoading(true);
        try {
            const formattedData = {
                ...data,
                startsAt: new Date(data.startsAt).toISOString(),
                endsAt: new Date(data.endsAt).toISOString(),
                registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : undefined,
            };

            if (isEditing && initialData?.id) {
                await EventService.updateEvent(initialData.id, formattedData as any);
                if (imageFile) {
                    await EventService.uploadEventImage(initialData.id, imageFile);
                } else if (isImageRemoved && initialData.imageUrl) {
                    await EventService.removeEventImage(initialData.id);
                }
                toast.success("Event updated successfully!");
                router.push(`/events/${initialData.slug}`);
            } else {
                const result = await EventService.createEvent(formattedData as any);
                if (imageFile) {
                    await EventService.uploadEventImage(result.id, imageFile);
                }
                toast.success("Event created successfully!");
                router.push(`/events/${result.slug}`);
            }
        } catch (error: any) {
            toast.error(error.errorMessage || `Failed to ${isEditing ? "update" : "create"} event`);
            setIsLoading(false);
        }
    };

    const nextStep = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let fieldsToValidate: string[] = [];
        if (step === 1) fieldsToValidate = ["title", "description", "type", "communityId"];
        else if (step === 2) fieldsToValidate = ["maxParticipants", "minAuraPoints", "entryCipherCost", "rules", "prizes"];

        const isValid = await form.trigger(fieldsToValidate as any);
        if (isValid) setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Header with Brand Pattern */}
            <div className="bg-card dark:bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                    <Calendar className="w-48 h-48 rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">
                            <ShieldCheck className="w-3 h-3" /> Event Platform
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground">
                            {isEditing ? "Modify Event" : "Organize New Event"}
                        </h2>
                        <p className="text-muted-foreground font-medium max-w-lg">
                            {step === 1 && "Start by setting the core details and visibility for your event."}
                            {step === 2 && "Define the rules, participation requirements, and prize structure."}
                            {step === 3 && "Review and finalize the schedule and registration details."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditing && (
                            <div className="flex items-center gap-1.5 px-4 py-2 bg-muted/40 rounded-xl border border-border/50 shadow-inner">
                                <span className={`h-2 w-2 rounded-full transition-all duration-300 ${step >= 1 ? "bg-brand-primary shadow-[0_0_8px_rgba(88,101,242,0.4)] scale-110" : "bg-muted-foreground/20"}`} />
                                <span className={`h-2 w-2 rounded-full transition-all duration-300 ${step >= 2 ? "bg-brand-primary shadow-[0_0_8px_rgba(88,101,242,0.4)] scale-110" : "bg-muted-foreground/20"}`} />
                                <span className={`h-2 w-2 rounded-full transition-all duration-300 ${step >= 3 ? "bg-brand-primary shadow-[0_0_8px_rgba(88,101,242,0.4)] scale-110" : "bg-muted-foreground/20"}`} />
                                <span className="text-[10px] font-bold text-muted-foreground ml-2 tabular-nums">STEP {step} OF 3</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="p-1 px-2 border-l-4 border-brand-primary bg-brand-primary/5 rounded-r-lg">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary">Event Identity</h3>
                                    </div>

                                    <FormField
                                        control={form.control as any}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Title</FormLabel>
                                                <div className="relative group">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Winter Hackathon 2024"
                                                            className="h-12 border-border/50 focus:border-brand-primary transition-all rounded-xl shadow-none pr-16"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/30 group-focus-within:text-brand-primary/50 tabular-nums transition-colors pointer-events-none">
                                                        {field.value?.length || 0}/100
                                                    </div>
                                                </div>
                                                <FormMessage className="text-[10px] font-bold text-destructive" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control as any}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 border-border/50 focus:border-brand-primary transition-all rounded-xl shadow-none cursor-pointer">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                                        {Object.values(EventType).map((type) => (
                                                            <SelectItem key={type} value={type} className="cursor-pointer focus:bg-brand-primary/10 rounded-md m-1 font-medium italic">
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px] font-bold text-destructive" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control as any}
                                        name="communityId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hosting In</FormLabel>
                                                <EventCommunitySelector value={field.value} onChange={field.onChange} />
                                                <FormMessage className="text-[10px] font-bold text-destructive" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control as any}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col h-full">
                                            <div className="p-1 px-2 border-l-4 border-brand-primary bg-brand-primary/5 rounded-r-lg mb-6">
                                                <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary">Detailed Overview</h3>
                                            </div>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</FormLabel>
                                            <div className="relative h-full group">
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe the objective, timeline, and expectations..."
                                                        className="resize-none h-full border-border/50 focus:border-brand-primary transition-all rounded-xl shadow-none font-mono text-sm pb-10"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <div className="absolute bottom-3 right-4 text-[10px] font-black text-muted-foreground/30 group-focus-within:text-brand-primary/50 tabular-nums transition-colors pointer-events-none">
                                                    {field.value?.length || 0}/500
                                                </div>
                                            </div>
                                            <FormMessage className="text-[10px] font-bold text-destructive" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Rules & Requirements */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-1 px-2 border-l-4 border-brand-primary bg-brand-primary/5 rounded-r-lg">
                                <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary">Competition Metadata</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control as any}
                                    name="maxParticipants"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Slots</FormLabel>
                                            <FormControl>
                                                <Input type="number" className="h-11 border-border/50 focus:border-brand-primary rounded-xl" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormDescription className="text-[10px]">Leave empty for unlimited</FormDescription>
                                            <FormMessage className="text-[10px] font-bold text-destructive" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as any}
                                    name="minAuraPoints"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Min Aura Req.</FormLabel>
                                            <FormControl>
                                                <Input type="number" className="h-11 border-border/50 focus:border-brand-primary rounded-xl" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold text-destructive" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as any}
                                    name="entryCipherCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Entry Fee (Ciphers)</FormLabel>
                                            <FormControl>
                                                <Input type="number" className="h-11 border-border/50 focus:border-brand-primary rounded-xl" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold text-destructive" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="p-4 bg-muted/20 border border-border/50 rounded-2xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Users2 className="w-4 h-4 text-brand-primary" />
                                            <FormLabel className="text-sm font-bold">Team Registration</FormLabel>
                                        </div>
                                        <FormDescription className="text-xs">Require participants to join as teams rather than individuals.</FormDescription>
                                    </div>
                                    <FormField
                                        control={form.control as any}
                                        name="requiresTeam"
                                        render={({ field }) => (
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        )}
                                    />
                                </div>

                                {form.watch("requiresTeam") && (
                                    <div className="pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <FormField
                                            control={form.control as any}
                                            name="teamSize"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Required Team Size</FormLabel>
                                                        <span className="text-xs font-black text-brand-primary">{field.value || 2} Members</span>
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            type="range"
                                                            min="2"
                                                            max="10"
                                                            step="1"
                                                            className="h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground/50 px-1">
                                                        <span>2</span>
                                                        <span>4</span>
                                                        <span>6</span>
                                                        <span>8</span>
                                                        <span>10</span>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>

                            <RulesSection control={form.control} />
                            <PrizesSection control={form.control} />
                        </div>
                    )}

                    {/* Step 3: Logistics */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-1 px-2 border-l-4 border-brand-primary bg-brand-primary/5 rounded-r-lg">
                                <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary">Schedule & Logistics</h3>
                            </div>

                            {/* Event Cover Image */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Event Cover Image
                                </label>
                                <EventImageUpload
                                    onFileSelect={(file) => {
                                        setImageFile(file);
                                        if (file) setIsImageRemoved(false);
                                    }}
                                    onRemove={() => setIsImageRemoved(true)}
                                    currentImageUrl={initialData?.imageUrl}
                                />
                                <p className="text-[10px] text-muted-foreground/60 font-medium">
                                    A compelling cover image increases engagement. Optional but recommended.
                                </p>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control as any}
                                    name="startsAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Starts At</FormLabel>
                                            <FormControl>
                                                <DateTimePicker
                                                    date={field.value ? new Date(field.value) : undefined}
                                                    setDate={(date) => field.onChange(date ? date.toISOString() : "")}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold text-destructive" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="endsAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ends At</FormLabel>
                                            <FormControl>
                                                <DateTimePicker
                                                    date={field.value ? new Date(field.value) : undefined}
                                                    setDate={(date) => field.onChange(date ? date.toISOString() : "")}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold text-destructive" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="registrationDeadline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registration Closes</FormLabel>
                                            <FormControl>
                                                <DateTimePicker
                                                    date={field.value ? new Date(field.value) : undefined}
                                                    setDate={(date) => field.onChange(date ? date.toISOString() : "")}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold text-destructive" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="visibility"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discovery Visibility</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 border-border/50 focus:border-brand-primary rounded-xl cursor-pointer shadow-none">
                                                        <SelectValue placeholder="Select visibility" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                                    <SelectItem value={EventVisibility.PUBLIC} className="cursor-pointer focus:bg-brand-primary/10 rounded-md m-1 font-medium">Public (Discoverable)</SelectItem>
                                                    <SelectItem value={EventVisibility.UNLISTED} className="cursor-pointer focus:bg-brand-primary/10 rounded-md m-1 font-medium">Unlisted (Link Only)</SelectItem>
                                                    <SelectItem value={EventVisibility.PRIVATE} className="cursor-pointer focus:bg-brand-primary/10 rounded-md m-1 font-medium">Private (Invite Only)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-8 border-t border-border/50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={step === 1 || isLoading}
                            className="h-11 px-6 rounded-xl border-border/50 hover:bg-muted font-bold transition-all cursor-pointer"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="text-muted-foreground hover:text-destructive font-bold cursor-pointer transition-colors"
                            >
                                Cancel
                            </Button>

                            {step < 3 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="h-11 px-8 rounded-xl bg-brand-primary hover:bg-brand-pressed text-white font-bold shadow-lg shadow-brand-primary/20 transition-all cursor-pointer"
                                >
                                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="h-11 px-8 rounded-xl bg-brand-primary hover:bg-brand-pressed text-white font-bold shadow-lg shadow-brand-primary/20 transition-all cursor-pointer"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isEditing ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        <>{isEditing ? "Save Changes" : "Launch Event"} <Trophy className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
