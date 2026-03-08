"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetchLab, useFetchChallenges, useSubmitFlag, useFetchActiveSession, useStartSession, useExtendSession, useTerminateSession, useFetchEnrollment, useJoinRoom } from "@/hooks/useLabs";
import { Shield, Lock, Unlock, Flag, Clock, HardDrive, TerminalSquare, AlertCircle, Play, Square, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, addMinutes } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export default function RoomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const { data: room, isLoading: isLoadingRoom } = useFetchLab(slug);
    const { data: enrollment, isLoading: isLoadingEnrollment } = useFetchEnrollment(room?.id || "");
    const { data: challenges } = useFetchChallenges(room?.id || "");
    const { data: activeSession } = useFetchActiveSession(room?.id || "");

    const joinRoom = useJoinRoom();
    const startSession = useStartSession();
    const terminateSession = useTerminateSession();
    const extendSession = useExtendSession();
    const submitFlag = useSubmitFlag();

    const [flagAnswers, setFlagAnswers] = useState<Record<string, string>>({});

    if (isLoadingRoom) return <div className="p-10 text-center animate-pulse">Loading Room...</div>;
    if (!room) return <div className="p-10 text-center text-red-500">Room not found.</div>;

    const isEnrolled = !!enrollment;
    const hasActiveMachine = activeSession && activeSession.status === "RUNNING";

    const handleJoin = () => {
        joinRoom.mutate(room.id);
    };

    const handleSubmitFlag = (challengeId: string) => {
        if (!flagAnswers[challengeId]) return;
        submitFlag.mutate({ challengeId, answer: flagAnswers[challengeId] });
    };

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
            {/* Left Panel: Content & Tasks */}
            <div className="w-full lg:w-1/2 flex flex-col border-r border-border/50 shrink-0 h-full overflow-y-auto custom-scrollbar">
                {/* Header Image */}
                <div className="relative h-48 sm:h-64 w-full shrink-0">
                    {room.imageUrl ? (
                        <Image src={room.imageUrl} alt={room.title} fill className="object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                            <Shield className="h-20 w-20 text-slate-800" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-background/50 backdrop-blur-md">
                                {room.difficulty}
                            </Badge>
                            {room.pointsReward > 0 && (
                                <Badge className="bg-brand-primary/80 backdrop-blur-md">
                                    {room.pointsReward} Points
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-foreground drop-shadow-md">{room.title}</h1>
                    </div>
                </div>

                <div className="p-6 space-y-8 flex-1">
                    {/* Enrollment Section */}
                    {!isEnrolled ? (
                        <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-6 text-center space-y-4">
                            <h3 className="text-lg font-bold">Ready to take on the challenge?</h3>
                            <p className="text-sm text-muted-foreground">Join this room to access tasks, start machines, and submit flags.</p>
                            <Button
                                onClick={handleJoin}
                                disabled={joinRoom.isPending}
                                className="w-full sm:w-auto font-black px-8"
                            >
                                {joinRoom.isPending ? "Joining..." : "Join Room"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground font-medium">Your Progress</span>
                                <span className="text-xl font-black text-brand-primary">{enrollment.progress || 0}%</span>
                            </div>
                            <div className="w-1/2 bg-muted rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-brand-primary h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${enrollment.progress || 0}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Room Description */}
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-primary">
                        <ReactMarkdown>{room.description}</ReactMarkdown>
                    </div>

                    {/* Tasks / Challenges List */}
                    <div className="space-y-4 pt-4 border-t border-border/30">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <Flag className="h-5 w-5 text-brand-primary" />
                            Tasks & Challenges
                        </h2>

                        {!isEnrolled ? (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm p-4 bg-muted/20 rounded-xl border border-dashed border-border/50">
                                <Lock className="h-4 w-4" />
                                Join the room to view tasks.
                            </div>
                        ) : challenges?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No tasks available yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {challenges?.map((challenge, index) => {
                                    const isSolved = challenge.isSolved;
                                    return (
                                        <div key={challenge.id} className={cn(
                                            "border rounded-2xl p-5 transition-colors",
                                            isSolved ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border/50"
                                        )}>
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <h3 className="font-bold text-foreground">
                                                        Task {index + 1}: {challenge.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {challenge.points} points • {challenge.type}
                                                    </p>
                                                </div>
                                                {isSolved ? (
                                                    <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 shrink-0">
                                                        <Unlock className="w-3 h-3 mr-1" />
                                                        Solved
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground shrink-0">
                                                        Pending
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mb-4">
                                                <ReactMarkdown>{challenge.description}</ReactMarkdown>
                                            </div>

                                            {/* Flag Submission */}
                                            {challenge.type === "FLAG" && !isSolved && (
                                                <div className="flex gap-2 mt-4">
                                                    <Input
                                                        placeholder="devio{flag_here}"
                                                        value={flagAnswers[challenge.id] || ""}
                                                        onChange={(e) => setFlagAnswers({ ...flagAnswers, [challenge.id]: e.target.value })}
                                                        className="font-mono bg-muted/30"
                                                    />
                                                    <Button
                                                        onClick={() => handleSubmitFlag(challenge.id)}
                                                        disabled={!flagAnswers[challenge.id] || submitFlag.isPending}
                                                        className="shrink-0"
                                                    >
                                                        Submit
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Target Machine / Interactive Area */}
            <div className="hidden lg:flex flex-1 flex-col bg-slate-950 text-slate-300 relative">
                {/* Active Session Top Bar */}
                <div className="h-14 shrink-0 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10 shadow-sm relative">
                    <div className="flex items-center gap-3">
                        <HardDrive className={cn("h-5 w-5", hasActiveMachine ? "text-emerald-400" : "text-slate-600")} />
                        <span className="font-bold text-sm tracking-wide text-slate-100">TARGET MACHINE</span>
                        {hasActiveMachine && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px]">
                                {activeSession.ipAddress || "Provisioning IP..."}
                            </Badge>
                        )}
                    </div>

                    {isEnrolled && (
                        <div className="flex items-center gap-3">
                            {hasActiveMachine ? (
                                <>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-bold font-mono">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>
                                            Expires {formatDistanceToNow(new Date(activeSession.expiresAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => extendSession.mutate(activeSession.id)}
                                        className="h-8 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                                        title="Extend by 30 mins (Costs 50 Cipher)"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Add Time
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => terminateSession.mutate(activeSession.id)}
                                        className="h-8 text-xs"
                                    >
                                        <Square className="w-3.5 h-3.5 mr-1 fill-current" />
                                        Terminate
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={() => startSession.mutate(room.id)}
                                    disabled={startSession.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide h-8"
                                    size="sm"
                                >
                                    <Play className="w-4 h-4 mr-1.5 fill-current" />
                                    {startSession.isPending ? "Starting..." : "Start Machine"}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Machine Content Area */}
                <div className="flex-1 overflow-hidden relative group">
                    {!isEnrolled ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
                            <Lock className="h-16 w-16 text-slate-800 mb-6 drop-shadow-lg" />
                            <h2 className="text-2xl font-black text-slate-300 mb-2">Access Denied</h2>
                            <p className="text-slate-500 max-w-sm">
                                You must join this room to interact with the target environment.
                            </p>
                        </div>
                    ) : !hasActiveMachine ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-80 mix-blend-overlay" style={{ backgroundSize: '100px' }}>
                            <div className="relative z-10 flex flex-col items-center">
                                <TerminalSquare className="h-16 w-16 text-slate-700 mb-6 drop-shadow-lg" />
                                <h2 className="text-2xl font-black text-slate-300 mb-2">Machine Offline</h2>
                                <p className="text-slate-500 max-w-md">
                                    Click "Start Machine" above to provision your isolated target environment. Once active, you'll be given an IP address to attack.
                                </p>
                            </div>
                            <div className="absolute inset-0 bg-slate-950 pointer-events-none -z-10" />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-black relative flex flex-col items-center justify-center text-center p-8">
                            <AlertCircle className="w-16 h-16 text-emerald-500/50 mb-4 animate-pulse" />
                            <h3 className="text-xl font-bold text-emerald-400 mb-2 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
                                Connection Established
                            </h3>
                            <p className="text-slate-400 max-w-lg mb-6 leading-relaxed">
                                The machine is running. Connect to it via your provided OpenVPN profile or use the web terminal below.
                                <br /><br />
                                <span className="text-slate-300 font-mono bg-slate-900 border border-slate-700 px-3 py-1 rounded-md text-sm">Target IP: {activeSession.ipAddress || "Waiting for DHCP..."}</span>
                            </p>

                            {/* Placeholder for Interactive Terminal/Guacamole */}
                            <div className="w-full max-w-3xl h-64 border border-slate-800 rounded-xl bg-slate-900 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 w-full h-8 bg-slate-950 border-b border-slate-800 flex items-center px-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                                    </div>
                                </div>
                                <TerminalSquare className="w-10 h-10 text-slate-700 mb-3" />
                                <p className="text-sm font-medium text-slate-500 font-mono text-center px-4">
                                    [Interactive Terminal Interface]<br />
                                    (To be integrated via xterm.js or Guacamole)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
