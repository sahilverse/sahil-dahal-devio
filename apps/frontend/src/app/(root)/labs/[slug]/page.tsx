"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetchLab, useFetchChallenges, useSubmitFlag, useFetchActiveSession, useStartSession, useExtendSession, useTerminateSession, useFetchEnrollment, useJoinRoom } from "@/hooks/useLabs";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAppSelector } from "@/store/hooks";
import { Shield, Lock, Unlock, Flag, Clock, HardDrive, TerminalSquare, AlertCircle, Play, Square, Plus, Maximize2, Minimize2, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { LabTerminal } from "@/components/labs/LabTerminal";
import { ConfirmModal } from "@/components/ui/modals/ConfirmModal";

export default function RoomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { openLogin } = useAuthModal();
    const { user } = useAppSelector((state) => state.auth);

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
    const [isFocused, setIsFocused] = useState(false);
    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
    const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});

    if (isLoadingRoom) return <div className="p-10 text-center animate-pulse">Loading Room...</div>;
    if (!room) return <div className="p-10 text-center text-red-500">Room not found.</div>;

    const isEnrolled = !!enrollment;
    const hasActiveMachine = activeSession && activeSession.status === "RUNNING";

    const handleJoin = () => {
        if (!user) {
            openLogin();
            return;
        }
        joinRoom.mutate(room.id);
    };

    const handleSubmitFlag = (challengeId: string) => {
        if (!flagAnswers[challengeId]) return;
        submitFlag.mutate({ challengeId, answer: flagAnswers[challengeId] });
    };

    const toggleHint = (challengeId: string) => {
        setExpandedHints(prev => ({
            ...prev,
            [challengeId]: !prev[challengeId]
        }));
    };

    const handleConfirmExtend = () => {
        if (activeSession) {
            extendSession.mutate(activeSession.id);
        }
        setIsExtendModalOpen(false);
    };

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
            {/* Left Panel: Content & Tasks */}
            {!isFocused && (
                <div className="w-full lg:w-[480px] flex flex-col border-r border-border/50 shrink-0 h-full overflow-y-auto custom-scrollbar transition-all duration-300">
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
                                <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-white/10 uppercase tracking-tighter font-black">
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
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50 shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">Your Progress</span>
                                    <span className="text-xl font-black text-brand-primary">{enrollment.progress || 0}%</span>
                                </div>
                                <div className="w-1/2 bg-muted rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-brand-primary h-full rounded-full transition-all duration-700 ease-in-out"
                                        style={{ width: `${enrollment.progress || 0}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Room Description */}
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-black prose-a:text-brand-primary prose-strong:text-foreground">
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
                                                "border rounded-2xl p-5 transition-all duration-300",
                                                isSolved ? "bg-emerald-500/[0.03] border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]" : "bg-card border-border/50 hover:border-brand-primary/30"
                                            )}>
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-foreground">
                                                            Task {index + 1}: {challenge.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[10px] font-bold py-0 h-4 uppercase bg-muted/20">
                                                                {challenge.points} pts
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                                                {challenge.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isSolved ? (
                                                        <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/30 shrink-0 font-black">
                                                            <Unlock className="w-3 h-3 mr-1" />
                                                            SOLVED
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-muted-foreground/60 shrink-0 font-bold border-border/40">
                                                            PENDING
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mb-4">
                                                    <ReactMarkdown>{challenge.description}</ReactMarkdown>
                                                </div>

                                                {/* Hints Section */}
                                                {challenge.hints && challenge.hints.length > 0 && !isSolved && (
                                                    <div className="mt-4 mb-2">
                                                        <div
                                                            role="button"
                                                            onClick={() => toggleHint(challenge.id)}
                                                            className="w-fit p-0 h-auto text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1 -ml-0.5 cursor-pointer select-none"
                                                        >
                                                            <Lightbulb className="w-3 h-3" />
                                                            {expandedHints[challenge.id] ? "Hide Hint" : "Need a Hint?"}
                                                            {expandedHints[challenge.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                        </div>

                                                        {expandedHints[challenge.id] && (
                                                            <div className="mt-3 p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                                                {challenge.hints.map((hint, i) => (
                                                                    <div key={i} className="flex gap-2">
                                                                        <span className="text-brand-primary font-bold text-[10px] mt-0.5">•</span>
                                                                        <p className="text-[11px] leading-relaxed text-muted-foreground italic font-medium">
                                                                            {hint}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Flag Submission */}
                                                {challenge.type === "FLAG" && !isSolved && (
                                                    <div className="flex gap-2 mt-4">
                                                        <Input
                                                            placeholder="devio{flag_here}"
                                                            value={flagAnswers[challenge.id] || ""}
                                                            onChange={(e) => setFlagAnswers({ ...flagAnswers, [challenge.id]: e.target.value })}
                                                            className="font-mono bg-muted/30 focus-visible:ring-brand-primary h-10"
                                                        />
                                                        <Button
                                                            onClick={() => handleSubmitFlag(challenge.id)}
                                                            disabled={!flagAnswers[challenge.id] || submitFlag.isPending}
                                                            className="shrink-0 font-black h-10 px-6"
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
            )}

            {/* Right Panel: Target Machine / Interactive Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-[#020617] relative transition-all duration-300",
                isFocused ? "w-full" : "hidden lg:flex"
            )}>
                {/* Active Session Top Bar - Ultra Compact HUD */}
                <div className="h-16 shrink-0 bg-slate-900/60 backdrop-blur-2xl border-b border-slate-800/40 flex items-center justify-between px-3 z-10 transition-all">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsFocused(!isFocused)}
                            className="h-9 w-9 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all rounded-lg shrink-0"
                            title={isFocused ? "Show Tasks" : "Maximize Terminal"}
                        >
                            {isFocused ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>

                        <div className="flex flex-col shrink-0">
                            <span className="font-bold text-[8px] tracking-[0.2em] text-slate-500 uppercase leading-none mb-0.5">Target</span>
                            <div className="flex items-center gap-2">
                                <h2 className="font-mono text-xs font-black text-slate-100 uppercase tracking-tight">
                                    {hasActiveMachine ? activeSession.ipAddress || "..." : "---.---.---.---"}
                                </h2>
                                {hasActiveMachine && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        <span className="text-[7px] font-black text-emerald-400 tracking-widest uppercase">Live</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isEnrolled && (
                        <div className="flex items-center gap-2">
                            {hasActiveMachine ? (
                                <>
                                    <div className="flex flex-col items-end shrink-0 mr-1">
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.1em] leading-none mb-0.5">Remaining</span>
                                        <div className="flex items-center gap-1 text-amber-500 font-mono text-[11px] font-black">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {formatDistanceToNow(new Date(activeSession.expiresAt), { addSuffix: false })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 bg-slate-800/30 p-1 rounded-lg border border-slate-800/50 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsExtendModalOpen(true)}
                                            disabled={extendSession.isPending}
                                            className="h-8 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 px-2"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            {extendSession.isPending ? "..." : "Extend"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => terminateSession.mutate(activeSession.id)}
                                            disabled={terminateSession.isPending}
                                            className="h-8 rounded-md text-[9px] font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 text-white px-3"
                                        >
                                            <Square className="w-2 h-2 mr-1.5 fill-current" />
                                            End
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <Button
                                    onClick={() => startSession.mutate(room.id)}
                                    disabled={startSession.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-[0.1em] uppercase text-[10px] h-9 px-5 rounded-lg transition-all shadow-lg"
                                >
                                    <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                                    {startSession.isPending ? "Starting..." : "Start Machine"}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Machine Content Area */}
                <div className="flex-1 overflow-hidden relative group bg-black">
                    {!isEnrolled ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
                            <Lock className="h-16 w-16 text-slate-800 mb-6 drop-shadow-2xl" />
                            <h2 className="text-2xl font-black text-slate-300 mb-2 uppercase tracking-tighter">Access Denied</h2>
                            <p className="text-slate-500 max-w-sm text-sm font-medium">
                                You must join this room to interact with the target environment.
                            </p>
                            <Button onClick={handleJoin} className="mt-8 font-black uppercase tracking-widest text-xs px-8">Join Now</Button>
                        </div>
                    ) : !hasActiveMachine ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-80 mix-blend-overlay" style={{ backgroundSize: '100px' }}>
                            <div className="relative z-10 flex flex-col items-center">
                                <TerminalSquare className="h-20 w-20 text-slate-800 mb-8 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
                                <h2 className="text-3xl font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Machine Offline</h2>
                                <p className="text-slate-600 max-w-md text-sm font-bold leading-relaxed mb-8">
                                    Click "Start Machine" above to provision your isolated target environment. Once active, you'll be given a real-time Linux shell.
                                </p>
                                <div className="flex gap-4 opacity-30 grayscale pointer-events-none">
                                    <div className="h-1 bg-slate-800 w-12 rounded-full" />
                                    <div className="h-1 bg-slate-800 w-12 rounded-full" />
                                    <div className="h-1 bg-slate-800 w-12 rounded-full" />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-slate-950 pointer-events-none -z-10" />
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col">
                            {/* The Real Terminal */}
                            <div className="flex-1 bg-black">
                                <LabTerminal instanceId={activeSession.instanceId || ""} roomId={room.id} />
                            </div>

                            {/* Help Footer */}
                            {!isFocused && (
                                <div className="h-8 bg-slate-900/30 border-t border-slate-800/30 flex items-center px-6 justify-between">
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] flex items-center gap-2">
                                        Lab Orchestrator WebSocket Bridge Active
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[9px] font-mono text-slate-700">NODE: {activeSession.instanceId?.slice(0, 8)}</span>
                                        <span className="text-[9px] font-mono text-slate-700 uppercase leading-none">Ubuntu 22.04 LTS</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isExtendModalOpen}
                onClose={() => setIsExtendModalOpen(false)}
                onConfirm={handleConfirmExtend}
                title="Extend Session"
                description={
                    <div className="space-y-3">
                        <p>Are you sure you want to extend your lab session by <span className="text-foreground font-bold">30 minutes</span>?</p>
                        <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-lg flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Cost</span>
                            <span className="font-black text-brand-primary text-xl">50 Ciphers</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">This action will deduct ciphers from your balance and cannot be undone.</p>
                    </div>
                }
                confirmText="Extend"
                variant="brand"
                isPending={extendSession.isPending}
            />
        </div>
    );
}
