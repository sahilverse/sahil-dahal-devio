"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useFetchCompany } from "@/hooks/useCompanies";
import { useFetchJobs } from "@/hooks/useJobs";

import { CompanyDetailHeader } from "@/components/companies/details/CompanyDetailHeader";
import { CompanyDetailHero } from "@/components/companies/details/CompanyDetailHero";
import { CompanyDetailTabs } from "@/components/companies/details/CompanyDetailTabs";
import { CompanyDetailSkeleton } from "@/components/companies/details/CompanyDetailSkeleton";
import { CompanyDetailNotFound } from "@/components/companies/details/CompanyDetailNotFound";

export default function CompanyProfilePage() {
    const { slug } = useParams() as { slug: string };
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const { data: company, isLoading: loadingCompany } = useFetchCompany(slug);

    const { data: jobsResponse, isLoading: loadingJobs } = useFetchJobs({
        companyId: company?.id,
        isActive: true
    }, { enabled: !!company?.id });

    if (loadingCompany) return <CompanyDetailSkeleton />;
    if (!company) return <CompanyDetailNotFound />;

    const isManager = company.userRole === "OWNER" || company.userRole === "RECRUITER";

    return (
        <div className="container max-w-5xl py-6 space-y-8 animate-in fade-in duration-500">
            <CompanyDetailHeader
                companyName={company.name}
                description={company.description!}
            />

            <CompanyDetailHero company={company} />

            <CompanyDetailTabs
                company={company}
                jobsResponse={jobsResponse}
                loadingJobs={loadingJobs}
                isManager={isManager!}
            />
        </div>
    );
}
