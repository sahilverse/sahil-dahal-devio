"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCompanySchema, CreateCompanyInput } from "@devio/zod-utils";
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
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Building2, Globe, MapPin, Users, Link, Loader2, Sparkles } from "lucide-react";
import { CompanyService } from "@/api/companyService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import CompanyLogoUpload from "./CompanyLogoUpload";

export default function CreateCompanyForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isPending, setIsPending] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const form = useForm<CreateCompanyInput>({
        resolver: zodResolver(createCompanySchema),
        defaultValues: {
            name: "",
            description: "",
            websiteUrl: "",
            location: "",
            size: undefined,
            logoUrl: "",
        },
    });

    const onSubmit = async (data: CreateCompanyInput) => {
        setIsPending(true);
        try {
            const company = await CompanyService.create(data);

            // Upload logo after company is created
            if (imageFile) {
                await CompanyService.uploadLogo(company.id, imageFile);
            }

            toast.success("Company established successfully!");
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            router.push(`/c/${company.slug}`);
        } catch (error: any) {
            toast.error(error?.errorMessage || "Failed to create company.");
            setIsPending(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-brand-primary/5 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-brand-primary/10 p-3 rounded-2xl">
                                <Building2 className="h-6 w-6 text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Company Identity</h3>
                                <p className="text-sm text-muted-foreground font-medium">Define your organization&apos;s presence on Dev.io</p>
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div className="flex items-start gap-6">
                            <CompanyLogoUpload
                                onFileSelect={(file) => setImageFile(file)}
                            />
                            <div className="flex-1 space-y-1 pt-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Logo</p>
                                <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                                    Upload a square image for your company logo. Use a transparent PNG or SVG for best results.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Company Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Acme Corporation"
                                                className="h-12 bg-muted/20 border-border/40 rounded-xl focus:ring-brand-primary/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="size"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Company Size</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-muted/20 border-border/40 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground/50" />
                                                        <SelectValue placeholder="Select size" />
                                                    </div>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl border-border/40 bg-card backdrop-blur-xl">
                                                <SelectItem value="1-10" className="rounded-lg">1-10 employees</SelectItem>
                                                <SelectItem value="11-50" className="rounded-lg">11-50 employees</SelectItem>
                                                <SelectItem value="51-200" className="rounded-lg">51-200 employees</SelectItem>
                                                <SelectItem value="201-500" className="rounded-lg">201-500 employees</SelectItem>
                                                <SelectItem value="501-1000" className="rounded-lg">501-1000 employees</SelectItem>
                                                <SelectItem value="1000+" className="rounded-lg">1000+ employees</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell potential candidates about your company mission, culture, and values..."
                                            className="min-h-[120px] bg-muted/20 border-border/40 rounded-xl resize-none p-4"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[10px] font-medium opacity-60">
                                        Max 500 characters. Keep it punchy!
                                    </FormDescription>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6 pt-6 border-t border-border/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-brand-primary/10 p-3 rounded-2xl">
                                <Globe className="h-6 w-6 text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Public Presence</h3>
                                <p className="text-sm text-muted-foreground font-medium">Links and location for candidates</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="websiteUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Website URL</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="https://acme.com"
                                                    className="pl-9 h-12 bg-muted/20 border-border/40 rounded-xl"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Headquarters</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="San Francisco, CA"
                                                    className="pl-9 h-12 bg-muted/20 border-border/40 rounded-xl"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white font-black rounded-2xl shadow-xl shadow-brand-primary/20 text-lg transition-all active:scale-95 disabled:opacity-50"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Establishing Presence...
                            </>
                        ) : (
                            <>
                                Create Company Profile
                                <Sparkles className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </Card>
            </form>
        </Form>
    );
}
