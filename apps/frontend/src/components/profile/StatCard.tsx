export default function StatCard({ label, value, onClick, isInteractive }: { label: string; value: string | number; onClick?: () => void; isInteractive?: boolean }) {
    return (
        <div
            onClick={onClick}
            className={`
                flex flex-col 
                ${isInteractive ? "cursor-pointer hover:opacity-75 transition-opacity" : "cursor-default"}
            `}
        >
            <span className="text-xs font-semibold tracking-wide text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
        </div>
    );
}