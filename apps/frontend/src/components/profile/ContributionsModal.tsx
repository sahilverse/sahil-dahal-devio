import { X } from "lucide-react";

interface ContributionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contributions: {
        total: number;
        posts: number;
        comments: number;
    };
}

export default function ContributionsModal({ isOpen, onClose, contributions }: ContributionsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-card border rounded-lg shadow-lg p-6 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Contributions</h2>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="p-4 bg-secondary/50 rounded-lg flex flex-col items-center justify-center gap-1">
                            <span className="text-3xl font-bold text-primary">{contributions.posts}</span>
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Posts</span>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-lg flex flex-col items-center justify-center gap-1">
                            <span className="text-3xl font-bold text-primary">{contributions.comments}</span>
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Comments</span>
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center">
                            Contribution stats are updated every week.
                        </p>
                    </div>
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
