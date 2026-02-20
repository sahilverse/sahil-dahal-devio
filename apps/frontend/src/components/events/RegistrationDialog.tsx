"use client";

import React, { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/store/hooks";
import { EventService } from "@/api/eventService";
import { toast } from "sonner";
import { Trophy, ShieldCheck, AlertCircle, Loader2, CheckCircle2, XCircle, Ban, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface RegistrationDialogProps {
    event: any;
    onSuccess?: () => void;
}

type ButtonState = {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "ghost";
    disabled: boolean;
    canOpenDialog: boolean;
};

export const RegistrationDialog: React.FC<RegistrationDialogProps> = ({ event, onSuccess }) => {
    const { user } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [teamName, setTeamName] = useState("");

    const userAura = user?.aura || 0;
    const hasEnoughAura = user ? (user.aura ?? 0) >= (event.minAuraPoints ?? 0) : false;
    const isRegistered = !!event.isParticipant;
    const now = new Date();
    const isDeadlinePassed = event.registrationDeadline && now > new Date(event.registrationDeadline);
    const isEventEnded = event.status === "COMPLETED" || (event.endsAt && now > new Date(event.endsAt));
    const isEventFull = event.maxParticipants && (event.participantCount || 0) >= event.maxParticipants;

    const buttonState = useMemo((): ButtonState => {
        if (isRegistered) {
            return { text: "✅ Registered", variant: "secondary", disabled: true, canOpenDialog: false };
        }
        if (isEventEnded) {
            return { text: "Event Ended", variant: "outline", disabled: true, canOpenDialog: false };
        }
        if (isDeadlinePassed) {
            return { text: "Registration Closed", variant: "outline", disabled: true, canOpenDialog: false };
        }
        if (isEventFull) {
            return { text: "Event Full", variant: "outline", disabled: true, canOpenDialog: false };
        }
        if (!hasEnoughAura) {
            return { text: "Register Now", variant: "default", disabled: true, canOpenDialog: false };
        }
        return { text: "Register Now", variant: "default", disabled: false, canOpenDialog: true };
    }, [isRegistered, isEventEnded, isDeadlinePassed, isEventFull, hasEnoughAura]);

    const handleRegister = async () => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        setIsLoading(true);
        try {
            await EventService.registerForEvent(event.id, {
                teamName: event.requiresTeam ? teamName : undefined,
            });
            toast.success("Successfully registered for event!");
            setIsOpen(false);
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.errorMessage || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={buttonState.variant}
                    className="w-full font-bold h-12 text-lg shadow-lg"
                    disabled={buttonState.disabled}
                    onClick={(e) => {
                        if (!user) {
                            e.preventDefault();
                            router.push("/auth/login");
                            return;
                        }
                        if (!buttonState.canOpenDialog) {
                            e.preventDefault();
                        }
                    }}
                >
                    {buttonState.text}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Join {event.title}
                    </DialogTitle>
                    <DialogDescription>
                        Confirm your participation and get ready to compete.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Requirements Check */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Aura Points
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={hasEnoughAura ? "text-green-500 font-bold" : "text-destructive font-bold"}>
                                    {event.minAuraPoints} Req
                                </span>
                                <span className="text-xs text-muted-foreground">Yours: {userAura}</span>
                            </div>
                        </div>

                        {event.entryCipherCost > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    Entry Fee
                                </div>
                                <span className="font-bold">{event.entryCipherCost} Cipher</span>
                            </div>
                        )}
                    </div>

                    {!hasEnoughAura && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>You need {event.minAuraPoints - userAura} more Aura points to join this event.</span>
                        </div>
                    )}

                    {event.requiresTeam && (
                        <div className="space-y-2">
                            <Label htmlFor="teamName">Team Name</Label>
                            <Input
                                id="teamName"
                                placeholder="Enter your team name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Team size: {event.teamSize || 1} members
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button

                        onClick={handleRegister}
                        disabled={isLoading || !hasEnoughAura || (event.requiresTeam && !teamName)}
                        className="font-bold"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
