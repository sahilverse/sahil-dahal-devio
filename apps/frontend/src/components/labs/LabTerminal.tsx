"use client";

import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { LAB_ORCHESTRATOR_URL } from "@/lib/constants";
import { logger } from "@/lib/logger";

interface LabTerminalProps {
    instanceId: string;
}

export const LabTerminal: React.FC<LabTerminalProps> = ({ instanceId }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!terminalRef.current || !instanceId) return;

        let isMounted = true;
        const container = terminalRef.current;

        // Initialize xterm with premium settings
        const term = new Terminal({
            cursorBlink: true,
            cursorStyle: "block",
            convertEol: true,
            lineHeight: 1.15,
            letterSpacing: 0,
            theme: {
                background: "#020617", // deep slate
                foreground: "#cbd5e1", // slate-300
                cursor: "#10b981",     // emerald-500
                selectionBackground: "rgba(16, 185, 129, 0.3)",
                black: "#020617",
                red: "#f43f5e",
                green: "#10b981",
                yellow: "#f59e0b",
                blue: "#3b82f6",
                magenta: "#a855f7",
                cyan: "#06b6d4",
                white: "#f8fafc",
            },
            fontFamily: "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
            fontSize: 13,
            allowProposedApi: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        
        xtermRef.current = term;

        // Wait for a solid paint before opening and fitting
        const fitRaf = requestAnimationFrame(() => {
            if (isMounted && container && container.clientWidth > 0 && container.clientHeight > 0) {
                try {
                    term.open(container);
                    // Give it a moment to render before fitting
                    setTimeout(() => {
                        if (isMounted) {
                            fitAddon.fit();
                            term.focus();
                        }
                    }, 100);
                } catch (e) {
                    logger.error(e, "Initial terminal open/fit failed:");
                }
            }
        });

        // Establish WebSocket connection
        const wsUrl = new URL(LAB_ORCHESTRATOR_URL || "http://localhost:5500");
        wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
        wsUrl.pathname = "/terminal";
        wsUrl.searchParams.set("instanceId", instanceId);

        const socket = new WebSocket(wsUrl.toString());
        wsRef.current = socket;

        socket.onopen = () => {
            if (isMounted) {
                logger.debug("Terminal WebSocket connected");
                term.writeln("\x1b[32m[Connected to Devio Lab System]\x1b[0m");
                
                // Sync size after connection is established
                setTimeout(() => {
                    if (isMounted && socket.readyState === WebSocket.OPEN && term.cols > 0) {
                        try {
                            fitAddon.fit();
                            const payload = JSON.stringify({
                                type: "resize",
                                cols: term.cols,
                                rows: term.rows
                            });
                            socket.send(payload);
                        } catch (e) {
                            // Ignore
                        }
                    }
                }, 300);
            }
        };

        socket.onmessage = (event) => {
            if (isMounted) {
                if (event.data instanceof Blob) {
                    event.data.arrayBuffer().then(buffer => {
                        if (isMounted) {
                            term.write(new Uint8Array(buffer));
                        }
                    });
                } else {
                    term.write(event.data);
                }
            }
        };

        socket.onclose = () => {
            if (isMounted) {
                logger.info("Terminal WebSocket closed");
                term.writeln("\r\n\x1b[31m[Connection Closed]\x1b[0m\r\n");
            }
        };

        socket.onerror = (error: any) => {
            if (isMounted) {
                logger.error(error, "Terminal WebSocket error:");
                term.writeln("\r\n\x1b[31m[Connection Error]\x1b[0m\r\n");
            }
        };

        // Send data from xterm to WebSocket
        term.onData((data) => {
            if (socket.readyState === WebSocket.OPEN) {
                const payload = JSON.stringify({ type: "data", data });
                socket.send(payload);
            }
        });

        // Handle resizing with ResizeObserver
        const handleResize = () => {
            if (isMounted && container.clientWidth > 0 && container.clientHeight > 0) {
                try {
                    if (term.element && (term as any)._core?._renderService?._renderer) {
                        fitAddon.fit();
                        if (socket.readyState === WebSocket.OPEN) {
                            const payload = JSON.stringify({
                                type: "resize",
                                cols: term.cols,
                                rows: term.rows
                            });
                            socket.send(payload);
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            }
        };

        term.onResize((size) => {
            logger.debug(size, "Terminal resized local:");
        });

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(handleResize);
        });

        resizeObserver.observe(container);

        return () => {
            isMounted = false;
            cancelAnimationFrame(fitRaf);
            resizeObserver.disconnect();
            socket.close();
            term.dispose();
            xtermRef.current = null;
        };
    }, [instanceId]);

    return (
        <div className="w-full h-full min-h-[500px] bg-[#020617] overflow-hidden relative border border-slate-800/50 rounded-xl shadow-2xl">
            {/* Subtle top highlight */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent pointer-events-none" />
            <div ref={terminalRef} className="absolute inset-0 p-4" />
        </div>
    );
};
