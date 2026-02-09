"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { socketInstance } from "@/lib/socket";
import api from "@/api/axios";
import { toast } from "sonner";

export interface TerminalLine {
    type: "stdout" | "stderr" | "error";
    text: string;
}

export function useCompiler() {
    const [isExecuting, setIsExecuting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<TerminalLine[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [lastLanguage, setLastLanguage] = useState<string | null>(null);
    const socketRef = useRef<any>(null);

    const appendOutput = useCallback((type: TerminalLine["type"], text: string) => {
        setOutput((prev) => [...prev, { type, text }]);
    }, []);

    const runCode = async (language: string, code: string) => {
        if (!code.trim()) return;

        let activeSessionId = sessionId;
        let isNewSession = false;

        if (!activeSessionId || language !== lastLanguage) {
            activeSessionId = uuidv4();
            setSessionId(activeSessionId);
            setLastLanguage(language);
            isNewSession = true;
        }

        setIsExecuting(true);
        setIsLoading(true);
        setOutput([]);

        try {
            if (isNewSession) {

                const socket = await socketInstance.connectWithQuery("/compiler", {
                    sessionId: activeSessionId
                });
                socketRef.current = socket;

                //  Listen for output
                socket.on("output", (data: { type: string; data: any }) => {
                    if (data.type === 'stdout' || data.type === 'stderr') {
                        appendOutput(data.type, data.data);
                        setIsLoading(false);
                    }

                    if (data.type === 'exit' || data.type === 'error') {
                        setIsExecuting(false);
                        setIsLoading(false);
                    }
                });

                socket.on("connect_error", (err: any) => {
                    appendOutput("error", `Connection failed: ${err.message}\n`);
                    setIsExecuting(false);
                    setIsLoading(false);
                });
            }

            // Trigger Execution via REST
            const response = await api.post("/compiler/execute", {
                language,
                code,
                sessionId: activeSessionId,
            });

            if (!response.data.success) {
                appendOutput("error", `Execution failed: ${response.data.message}\n`);
                setIsExecuting(false);
                setIsLoading(false);
            }

        } catch (err: any) {
            const message = err.response?.data?.message || err.message;
            appendOutput("error", `Error: ${message}\n`);
            setIsExecuting(false);
            setIsLoading(false);
            toast.error("Failed to start execution");
        }
    };

    const sendInput = useCallback((input: string) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("input", input);
            appendOutput("stdout", input);
        }
    }, [appendOutput]);

    const clearOutput = useCallback(() => {
        setOutput([]);
    }, []);

    // Cleanup on unmount 
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (sessionId) {
                api.post(`/compiler/${sessionId}/end`).catch(() => { });
            }
        };
    }, [sessionId]);

    return {
        isExecuting,
        isLoading,
        output,
        runCode,
        sendInput,
        clearOutput,
        sessionId
    };
}
