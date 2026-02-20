"use client";

import React, { useState } from "react";
import { useAdminParticipants, useUpdateManualScore, useRemoveParticipant, useUpdateParticipantStatus } from "@/hooks/useEvents";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Edit2, Check, X, Loader2, Download, Trash2, UserMinus, UserCheck, ShieldAlert, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminParticipantListProps {
    eventId: string;
}

export function AdminParticipantList({ eventId }: AdminParticipantListProps) {
    const { data: participants, isLoading } = useAdminParticipants(eventId, true);
    const updateScore = useUpdateManualScore(eventId);
    const removeParticipant = useRemoveParticipant(eventId);
    const updateStatus = useUpdateParticipantStatus(eventId);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempScore, setTempScore] = useState<number>(0);

    const handleEdit = (userId: string, currentScore: number) => {
        setEditingId(userId);
        setTempScore(currentScore);
    };

    const handleSave = async (userId: string) => {
        await updateScore.mutateAsync({ userId, score: tempScore });
        setEditingId(null);
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const exportToCSV = () => {
        if (!participants) return;
        const headers = ["Name", "Username", "Email", "Team", "Score", "Registered At"];
        const rows = participants.map((p: any) => [
            `${p.user.firstName} ${p.user.lastName}`,
            p.user.username,
            p.user.email,
            p.teamName || "N/A",
            p.score,
            format(new Date(p.registeredAt), "yyyy-MM-dd HH:mm:ss")
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `participants_${eventId}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-2xl border border-dashed border-border/50">
                <div>
                    <h3 className="text-lg font-black tracking-tight">Moderator Audit View</h3>
                    <p className="text-xs text-muted-foreground mt-1">Review registrations and manage manual scoring for hackathons.</p>
                </div>
                <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2 h-9 rounded-xl font-bold">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="border border-border/50 rounded-2xl overflow-hidden bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4">Participant</th>
                                <th className="px-6 py-4">Team</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Registered</th>
                                <th className="px-6 py-4 text-right">Score</th>
                                <th className="px-6 py-4 w-[120px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {participants?.map((participant: any) => (
                                <tr key={participant.userId} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                                                <AvatarImage src={participant.user.avatarUrl} />
                                                <AvatarFallback className="font-bold">{participant.user.username[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold tracking-tight">
                                                    {participant.user.firstName} {participant.user.lastName}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">@{participant.user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {participant.teamName ? (
                                            <Badge variant="secondary" className="font-bold">{participant.teamName}</Badge>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground italic font-medium">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                                                    <Badge
                                                        variant="outline"
                                                        className={`capitalize text-[10px] font-black tracking-wider cursor-pointer hover:border-brand-primary transition-colors ${participant.status === 'REGISTERED' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' :
                                                            participant.status === 'CHECKED_IN' ? 'text-green-500 border-green-500/20 bg-green-500/5' :
                                                                participant.status === 'COMPLETED' ? 'text-brand-primary border-brand-primary/20 bg-brand-primary/5' :
                                                                    'text-destructive border-destructive/20 bg-destructive/5'
                                                            }`}
                                                    >
                                                        {participant.status.toLowerCase().replace('_', ' ')}
                                                    </Badge>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-40 rounded-xl">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Set Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => updateStatus.mutate({ userId: participant.userId, status: 'REGISTERED' })} className="gap-2 text-xs font-bold">
                                                    <Badge variant="outline" className="w-2 h-2 rounded-full p-0 bg-blue-500 border-none" /> Registered
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateStatus.mutate({ userId: participant.userId, status: 'CHECKED_IN' })} className="gap-2 text-xs font-bold">
                                                    <UserCheck className="w-3.5 h-3.5 text-green-500" /> Checked In
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateStatus.mutate({ userId: participant.userId, status: 'COMPLETED' })} className="gap-2 text-xs font-bold">
                                                    <Trophy className="w-3.5 h-3.5 text-brand-primary" /> Completed
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateStatus.mutate({ userId: participant.userId, status: 'DISQUALIFIED' })} className="gap-2 text-xs font-bold text-destructive">
                                                    <ShieldAlert className="w-3.5 h-3.5" /> Disqualified
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] text-muted-foreground whitespace-nowrap font-medium">
                                        {format(new Date(participant.registeredAt), "MMM d, h:mm a")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingId === participant.userId ? (
                                            <Input
                                                type="number"
                                                value={tempScore}
                                                onChange={(e) => setTempScore(Number(e.target.value))}
                                                className="w-24 ml-auto h-8 text-right px-2 font-bold focus-visible:ring-brand-primary/20"
                                            />
                                        ) : (
                                            <span className="font-black text-brand-primary text-base">{participant.score}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {editingId === participant.userId ? (
                                                <>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                                                        onClick={() => handleSave(participant.userId)}
                                                        disabled={updateScore.isPending}
                                                    >
                                                        {updateScore.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/5"
                                                        onClick={handleCancel}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/5"
                                                        onClick={() => handleEdit(participant.userId, participant.score)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to remove ${participant.user.username} from the event?`)) {
                                                                removeParticipant.mutate(participant.userId);
                                                            }
                                                        }}
                                                        disabled={removeParticipant.isPending}
                                                    >
                                                        {removeParticipant.isPending && removeParticipant.variables === participant.userId ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <UserMinus className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
