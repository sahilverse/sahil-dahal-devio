"use client";

import React from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star } from "lucide-react";

interface LeaderboardTableProps {
    participants: any[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ participants }) => {
    if (!participants || participants.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No participants yet. Be the first to join!</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                    <tr>
                        <th className="px-6 py-4 w-16">Rank</th>
                        <th className="px-6 py-4">Participant</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {participants.map((participant, index) => {
                        const rank = index + 1;
                        const isTop3 = rank <= 3;

                        return (
                            <tr key={participant.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-bold">
                                    {isTop3 ? (
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                            {rank === 1 ? <Trophy className="w-4 h-4 text-yellow-500" /> : rank === 2 ? <Medal className="w-4 h-4 text-slate-400" /> : <Medal className="w-4 h-4 text-amber-600" />}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground ml-3">{rank}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={participant.user?.avatarUrl} />
                                            <AvatarFallback>{participant.user?.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold leading-none">{participant.user?.username}</p>
                                            {participant.teamName && (
                                                <p className="text-xs text-muted-foreground mt-1">Team: {participant.teamName}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="capitalize text-[10px]">
                                        {participant.status.toLowerCase()}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-primary">
                                    {participant.score.toLocaleString()}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
