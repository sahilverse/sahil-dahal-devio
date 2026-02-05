interface DifficultyRowProps {
    label: string;
    value: number;
    bgClass: string;
}

export default function DifficultyRow({ label, value, bgClass }: DifficultyRowProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${bgClass}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}
