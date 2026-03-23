"use client";

import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { socketInstance } from "@/lib/socket";
import { logger } from "@/lib/logger";

interface LabTerminalProps {
    instanceId: string;
    roomId: string;
}

export const LabTerminal: React.FC<LabTerminalProps> = ({ instanceId, roomId }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const wsRef = useRef<any>(null);

    useEffect(() => {
        if (!terminalRef.current || !instanceId || !roomId) return;

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

        // Establish Socket.IO connection
        const initSocket = async () => {
            try {
                const socket = await socketInstance.connectWithQuery("/lab", {
                    instanceId,
                    roomId
                });
                
                wsRef.current = socket;

                if (!isMounted) {
                    socket.disconnect();
                    return;
                }

                logger.debug("Terminal Socket.IO connected");
                
                // Sync size after connection is established
                setTimeout(() => {
                    if (isMounted && socket.connected && term.cols > 0) {
                        try {
                            fitAddon.fit();
                            socket.emit("resize", {
                                cols: term.cols,
                                rows: term.rows
                            });
                        } catch (e) {}
                    }
                }, 300);

                socket.on("output", (data: any) => {
                    if (isMounted) {
                        if (data instanceof ArrayBuffer) {
                            term.write(new Uint8Array(data));
                        } else if (typeof data === "string") {
                            term.write(data);
                        } else {
                            term.write(new Uint8Array(data));
                        }
                    }
                });

                socket.on("disconnect", () => {
                    if (isMounted) {
                        logger.info("Terminal Socket.IO closed");
                    }
                });

                // Send data from xterm to WebSocket
                term.onData((data) => {
                    if (socket.connected) {
                        socket.emit("data", data);
                    }
                });

            } catch (error) {
                logger.error(error, "Socket connect exception");
                if (isMounted) term.writeln("\r\n\x1b[31m[Socket Connection Error]\x1b[0m\r\n");
            }
        };

        initSocket();

        // Handle resizing with ResizeObserver
        const handleResize = () => {
            if (isMounted && container.clientWidth > 0 && container.clientHeight > 0) {
                try {
                    if (term.element && (term as any)._core?._renderService?._renderer) {
                        fitAddon.fit();
                        if (wsRef.current?.connected) {
                            wsRef.current.emit("resize", {
                                cols: term.cols,
                                rows: term.rows
                            });
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
            if (wsRef.current) {
                wsRef.current.disconnect();
            }
            term.dispose();
            xtermRef.current = null;
        };
    }, [instanceId, roomId]);

    return (
        <div className="w-full h-full min-h-[500px] bg-[#020617] overflow-hidden relative border border-slate-800/50 rounded-xl shadow-2xl">
            {/* Subtle top highlight */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent pointer-events-none" />
            <div ref={terminalRef} className="absolute inset-0 p-4" />
        </div>
    );
};
