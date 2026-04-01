import React from "react";
import { 
    Building2, 
    Globe, 
    Calendar, 
    ShieldCheck 
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { JobFeed } from "@/components/shared/JobFeed";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import CompanyManagement from "@/components/companies/CompanyManagement";

interface CompanyDetailTabsProps {
    company: any;
    jobsResponse: any;
    loadingJobs: boolean;
    isManager: boolean;
}

export function CompanyDetailTabs({
    company,
    jobsResponse,
    loadingJobs,
    isManager
}: CompanyDetailTabsProps) {
    return (
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
                            <DetailItem label="Verification Tier" value={company.verificationTier} icon={<VerificationBadge tier={company.verificationTier} size="sm" />} />
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
