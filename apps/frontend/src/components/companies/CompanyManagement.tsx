"use client";

import React, { useState, useRef, useEffect } from "react";
import { Company } from "@/api/companyService";
import { useManageMembers, useVerifyDomain } from "@/hooks/useCompanies";
import { useSearchUsers } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/modals/ConfirmModal";
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
    ArrowRight,
    Search
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
    const [memberIdentifier, setMemberIdentifier] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState<{ open: boolean; userId: string; username: string }>({
        open: false, userId: "", username: ""
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { mutate: verifyDomain, isPending: verifying } = useVerifyDomain();
    const { mutate: manageMember, isPending: managing } = useManageMembers();

    const isOwner = company.userRole === "OWNER";

    // Debounced search
    const debouncedQuery = useDebounce(searchQuery, 300);
    const { data: searchResults, isLoading: searching } = useSearchUsers(debouncedQuery, showDropdown);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationEmail) return;
        verifyDomain({ id: company.id, email: verificationEmail });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMemberIdentifier(val);

        // Extract username for search (strip u/ prefix)
        const query = val.startsWith("u/") ? val.slice(2) : val;
        setSearchQuery(query);
        setShowDropdown(query.length >= 2);
    };

    const handleSelectUser = (username: string) => {
        setMemberIdentifier(`u/${username}`);
        setSearchQuery("");
        setShowDropdown(false);
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberIdentifier) return;

        manageMember({
            id: company.id,
            identifier: memberIdentifier,
            action: "ADD",
            role: "RECRUITER"
        }, {
            onSuccess: () => {
                setMemberIdentifier("");
                setSearchQuery("");
                toast.success(`User ${memberIdentifier} added as recruiter!`);
            },
            onError: (error: any) => {
                toast.error(error?.errorMessage || "Failed to add member");
            }
        });
    };

    const updateRole = (userId: string, role: string) => {
        manageMember({ id: company.id, userId, action: "UPDATE_ROLE", role });
    };

    const openRemoveConfirm = (userId: string, username: string) => {
        setConfirmRemove({ open: true, userId, username });
    };

    const handleConfirmRemove = () => {
        manageMember({ id: company.id, userId: confirmRemove.userId, action: "REMOVE" });
        setConfirmRemove({ open: false, userId: "", username: "" });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Confirm Remove Modal */}
            <ConfirmModal
                isOpen={confirmRemove.open}
                onClose={() => setConfirmRemove({ open: false, userId: "", username: "" })}
                onConfirm={handleConfirmRemove}
                title="Remove Member"
                description={
                    <p>Are you sure you want to remove <strong>u/{confirmRemove.username}</strong> from this company? They will lose all recruiter access immediately.</p>
                }
                confirmText="Remove"
                variant="destructive"
                isPending={managing}
            />

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

            {/* Add Member (Owners only) */}
            {isOwner && (
                <Card className="p-8 border-border/40 bg-card/60 backdrop-blur-xl rounded-3xl space-y-6 group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-4">
                            <div className="bg-brand-primary/10 p-3 rounded-2xl h-fit group-hover:bg-brand-primary group-hover:text-white transition-all">
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black tracking-tight">Add Team Member</h3>
                                <p className="text-sm text-muted-foreground font-medium max-w-md">
                                    Invite colleagues to help manage job listings and applications.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleAddMember} className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-72" ref={dropdownRef}>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                    ref={inputRef}
                                    placeholder="u/username"
                                    className="pl-9 h-12 bg-transparent border-border/40 rounded-xl"
                                    value={memberIdentifier}
                                    onChange={handleInputChange}
                                    onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                                    required
                                    autoComplete="off"
                                />

                                {/* Autocomplete Dropdown */}
                                {showDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/40 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                        {searching ? (
                                            <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Searching...
                                            </div>
                                        ) : searchResults && searchResults.length > 0 ? (
                                            searchResults.map((user: any) => (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                                                    onClick={() => handleSelectUser(user.username)}
                                                >
                                                    <Avatar className="h-8 w-8 border border-border/50">
                                                        <AvatarImage src={user.avatarUrl || ""} />
                                                        <AvatarFallback className="bg-brand-primary/10 text-brand-primary text-xs font-bold">
                                                            {user.username?.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">
                                                            {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.username}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">u/{user.username}</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : debouncedQuery.length >= 2 ? (
                                            <div className="p-4 text-sm text-muted-foreground text-center">
                                                No users found
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                            <Button disabled={managing} className="h-12 px-6 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors">
                                {managing ? <Loader2 className="animate-spin h-4 w-4" /> : "Add Recruiter"}
                            </Button>
                        </form>
                    </div>
                </Card>
            )}

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
                                    {isOwner && member.role !== "OWNER" ? (
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
                                                onClick={() => openRemoveConfirm(member.userId, member.user?.username || "")}
                                                disabled={managing}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-4">
                                            {member.role === "OWNER" ? "Primary Access" : member.role}
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
