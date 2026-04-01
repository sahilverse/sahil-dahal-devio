import React from "react";
import Image from "next/image";
import { MapPin, Users, Calendar, Globe, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import { format } from "date-fns";

interface CompanyDetailHeroProps {
    company: any;
}

export function CompanyDetailHero({ company }: CompanyDetailHeroProps) {
    return (
        <div className="relative overflow-visible">
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-brand-primary/5 mt-12 md:mt-16">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                    {/* Company Logo/Icon */}
                    <div className="relative h-28 w-28 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-full border-4 border-card bg-card shadow-xl ring-1 ring-border/10 -mt-20 md:-mt-24">
                        {company.logoUrl ? (
                            <Image
                                src={company.logoUrl}
                                alt={company.name}
                                fill
                                className="object-cover"
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
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight">c/{company.name}</h1>
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
    );
}
