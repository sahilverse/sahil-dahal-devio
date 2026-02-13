import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { UserService } from '@/api/userService';
import { CommunityService } from '@/api/communityService';
import MentionList from './MentionList';

const debounce = (fn: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        return new Promise((resolve) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
                const result = await fn(...args);
                resolve(result);
            }, delay);
        });
    };
};

export const createUnifiedSuggestion = (pluginKey: any) => {
    const searchItems = async ({ query, trigger }: { query: string, trigger: string }): Promise<any[]> => {
        try {
            if (trigger === 'u/') {
                const users = await UserService.searchUsers(query, 5);
                return users.map(user => ({
                    ...user,
                    id: user.username,
                    label: user.username,
                    type: 'user'
                }));
            } else {
                const data = await CommunityService.searchCommunities(query, 5);
                const communities = data.communities || [];
                return communities.map((community: any) => ({
                    ...community,
                    id: community.name,
                    label: community.name,
                    type: 'community'
                }));
            }
        } catch (error) {
            return [];
        }
    };

    const debouncedSearchItems = debounce(searchItems, 250);

    return {
        pluginKey,
        findSuggestionMatch: (prop: { $position: any }) => {
            const { $position } = prop;
            const textBefore = $position.parent.textBetween(
                Math.max(0, $position.parentOffset - 256),
                $position.parentOffset,
                null,
                '\0'
            );

            const match = textBefore.match(/(?:^|\s)([ud]\/)([^\s]*)$/);

            if (!match) return null;

            const fullMatch = match[0];
            const trigger = match[1];
            const query = match[2];

            const leadingSpaceOffset = fullMatch.match(/^\s/) ? 1 : 0;
            const from = $position.pos - (fullMatch.length - leadingSpaceOffset);

            return {
                range: { from, to: $position.pos },
                query,
                text: fullMatch.slice(leadingSpaceOffset),
            };
        },

        items: async ({ query, editor }: { query: string, editor: any }): Promise<any[]> => {
            try {
                const { state } = editor;
                const { $from } = state.selection;
                const textContent = $from.parent.textBetween(
                    Math.max(0, $from.parentOffset - 10),
                    $from.parentOffset,
                    null,
                    '\0'
                );
                const triggerMatch = textContent.match(/([ud]\/)[^\s]*$/);
                const trigger = triggerMatch ? triggerMatch[1] : 'u/';

                if (!query) {
                    return [
                        {
                            id: 'searching',
                            username: trigger === 'u/' ? 'Type to search users...' : undefined,
                            name: trigger === 'd/' ? 'Type to search communities...' : undefined,
                            avatarUrl: null,
                            isPlaceholder: true
                        }
                    ];
                }

                return await debouncedSearchItems({ query, trigger }) as any[];
            } catch (error) {
                return [];
            }
        },

        command: ({ editor, range, props }: any) => {
            const nodeName = props.type === 'community' ? 'communityMention' : 'userMention';

            editor
                .chain()
                .focus()
                .insertContentAt(range, [
                    { type: nodeName, attrs: props },
                    { type: 'text', text: ' ' },
                ])
                .run();
        },

        render: () => {
            let component: any;
            let popup: any;

            return {
                onStart: (props: any) => {
                    component = new ReactRenderer(MentionList, {
                        props,
                        editor: props.editor,
                    });

                    if (!props.clientRect) return;

                    popup = tippy('body', {
                        getReferenceClientRect: props.clientRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                    });
                },

                onUpdate(props: any) {
                    component?.updateProps(props);

                    if (props.clientRect && popup?.[0]) {
                        popup[0].setProps({
                            getReferenceClientRect: props.clientRect,
                        });
                    }
                },

                onKeyDown(props: any) {
                    if (props.event.key === 'Escape') {
                        popup?.[0]?.hide();
                        return true;
                    }
                    return component?.ref?.onKeyDown(props) || false;
                },

                onExit() {
                    popup?.[0]?.destroy();
                    component?.destroy();
                    component = null;
                    popup = null;
                },
            };
        },
    };
};
