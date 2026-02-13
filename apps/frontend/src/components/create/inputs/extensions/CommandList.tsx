import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { cn } from '@/lib/utils';

const CommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];

        if (item) {
            props.command(item);
        }
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
                return true;
            }

            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length);
                return true;
            }

            if (event.key === 'Enter') {
                selectItem(selectedIndex);
                return true;
            }

            return false;
        },
    }));

    return (
        <div className="flex flex-col gap-1 p-2 bg-background border border-border/50 shadow-soft rounded-xl overflow-hidden min-w-[280px]">
            {props.items.length > 0 ? (
                props.items.map((item: any, index: number) => (
                    <button
                        key={index}
                        onClick={() => selectItem(index)}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-all',
                            index === selectedIndex
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                    >
                        <div className={cn(
                            "flex items-center justify-center size-9 rounded-lg border border-border/10",
                            index === selectedIndex ? "bg-background shadow-sm" : "bg-muted/30"
                        )}>
                            <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-semibold leading-none">{item.title}</span>
                            <span className="text-[11px] text-muted-foreground/60 leading-none">{item.description}</span>
                        </div>
                    </button>
                ))
            ) : (
                <div className="px-3 py-2 text-[13px] text-muted-foreground">No results found</div>
            )}
        </div>
    );
});

CommandList.displayName = 'CommandList';

export default CommandList;
