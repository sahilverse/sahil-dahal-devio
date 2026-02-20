"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, JobType, JobWorkplace, CreateJobInput } from "@devio/zod-utils";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Briefcase, Building2, MapPin, DollarSign, Globe, Link as LinkIcon, Sparkles, Loader2 } from "lucide-react";
import TopicSelector from "@/components/create/TopicSelector";
import { useCreateJob } from "@/hooks/useJobs";
import { useFetchUserCompanies } from "@/hooks/useCompanies";

export default function PostJobForm() {
    const { mutate: createJob, isPending } = useCreateJob();
    const { data: companies, isLoading: loadingCompanies } = useFetchUserCompanies();

    const form = useForm<any>({
        resolver: zodResolver(createJobSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            type: JobType.FULL_TIME,
            workplace: JobWorkplace.ON_SITE,
            companyId: "",
            location: "",
            salaryMin: null,
            salaryMax: null,
            currency: "NPR",
            applyLink: "",
            topics: [],
        },
    });

    const onSubmit = (data: any) => {
        createJob(data as CreateJobInput);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl space-y-6 overflow-visible">
                            <div className="space-y-4">
                                <h3 className="text-lg font-black flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-brand-primary" />
                                    Job Essentials
                                </h3>

                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Job Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. Senior Frontend Engineer (React/Next.js)"
                                                    className="h-12 bg-muted/20 border-border/40 rounded-xl focus:ring-brand-primary/20"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell candidates about the role, responsibilities, and requirements..."
                                                    className="min-h-[250px] bg-muted/20 border-border/40 rounded-xl resize-none p-4"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border/20 overflow-visible">
                                <h3 className="text-lg font-black flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-brand-primary" />
                                    Tagging & Discovery
                                </h3>
                                <div className="space-y-1">
                                    <FormLabel className="font-bold">Topics</FormLabel>
                                    <FormDescription className="text-xs mb-3">
                                        Add up to 5 topics. Type <span className="text-brand-primary font-bold">t/</span> to search or create new ones.
                                    </FormDescription>
                                    <TopicSelector />
                                </div>
                            </div>
                        </Card>

                        {/* Salary & Link Card */}
                        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl space-y-6">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-brand-primary" />
                                Compensation & Apply
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="salaryMin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Min Salary</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="number"
                                                        className="pl-9 h-12 bg-muted/20 border-border/40 rounded-xl"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="salaryMax"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Max Salary</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="number"
                                                        className="pl-9 h-12 bg-muted/20 border-border/40 rounded-xl"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="applyLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Application Link / URL</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="https://careers.company.com/..." className="pl-9 h-12 bg-muted/20 border-border/40 rounded-xl" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[11px] font-bold" />
                                    </FormItem>
                                )}
                            />
                        </Card>
                    </div>

                    {/* Sidebar Configuration */}
                    <div className="space-y-6">
                        <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-md rounded-3xl space-y-6 sticky top-28">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-brand-primary" />
                                Posting Entity
                            </h3>

                            <FormField
                                control={form.control}
                                name="companyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Select Company</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-muted/20 border-border/40 rounded-xl font-medium">
                                                    <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Choose a company"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl border-border/40 bg-card backdrop-blur-xl">
                                                {companies?.map((company: any) => (
                                                    <SelectItem key={company.id} value={company.id} className="rounded-xl focus:bg-brand-primary/10">
                                                        {company.name}
                                                    </SelectItem>
                                                ))}
                                                <div className="p-3 border-t border-border/10 mt-2">
                                                    <p className="text-[10px] text-muted-foreground mb-2 px-1">Need a new entity?</p>
                                                    <Button asChild size="sm" variant="outline" className="w-full rounded-xl h-9 text-xs font-bold">
                                                        <Link href="/c/new">
                                                            <Building2 className="mr-2 h-3.5 w-3.5" />
                                                            Create Company
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[11px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-6 pt-4 border-t border-border/20">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Job Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-muted/20 border-border/40 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-2xl border-border/40 bg-card backdrop-blur-xl">
                                                    {Object.values(JobType).map((type) => (
                                                        <SelectItem key={type} value={type} className="rounded-xl capitalize">
                                                            {type.replace("_", " ").toLowerCase()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="workplace"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Workplace</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-muted/20 border-border/40 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-2xl border-border/40 bg-card backdrop-blur-xl">
                                                    {Object.values(JobWorkplace).map((wp) => (
                                                        <SelectItem key={wp} value={wp} className="rounded-xl capitalize">
                                                            {wp.replace("_", " ").toLowerCase()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Location</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="City, Country" className="pl-9 h-12 bg-muted/20 border-border/40 rounded-xl" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white font-black rounded-2xl shadow-xl shadow-brand-primary/20 text-lg transition-transform active:scale-95"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Deploying Position...
                                    </>
                                ) : (
                                    <>
                                        List Job Posting
                                        <Sparkles className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground px-4">
                                By posting, you agree to Dev.io's Employer Guidelines and ensure this is a legitimate vacancy.
                            </p>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
