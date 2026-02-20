"use client";

import React, { useState } from "react";
import { Company, CompanyMember } from "@/api/companyService";
import { useManageMembers, useVerifyDomain } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    UserPlus,
    Trash2,
    ShieldAlert,
    Globe,
    Mail,
    Loader2,
    CheckCircle2,
    Users as UsersIcon,
    ArrowRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

interface CompanyManagementProps {
    company: Company;
}

export default function CompanyManagement({ company }: CompanyManagementProps) {
    const [verificationEmail, setVerificationEmail] = useState("");
    const { mutate: verifyDomain, isPending: verifying } = useVerifyDomain();
    const { mutate: manageMember, isPending: managing } = useManageMembers();

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationEmail) return;
        verifyDomain({ id: company.id, email: verificationEmail });
    };

    const updateRole = (userId: string, role: string) => {
        manageMember({ id: company.id, userId, action: "UPDATE_ROLE", role });
    };

    const removeMember = (userId: string) => {
        if (confirm("Are you sure you want to remove this member?")) {
            manageMember({ id: company.id, userId, action: "REMOVE" });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Domain Verification Card */}
            <Card className="p-8 border-brand-primary/20 bg-brand-primary/[0.02] backdrop-blur-xl rounded-3xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-4">
                        <div className="bg-brand-primary/10 p-3 rounded-2xl h-fit">
                            <Globe className="h-6 w-6 text-brand-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black tracking-tight">Domain Verification</h3>
                            <p className="text-sm text-muted-foreground font-medium max-w-md">
                                Verify your corporate domain to unlock official posting status and the verified badge.
                            </p>
                        </div>
                    </div>

                    {company.isVerified ? (
                        <div className="flex items-center gap-3 bg-green-500/10 text-green-500 px-5 py-3 rounded-2xl border border-green-500/20 font-bold">
                            <CheckCircle2 className="h-5 w-5" />
                            Verified: {company.verifiedDomain}
                        </div>
                    ) : (
                        <form onSubmit={handleVerify} className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="work@company.com"
                                    className="pl-9 h-12 bg-background border-border/40 rounded-xl"
                                    type="email"
                                    value={verificationEmail}
                                    onChange={(e) => setVerificationEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button disabled={verifying} className="h-12 px-6 rounded-xl bg-brand-primary font-bold">
                                {verifying ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify"}
                            </Button>
                        </form>
                    )}
                </div>
            </Card>

            {/* Member Management */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UsersIcon className="h-5 w-5 text-brand-primary" />
                        <h3 className="text-lg font-black tracking-tight">Member Directory</h3>
                    </div>
                </div>

                <Card className="overflow-hidden border-border/40 bg-card/60 backdrop-blur-xl rounded-3xl">
                    <div className="divide-y divide-border/30">
                        {company.members?.map((member) => (
                            <div key={member.userId} className="p-6 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border border-border/50">
                                        <AvatarImage src={member.user?.avatarUrl || ""} />
                                        <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold">
                                            {member.user?.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-foreground">
                                                {member.user?.firstName ? `${member.user.firstName} ${member.user.lastName}` : member.user?.username}
                                            </p>
                                            {member.role === "OWNER" && (
                                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-black uppercase">
                                                    Owner
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium truncate">u/{member.user?.username}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {member.role !== "OWNER" ? (
                                        <>
                                            <Select
                                                defaultValue={member.role}
                                                onValueChange={(val) => updateRole(member.userId, val)}
                                                disabled={managing}
                                            >
                                                <SelectTrigger className="h-9 w-32 bg-muted/20 border-border/40 rounded-lg text-xs font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/40 shadow-2xl">
                                                    <SelectItem value="RECRUITER" className="text-xs font-bold">Recruiter</SelectItem>
                                                    <SelectItem value="MEMBER" className="text-xs font-bold">Member</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                onClick={() => removeMember(member.userId)}
                                                disabled={managing}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-4">
                                            Primary Access
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Quick Actions / Integration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 border-border/40 bg-card/60 backdrop-blur-xl rounded-3xl group cursor-pointer hover:border-brand-primary/50 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-primary/10 p-3 rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold">Security Audit</h4>
                            <p className="text-xs text-muted-foreground">Review access logs and security events.</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-border group-hover:text-brand-primary transition-all" />
                    </div>
                </Card>
                <Card className="p-6 border-border/40 bg-card/60 backdrop-blur-xl rounded-3xl group cursor-pointer hover:border-brand-primary/50 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-primary/10 p-3 rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold">Access Requests</h4>
                            <p className="text-xs text-muted-foreground font-medium">No pending requests at this time.</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-border group-hover:text-brand-primary transition-all" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
