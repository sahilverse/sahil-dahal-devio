"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useFetchCompany } from "@/hooks/useCompanies";
import { useFetchJobs } from "@/hooks/useJobs";
import { JobFeed } from "@/components/shared/JobFeed";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import {
    Building2,
    Globe,
    MapPin,
    Users,
    Link as LinkIcon,
    Calendar,
    ArrowLeft,
    Share2,
    ExternalLink,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import CompanyManagement from "@/components/companies/CompanyManagement";

export default function CompanyProfilePage() {
    const { slug } = useParams() as { slug: string };
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const { data: company, isLoading: loadingCompany } = useFetchCompany(slug);
    const { data: jobsResponse, isLoading: loadingJobs } = useFetchJobs({
        companyId: company?.id,
        isActive: true
    }, { enabled: !!company?.id });

    if (loadingCompany) return <CompanyProfileSkeleton />;
    if (!company) return <CompanyNotFound />;

    const isManager = currentUser && (
        company.ownerId === currentUser.id ||
        company.members?.some(m => m.userId === currentUser.id && (m.role === "OWNER" || m.role === "RECRUITER"))
    );

    return (
        <div className="container max-w-5xl py-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="rounded-xl text-muted-foreground hover:text-foreground -ml-4">
                    <Link href="/jobs">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Board
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl size-10">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Profile Hero Section */}
            <div className="relative overflow-visible">
                <Card className="border-border/40 bg-card/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden p-8 md:p-10 shadow-2xl shadow-brand-primary/5">
                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        {/* Company Logo/Icon */}
                        <div className="relative h-28 w-28 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-3xl border border-border/50 bg-muted/30 shadow-xl bg-transparent">
                            {company.logoUrl ? (
                                <Image
                                    src={company.logoUrl}
                                    alt={company.name}
                                    fill
                                    className="object-contain p-2"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-brand-primary/10 text-brand-primary text-4xl font-black uppercase">
                                    {company.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Company Identity */}
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">{company.name}</h1>
                                    <VerificationBadge tier={company.verificationTier} size="md" showText />
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
                                    {company.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4 text-brand-primary/60" />
                                            {company.location}
                                        </div>
                                    )}
                                    {company.size && (
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4 text-brand-primary/60" />
                                            {company.size} employees
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-brand-primary/60" />
                                        Joined {format(new Date(company.createdAt), "MMMM yyyy")}
                                    </div>
                                </div>
                            </div>

                            <p className="text-foreground/80 leading-relaxed font-medium max-w-3xl">
                                {company.description || "No description provided yet. This organization is a vital part of the Dev.io ecosystem."}
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                {company.websiteUrl && (
                                    <Button asChild variant="secondary" className="rounded-xl h-10 font-bold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-transparent">
                                        <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer">
                                            <Globe className="mr-2 h-4 w-4" />
                                            Official Website
                                            <ExternalLink className="ml-2 h-3 w-3 opacity-50" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 h-40 w-40 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                </Card>
            </div>

            {/* Main Content Areas */}
            <Tabs defaultValue="jobs" className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/30 pb-1">
                    <TabsList className="bg-transparent h-auto p-0 gap-8">
                        <TabsTrigger
                            value="jobs"
                            className="bg-transparent border-b-2 border-transparent rounded-none px-3 py-3 text-sm font-bold data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary transition-all cursor-pointer"
                        >
                            Open Positions
                            {jobsResponse?.total ? (
                                <span className="ml-2 bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-md text-[10px]">
                                    {jobsResponse.total}
                                </span>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger
                            value="about"
                            className="bg-transparent border-b-2 border-transparent rounded-none px-3 py-3 text-sm font-bold data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary transition-all cursor-pointer"
                        >
                            About
                        </TabsTrigger>
                        {isManager && (
                            <TabsTrigger
                                value="manage"
                                className="bg-transparent border-b-2 border-transparent rounded-none px-3 py-3 text-sm font-bold data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary transition-all cursor-pointer"
                            >
                                Manage
                                <ShieldCheck className="ml-2 h-3.5 w-3.5" />
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <TabsContent value="jobs" className="mt-0">
                    <JobFeed jobs={jobsResponse?.jobs} isLoading={loadingJobs} />
                </TabsContent>

                <TabsContent value="about" className="mt-0 space-y-6">
                    <Card className="p-8 border-border/40 bg-card rounded-3xl space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-black tracking-tight">Organization Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem label="Legal Name" value={company.name} icon={<Building2 className="size-4" />} />
                                <DetailItem label="Verification Tier" value={company.verificationTier} icon={< VerificationBadge tier={company.verificationTier} size="sm" />} />
                                {company.verifiedDomain && <DetailItem label="Verified Domain" value={company.verifiedDomain} icon={<Globe className="size-4" />} />}
                                <DetailItem label="Member Since" value={format(new Date(company.createdAt), "PPP")} icon={<Calendar className="size-4" />} />
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {isManager && (
                    <TabsContent value="manage" className="mt-0">
                        <CompanyManagement company={company} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function DetailItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/20">
            <div className="bg-background p-2 rounded-xl border border-border/50 text-brand-primary/60">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="text-sm font-bold">{value}</p>
            </div>
        </div>
    );
}

function CompanyProfileSkeleton() {
    return (
        <div className="container max-w-5xl py-10 space-y-8">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        </div>
    );
}

function CompanyNotFound() {
    return (
        <div className="container py-20 text-center space-y-6">
            <div className="bg-brand-primary/10 p-6 rounded-full w-fit mx-auto">
                <Building2 className="h-12 w-12 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-black">Company Not Found</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
                The organization you're looking for doesn't exist or has been removed from our records.
            </p>
            <Button asChild className="rounded-xl">
                <Link href="/j">Return to Job Board</Link>
            </Button>
        </div>
    );
}
