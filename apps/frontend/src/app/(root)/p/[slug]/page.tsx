"use client";

import { useFetchProblem } from "@/hooks/useProblems";
import { ProblemWorkspace } from "@/components/problems/ProblemWorkspace";
import { Loader2, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function ProblemPage() {
    const params = useParams();
    const slug = params.slug as string;

    const { data: problem, isLoading, error } = useFetchProblem(slug);

    if (isLoading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-card">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary mb-4" />
                <p className="text-sm text-muted-foreground font-medium">Loading problem details...</p>
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-card p-4 text-center">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Failed to load problem</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    We couldn't retrieve the problem details. It might have been deleted or the URL is incorrect.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-brand-primary text-white rounded-lg font-bold hover:opacity-90 transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return <ProblemWorkspace problem={problem} />;
}
