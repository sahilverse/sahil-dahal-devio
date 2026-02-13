import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Users } from 'lucide-react';

interface MentionListProps {
    items: any[];
    command: (item: any) => void;
}

const MentionList = forwardRef((props: MentionListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item && !item.isPlaceholder) {
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
        <div className="flex flex-col gap-0.5 p-1.5 bg-background/95 backdrop-blur-md border border-border/50 shadow-2xl rounded-xl overflow-hidden min-w-[240px] z-[9999]">
            {props.items.length > 0 ? (
                props.items.map((item: any, index: number) => (
                    <button
                        key={index}
                        onClick={() => selectItem(index)}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-all',
                            index === selectedIndex
                                ? 'bg-primary/10 text-foreground'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                    >
                        <Avatar className="size-8 rounded-lg">
                            <AvatarImage src={item.avatarUrl || item.iconUrl} alt={item.username || item.name} />
                            <AvatarFallback className="rounded-lg bg-muted flex items-center justify-center">
                                {item.username ? <User className="size-4" /> : <Users className="size-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                            <span className="text-[14px] font-semibold leading-tight truncate">
                                {item.username || item.name}
                            </span>
                            {(item.firstName || item.lastName) && (
                                <span className="text-[12px] text-muted-foreground/70 leading-tight truncate">
                                    {item.firstName} {item.lastName}
                                </span>
                            )}
                            {item.description && (
                                <span className="text-[12px] text-muted-foreground/70 leading-tight truncate max-w-[150px]">
                                    {item.description}
                                </span>
                            )}
                        </div>
                    </button>
                ))
            ) : (
                <div className="px-3 py-2 text-[13px] text-muted-foreground italic">No results found</div>
            )}
        </div>
    );
});

MentionList.displayName = 'MentionList';

export default MentionList;
